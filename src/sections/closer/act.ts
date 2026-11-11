// Arrival. Dusk turns to night. The plane sinks through the last of the cloud, the gear comes down, and
// the runway appears: approach lights running toward the threshold, edge lights to the horizon, a town
// glowing around the airfield. It touches down as the camera rises behind it for the call to action.
import * as THREE from "three";
import { fbm2, lerp, rng, segment, smooth, track } from "@/stage/kit";
import type { ActFactory, Mood, Vec3 } from "@/stage/types";
import { GROUND_Y, moodAt, planeOf, RUNWAY_Z } from "@/site/world";

const planeZ = (p: number) => lerp(-400, -512, 1 - Math.pow(1 - p, 1.5));
/** 0 at cruise, 1 on the runway. */
const descent = (z: number) => smooth(Math.min(1, Math.max(0, (-410 - z) / 100)));
const planeY = (z: number) => lerp(0, GROUND_Y + 0.95, descent(z));

function buildLights(isPhone: boolean) {
  const position: number[] = [];
  const color: number[] = [];
  const spec: number[] = [];
  const y = GROUND_Y + 0.18;
  const add = (x: number, z: number, c: [number, number, number], size: number, kind = 0, phase = 0) => {
    position.push(x, y, z);
    color.push(...c);
    spec.push(size, kind, phase);
  };
  const WHITE: [number, number, number] = [1, 0.96, 0.86];
  const GREEN: [number, number, number] = [0.2, 1, 0.45];
  const RED: [number, number, number] = [1, 0.16, 0.12];
  const BLUE: [number, number, number] = [0.25, 0.45, 1];
  // Runway edges and centreline.
  for (let z = RUNWAY_Z; z > RUNWAY_Z - 210; z -= 4) for (const x of [-5.3, 5.3]) add(x, z, WHITE, 0.95);
  for (let z = RUNWAY_Z - 3; z > RUNWAY_Z - 210; z -= 2.5) add(0, z, WHITE, 0.42);
  // Threshold bar, and touchdown-zone bars beyond it.
  for (let x = -5; x <= 5.01; x += 0.72) add(x, RUNWAY_Z, GREEN, 0.9);
  for (let z = RUNWAY_Z - 8; z > RUNWAY_Z - 62; z -= 6) for (const side of [-1, 1]) for (const dx of [1.7, 2.2, 2.7]) add(side * dx, z, WHITE, 0.4);
  // Approach lights: bars on the centreline, one wide crossbar, and a strobe running in toward the threshold.
  for (let k = 1; k <= 10; k++) {
    const z = RUNWAY_Z + k * 5.5;
    for (const x of [-1.3, -0.65, 0, 0.65, 1.3]) add(x, z, WHITE, 0.85);
    if (k === 5) for (let x = -4.6; x <= 4.61; x += 0.66) if (Math.abs(x) > 1.5) add(x, z, WHITE, 0.85);
    add(0, z, [1, 1, 1], 2.4, 2, k / 10);
  }
  // PAPI: two white, two red, left of the runway.
  [WHITE, WHITE, RED, RED].forEach((c, i) => add(-7.4 - i * 0.8, RUNWAY_Z - 22, c, 1.1));
  // A taxiway in blue, running parallel and joining the runway.
  for (let z = RUNWAY_Z - 20; z > RUNWAY_Z - 200; z -= 5) for (const x of [13, 15.4]) add(x, z, BLUE, 0.6);
  for (let x = 6.2; x < 13; x += 1.6) for (const dz of [-1.2, 1.2]) add(x, RUNWAY_Z - 70 + dz, BLUE, 0.6);
  // The town: warm lights along a loose street grid, in clusters.
  const r = rng(77);
  const count = isPhone ? 1300 : 3200;
  for (let i = 0; i < count * 3 && position.length / 3 < count + 400; i++) {
    let x = r.range(-280, 280);
    let z = r.range(RUNWAY_Z - 260, RUNWAY_Z + 80);
    if (Math.abs(x) < 26 && z < RUNWAY_Z + 70) continue;
    if (fbm2(x * 0.012 + 3, z * 0.012) + 0.12 < r() * 0.5) continue;
    if (r() < 0.5) x = Math.round(x / 7) * 7;
    else z = Math.round(z / 7) * 7;
    const k = r();
    add(x, z, k < 0.78 ? [1, 0.72, 0.4] : k < 0.95 ? [0.95, 0.95, 1] : RED, r.range(0.9, 1.7), 1, r() * 20);
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.Float32BufferAttribute(position, 3));
  geometry.setAttribute("color", new THREE.Float32BufferAttribute(color, 3));
  geometry.setAttribute("spec", new THREE.Float32BufferAttribute(spec, 3));
  const uniforms = { uTime: { value: 0 }, uHeight: { value: 800 }, uFade: { value: 1 } };
  const material = new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    uniforms,
    vertexShader: /* glsl */ `
      attribute vec3 color; attribute vec3 spec;
      uniform float uTime, uHeight, uFade;
      varying vec3 vC; varying float vA;
      void main() {
        vec4 mv = modelViewMatrix * vec4(position, 1.0);
        gl_Position = projectionMatrix * mv;
        float dist = max(0.1, -mv.z);
        float k = 1.0;
        if (spec.y > 0.5 && spec.y < 1.5) k = 0.7 + 0.3 * sin(uTime * (0.6 + fract(spec.z) * 1.8) + spec.z * 6.0);
        if (spec.y > 1.5) k = 2.6 * smoothstep(0.1, 0.0, abs(fract(uTime * 0.9 + spec.z) - 0.5));
        float px = spec.x * projectionMatrix[1][1] * uHeight * 0.5 / dist;
        // Far lights can't shrink below a pixel or two, so dim them instead.
        vA = uFade * k * min(1.0, px / 2.0) * exp(-pow(dist * 0.003, 2.0));
        vC = color;
        gl_PointSize = clamp(px, 2.2, 90.0);
      }`,
    fragmentShader: /* glsl */ `
      varying vec3 vC; varying float vA;
      void main() {
        float d = length(gl_PointCoord - 0.5) * 2.0;
        float core = smoothstep(0.3, 0.0, d);
        float halo = pow(max(0.0, 1.0 - d), 2.4) * 0.6;
        gl_FragColor = vec4((vC * (halo + core) + vec3(core * 0.6)) * vA, 1.0);
      }`,
  });
  const points = new THREE.Points(geometry, material);
  points.frustumCulled = false;
  return { points, uniforms };
}

function buildRunway() {
  const uniforms = THREE.UniformsUtils.merge([THREE.UniformsLib.fog, { uPlane: { value: new THREE.Vector3() }, uLanding: { value: 0 }, uReveal: { value: 0 } }]);
  const material = new THREE.ShaderMaterial({
    fog: true,
    uniforms,
    vertexShader: /* glsl */ `
      #include <fog_pars_vertex>
      varying vec3 vW;
      void main() { vec4 wp = modelMatrix * vec4(position, 1.0); vW = wp.xyz; vec4 mvPosition = viewMatrix * wp; gl_Position = projectionMatrix * mvPosition;
        #include <fog_vertex>
      }`,
    fragmentShader: /* glsl */ `
      #include <fog_pars_fragment>
      uniform vec3 uPlane; uniform float uLanding, uReveal; varying vec3 vW;
      float h(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
      float band(float x, float a, float b) { float w = fwidth(x) * 1.2 + 1e-5; return smoothstep(a - w, a + w, x) * (1.0 - smoothstep(b - w, b + w, x)); }
      void main() {
        float x = vW.x; float ax = abs(x);
        float s = ${RUNWAY_Z.toFixed(1)} - vW.z;
        vec3 asphalt = vec3(0.03, 0.034, 0.046) * (0.8 + 0.4 * h(floor(vW.xz * 3.0)));
        float m = band(ax, 4.85, 5.05);
        m = max(m, band(s, 1.5, 7.5) * band(fract((x + 5.0) * 0.82), 0.22, 0.78) * step(ax, 4.5));
        m = max(m, band(ax, 0.0, 0.13) * band(fract(s / 7.5), 0.0, 0.55) * step(11.0, s));
        m = max(m, band(s, 40.0, 50.0) * band(ax, 1.6, 3.3));
        float tz = max(band(s, 20.0, 25.0), max(band(s, 60.0, 65.0), band(s, 80.0, 85.0)));
        m = max(m, tz * band(ax, 1.4, 3.4) * band(fract(ax * 1.7), 0.2, 0.8));
        float glow = 0.1 + 0.12 * smoothstep(2.5, 5.3, ax);
        vec2 d = vec2(x - uPlane.x, (vW.z - (uPlane.z - 15.0)) * 0.4);
        float pool = exp(-dot(d, d) / 46.0) * uLanding * 1.5 / (1.0 + max(0.0, uPlane.y - (${GROUND_Y.toFixed(1)})) * 0.12);
        vec3 col = mix(asphalt, vec3(0.8, 0.82, 0.86), m * 0.92) * (glow + pool) * 1.25 * uReveal;
        gl_FragColor = vec4(col, 1.0);
        #include <colorspace_fragment>
        #include <fog_fragment>
      }`,
  });
  const mesh = new THREE.Mesh(new THREE.PlaneGeometry(11, 216).rotateX(-Math.PI / 2), material);
  mesh.position.set(0, GROUND_Y + 0.03, RUNWAY_Z - 105);
  return { mesh, uniforms };
}

const act: ActFactory = (world) => {
  const group = new THREE.Group();
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(1400, 1000).rotateX(-Math.PI / 2), new THREE.MeshBasicMaterial({ color: "#04060f" }));
  ground.position.set(0, GROUND_Y, RUNWAY_Z - 100);
  const runway = buildRunway();
  const lights = buildLights(world.isPhone);
  group.add(ground, runway.mesh, lights.points);
  const size = new THREE.Vector2();
  const at = new THREE.Vector3();
  const fogColor = new THREE.Color();
  const dark = new THREE.Color("#1a1c36");

  return {
    group,
    camera(p, aspect) {
      const phone = aspect < 1;
      const z = planeZ(p);
      const y = planeY(z);
      const offset: Vec3 = track(
        [
          [0, [2, 2.2, 11]],
          [0.28, [-5, 1.8, 9.5]],
          [0.55, phone ? [5, 1.2, 12] : [4.5, 0.9, 9]],
          [0.8, phone ? [0, 5, 20] : [0, 3.3, 13.5]],
          [1, phone ? [0, 5.4, 21] : [0, 3.5, 14]],
        ],
        p,
      );
      const aim: Vec3 = track(
        [
          [0, [0, 0.5, -30]],
          [0.28, phone ? [0, -5, -30] : [2, -3, -30]],
          [0.55, phone ? [0, -4, -40] : [-1, -1.5, -40]],
          [0.8, phone ? [0, 7.5, -80] : [0, 1.8, -80]],
          [1, phone ? [0, 8, -90] : [0, 2.0, -90]],
        ],
        p,
      );
      return { position: [offset[0], y + offset[1], z + offset[2]], target: [aim[0], y + aim[1], z + aim[2]], fov: track([[0, 40], [0.55, 44], [1, 42]], p) };
    },
    thread(p) {
      const z = planeZ(p);
      const k = descent(z);
      return { position: [0, planeY(z), z], rotation: [0.02 - 0.13 * Math.sin(Math.PI * k) + 0.06 * Math.pow(k, 4), 0, 0], scale: 1 };
    },
    mood(p): Mood {
      const sky = moodAt(planeZ(p));
      // A veil of cloud as the plane sinks through the last of the layer.
      const veil = Math.exp(-Math.pow((p - 0.27) / 0.09, 2));
      fogColor.set(sky.fog).lerp(dark, veil * 0.6);
      return { background: sky.background, fog: `#${fogColor.getHexString()}`, fogDensity: sky.fogDensity + 0.02 * veil };
    },
    update({ p, weight, t }) {
      world.renderer.getDrawingBufferSize(size);
      lights.uniforms.uTime.value = t;
      lights.uniforms.uHeight.value = size.y;
      lights.uniforms.uFade.value = weight;
      const landing = segment(p, 0.2, 0.4) * weight;
      world.thread!.getWorldPosition(at);
      runway.uniforms.uPlane.value.copy(at);
      runway.uniforms.uLanding.value = landing;
      // The runway stays dark until the plane is on its way down to it.
      runway.uniforms.uReveal.value = segment(p, 0.12, 0.42) * weight;
      const plane = planeOf(world);
      plane.landing(landing);
      plane.gear(segment(p, 0.3, 0.52) * weight);
      plane.trail(1 - segment(p, 0.1, 0.4));
    },
  };
};

export default act;
