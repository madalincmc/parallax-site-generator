// The one WebGL stage of the site: one renderer, one scene, one camera. Every section's act lives
// in the same scene, and the engine carries the camera, the thread and the mood from act to act
// as the page scrolls, so sections read as one continuous world instead of separate embeds.
import * as THREE from "three";
import type { Clock } from "./clock";
import type { Act, ActLoader, CameraPose, Frame, Mood, ThreadPose, World, WorldFactory } from "./types";

const MAX_PIXEL_RATIO = 1.5;
const SLOW_FRAME_MS = 24; // below ~40 fps
const FRAMES_PER_QUALITY_CHECK = 60;
const QUALITY_STEP = 0.8;
const MIN_PIXEL_RATIO = 0.6;
const MAX_FRAME_GAP_MS = 250; // longer gaps are tab switches or hitches, not rendering speed
const POINTER_DAMPING = 4;
const STILL_TIME = 6;
const MAX_FOV = 78;

const smoother = (x: number) => x * x * x * (x * (x * 6 - 15) + 10);

export async function createEngine(options: {
  el: HTMLElement;
  clock: Clock;
  createWorld: WorldFactory;
  acts: Record<string, ActLoader>;
  onProgress?(share: number): void;
}) {
  const { el, clock, createWorld, acts: loaders, onProgress } = options;
  const renderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: false,
    powerPreference: "high-performance",
  });
  renderer.toneMapping = THREE.ACESFilmicToneMapping;

  const canvas = renderer.domElement;
  canvas.setAttribute("aria-hidden", "true");
  Object.assign(canvas.style, { width: "100%", height: "100%", display: "block" });
  el.append(canvas);

  let width = Math.max(1, el.clientWidth);
  let height = Math.max(1, el.clientHeight);
  let pixelRatio = Math.min(window.devicePixelRatio || 1, MAX_PIXEL_RATIO);
  renderer.setPixelRatio(pixelRatio);
  renderer.setSize(width, height, false);

  const isPhone = width < 700;
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(40, width / height, 0.05, 600);
  const world: World = createWorld({ scene, renderer, isPhone });
  const background = new THREE.Color(world.mood.background);
  const fog = new THREE.FogExp2(world.mood.fog, world.mood.fogDensity);
  scene.background = background;
  scene.fog = fog;

  // Sections, in page order, each with its act.
  const slugs = clock.sections().map((span) => span.slug);
  const missing = slugs.filter((slug) => !loaders[slug]);
  if (missing.length) throw new Error(`No act registered for: ${missing.join(", ")}`);

  let loaded = 0;
  const acts: Act[] = await Promise.all(
    slugs.map(async (slug) => {
      const { default: factory } = await loaders[slug]();
      onProgress?.(++loaded / (slugs.length + 1));
      return factory(world);
    }),
  );
  for (const act of acts) {
    act.group.visible = false;
    scene.add(act.group);
  }
  // Compile every shader up front, so a new section never hitches when it first scrolls in.
  await renderer.compileAsync(scene, camera);
  onProgress?.(1);

  const pointer = { x: 0, y: 0 };
  const pointerTarget = { x: 0, y: 0 };
  let time = 0;
  let lastNow: number | null = null;
  let contextLost = false;
  let slowFrames = 0;
  let measured = 0;
  let lastStill = "";

  const scratch = {
    a: new THREE.Vector3(),
    b: new THREE.Vector3(),
    qa: new THREE.Quaternion(),
    qb: new THREE.Quaternion(),
    e: new THREE.Euler(),
    color: new THREE.Color(),
    right: new THREE.Vector3(),
    up: new THREE.Vector3(),
  };

  const cameraFor = (frame: Frame, aspect: number): CameraPose => {
    const from = acts[frame.a].camera(frame.pA, aspect);
    if (frame.a === frame.b) return from;
    const to = acts[frame.b].camera(frame.pB, aspect);
    const k = smoother(frame.w);
    const mix = (x: number, y: number) => x + (y - x) * k;
    return {
      position: [mix(from.position[0], to.position[0]), mix(from.position[1], to.position[1]), mix(from.position[2], to.position[2])],
      target: [mix(from.target[0], to.target[0]), mix(from.target[1], to.target[1]), mix(from.target[2], to.target[2])],
      fov: mix(from.fov ?? 40, to.fov ?? 40),
    };
  };

  const placeCamera = (frame: Frame) => {
    const aspect = width / height;
    const pose = cameraFor(frame, aspect);
    camera.position.set(...pose.position);
    scratch.a.set(...pose.target);
    camera.up.set(0, 1, 0);
    camera.lookAt(scratch.a);
    const sway = isPhone ? 0 : (world.pointerSway ?? 0.1);
    if (sway) {
      scratch.right.setFromMatrixColumn(camera.matrixWorld, 0);
      scratch.up.setFromMatrixColumn(camera.matrixWorld, 1);
      camera.position.addScaledVector(scratch.right, pointer.x * sway);
      camera.position.addScaledVector(scratch.up, pointer.y * sway * 0.6);
      camera.lookAt(scratch.a);
    }
    // Hold the horizontal view on narrow screens, or portrait crops subjects at the sides.
    const base = pose.fov ?? 40;
    const widen = aspect < 16 / 9 ? Math.pow((16 / 9) / aspect, 0.62) : 1;
    const fov = THREE.MathUtils.radToDeg(2 * Math.atan(Math.tan(THREE.MathUtils.degToRad(base / 2)) * widen));
    camera.fov = Math.min(fov, MAX_FOV);
    camera.aspect = aspect;
    camera.updateProjectionMatrix();
  };

  const placeThread = (frame: Frame) => {
    const thread = world.thread;
    if (!thread) return;
    const aspect = width / height;
    const from: ThreadPose | undefined = acts[frame.a].thread?.(frame.pA, aspect);
    const to: ThreadPose | undefined = frame.a === frame.b ? from : acts[frame.b].thread?.(frame.pB, aspect);
    if (!from && !to) {
      thread.visible = false;
      return;
    }
    thread.visible = true;
    const start = from ?? to!;
    const end = to ?? from!;
    const k = frame.a === frame.b ? 0 : smoother(frame.w);
    scratch.a.set(...start.position).lerp(scratch.b.set(...end.position), k);
    thread.position.copy(scratch.a);
    scratch.qa.setFromEuler(scratch.e.set(...start.rotation));
    scratch.qb.setFromEuler(scratch.e.set(...end.rotation));
    thread.quaternion.copy(scratch.qa).slerp(scratch.qb, k);
    thread.scale.setScalar(start.scale + (end.scale - start.scale) * k);
  };

  const placeMood = (frame: Frame) => {
    const from: Mood = acts[frame.a].mood?.(frame.pA) ?? world.mood;
    const to: Mood = frame.a === frame.b ? from : (acts[frame.b].mood?.(frame.pB) ?? world.mood);
    const k = frame.a === frame.b ? 0 : smoother(frame.w);
    background.set(from.background).lerp(scratch.color.set(to.background), k);
    fog.color.set(from.fog).lerp(scratch.color.set(to.fog), k);
    fog.density = from.fogDensity + (to.fogDensity - from.fogDensity) * k;
  };

  const draw = (frame: Frame, dt: number) => {
    placeCamera(frame);
    placeThread(frame);
    placeMood(frame);
    const k = frame.a === frame.b ? 0 : smoother(frame.w);
    const aspect = width / height;
    const shared = { t: time, dt, pointer, aspect, isPhone };
    world.update?.({ ...shared, y: frame.y });
    acts.forEach((act, i) => {
      const on = i === frame.a || i === frame.b;
      act.group.visible = on;
      if (!on) return;
      const p = i === frame.a ? frame.pA : frame.pB;
      act.update?.({ ...shared, p, weight: i === frame.a ? 1 - k : k });
    });
    renderer.render(scene, camera);
  };

  const applySize = () => {
    renderer.setPixelRatio(pixelRatio);
    renderer.setSize(width, height, false);
    lastStill = "";
  };

  const adaptQuality = (ms: number) => {
    measured++;
    if (ms > SLOW_FRAME_MS) slowFrames++;
    if (measured < FRAMES_PER_QUALITY_CHECK) return;
    const slow = slowFrames > measured / 2;
    measured = 0;
    slowFrames = 0;
    if (slow && pixelRatio * QUALITY_STEP >= MIN_PIXEL_RATIO) {
      pixelRatio *= QUALITY_STEP;
      applySize();
    }
  };

  let seeking = false;
  const offFrame = clock.onFrame((frame, now) => {
    if (seeking || contextLost) return;
    if (frame.still) {
      const key = `${frame.a}`;
      if (key === lastStill) return;
      lastStill = key;
      time = STILL_TIME;
      draw(frame, 0);
      return;
    }
    const ms = lastNow === null ? 0 : now - lastNow;
    lastNow = now;
    const gapped = ms > MAX_FRAME_GAP_MS;
    const dt = gapped ? 0 : ms / 1000;
    time += dt;
    const k = 1 - Math.exp(-POINTER_DAMPING * dt);
    pointer.x += (pointerTarget.x - pointer.x) * k;
    pointer.y += (pointerTarget.y - pointer.y) * k;
    draw(frame, dt);
    if (ms > 0 && !gapped) adaptQuality(ms);
  });

  const onPointer = (event: PointerEvent) => {
    if (event.pointerType === "touch") return; // touches are scrolling, not pointing
    pointerTarget.x = (event.clientX / window.innerWidth) * 2 - 1;
    pointerTarget.y = 1 - (event.clientY / window.innerHeight) * 2;
  };
  const resizeObserver = new ResizeObserver(() => {
    const w = Math.max(1, el.clientWidth);
    const h = Math.max(1, el.clientHeight);
    if (w === width && h === height) return;
    width = w;
    height = h;
    applySize();
  });
  const onLost = (event: Event) => {
    event.preventDefault();
    contextLost = true;
  };
  const onRestored = () => {
    contextLost = false;
    lastStill = "";
  };
  window.addEventListener("pointermove", onPointer, { passive: true });
  resizeObserver.observe(el);
  canvas.addEventListener("webglcontextlost", onLost);
  canvas.addEventListener("webglcontextrestored", onRestored);

  return {
    // Everything below the first three lines of this object exists for scripts/check.mjs.
    renderer,
    /** Times real GPU work per section, reading a pixel back so the GPU has to finish. */
    bench(framesPerSection: number) {
      seeking = true;
      const gl = renderer.getContext();
      const pixel = new Uint8Array(4);
      const results = clock.sections().map((span, index) => {
        const times: number[] = [];
        for (let i = 0; i < framesPerSection; i++) {
          const p = i / Math.max(1, framesPerSection - 1);
          time += 1 / 60;
          const start = performance.now();
          draw({ y: span.top, a: index, b: index, pA: p, pB: p, w: 0, still: false }, 1 / 60);
          gl.readPixels(0, 0, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, pixel);
          times.push(performance.now() - start);
        }
        times.sort((x, y) => x - y);
        return {
          slug: span.slug,
          median: times[Math.floor(times.length / 2)],
          p95: times[Math.floor(times.length * 0.95)],
          calls: renderer.info.render.calls,
          triangles: renderer.info.render.triangles,
        };
      });
      seeking = false;
      return { gpu: gpuName(gl), results };
    },
    /** Where the camera would be at a scroll position, without drawing. */
    cameraAt(y: number) {
      const pose = cameraFor(clock.frameAt(y), width / height);
      return pose;
    },
    destroy() {
      offFrame();
      resizeObserver.disconnect();
      window.removeEventListener("pointermove", onPointer);
      canvas.removeEventListener("webglcontextlost", onLost);
      canvas.removeEventListener("webglcontextrestored", onRestored);
      acts.forEach((act) => act.dispose?.());
      world.dispose?.();
      scene.traverse((object) => {
        const mesh = object as THREE.Mesh;
        mesh.geometry?.dispose?.();
        const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
        materials.forEach((material) => material?.dispose?.());
      });
      renderer.dispose();
      renderer.forceContextLoss();
      canvas.remove();
    },
  };
}

function gpuName(gl: WebGLRenderingContext | WebGL2RenderingContext) {
  const info = gl.getExtension("WEBGL_debug_renderer_info");
  return info ? String(gl.getParameter(info.UNMASKED_RENDERER_WEBGL)) : "unknown";
}

export type Engine = Awaited<ReturnType<typeof createEngine>>;
