// Helpers for acts and worlds. Everything is procedural: nothing here loads a file.
import * as THREE from "three";
import { lerp, rng, segment } from "./math";
import type { Vec3 } from "./types";

export { clamp, fbm2, lerp, noise2, remap, rng, smooth, smoother, segment } from "./math";

export const mix3 = (a: Vec3, b: Vec3, k: number): Vec3 => [
  lerp(a[0], b[0], k),
  lerp(a[1], b[1], k),
  lerp(a[2], b[2], k),
];

/** Walks keyframes [[p, value], ...], eased between each pair. For camera paths and poses. */
export function track(keys: [number, Vec3][], p: number): Vec3;
export function track(keys: [number, number][], p: number): number;
export function track(keys: [number, Vec3 | number][], p: number): Vec3 | number {
  if (p <= keys[0][0]) return keys[0][1];
  for (let i = 1; i < keys.length; i++) {
    if (p <= keys[i][0]) {
      const k = segment(p, keys[i - 1][0], keys[i][0]);
      const a = keys[i - 1][1];
      const b = keys[i][1];
      return typeof a === "number" ? lerp(a, b as number, k) : mix3(a, b as Vec3, k);
    }
  }
  return keys[keys.length - 1][1];
}

/** GLSL noise for shaders: `float snoise(vec3)` and `float fbm(vec3)`. */
export const GLSL_NOISE = /* glsl */ `
  vec3 hash3(vec3 p) {
    p = vec3(dot(p, vec3(127.1, 311.7, 74.7)), dot(p, vec3(269.5, 183.3, 246.1)), dot(p, vec3(113.5, 271.9, 124.6)));
    return -1.0 + 2.0 * fract(sin(p) * 43758.5453123);
  }
  float snoise(vec3 p) {
    vec3 i = floor(p), f = fract(p), u = f * f * (3.0 - 2.0 * f);
    return mix(mix(mix(dot(hash3(i), f), dot(hash3(i + vec3(1,0,0)), f - vec3(1,0,0)), u.x),
                   mix(dot(hash3(i + vec3(0,1,0)), f - vec3(0,1,0)), dot(hash3(i + vec3(1,1,0)), f - vec3(1,1,0)), u.x), u.y),
               mix(mix(dot(hash3(i + vec3(0,0,1)), f - vec3(0,0,1)), dot(hash3(i + vec3(1,0,1)), f - vec3(1,0,1)), u.x),
                   mix(dot(hash3(i + vec3(0,1,1)), f - vec3(0,1,1)), dot(hash3(i + vec3(1,1,1)), f - vec3(1,1,1)), u.x), u.y), u.z);
  }
  float fbm(vec3 p) {
    float s = 0.0, a = 0.5;
    for (int i = 0; i < 4; i++) { s += a * snoise(p); p = p * 2.03 + 11.3; a *= 0.5; }
    return s;
  }
`;

/**
 * Image-based light from a gradient, built at startup with no files. Without this, metal and glass
 * look black, so give it to `scene.environment` in any world with reflective materials.
 */
export function studioEnvironment(
  renderer: THREE.WebGLRenderer,
  { top = "#ffffff", horizon = "#555566", bottom = "#050508", lights = [] as { dir: Vec3; color: string; size: number; power: number }[] } = {},
) {
  const scene = new THREE.Scene();
  const uniforms = {
    top: { value: new THREE.Color(top) },
    horizon: { value: new THREE.Color(horizon) },
    bottom: { value: new THREE.Color(bottom) },
  };
  scene.add(
    new THREE.Mesh(
      new THREE.SphereGeometry(10, 32, 16),
      new THREE.ShaderMaterial({
        side: THREE.BackSide,
        uniforms,
        vertexShader: `varying vec3 vP; void main() { vP = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
        fragmentShader: `uniform vec3 top, horizon, bottom; varying vec3 vP;
          void main() { float h = normalize(vP).y; gl_FragColor = vec4(h > 0.0 ? mix(horizon, top, pow(h, 0.7)) : mix(horizon, bottom, pow(-h, 0.5)), 1.0); }`,
      }),
    ),
  );
  for (const light of lights) {
    const color = new THREE.Color(light.color).multiplyScalar(light.power);
    const panel = new THREE.Mesh(new THREE.PlaneGeometry(light.size, light.size), new THREE.MeshBasicMaterial({ color, side: THREE.DoubleSide }));
    panel.position.set(...light.dir).normalize().multiplyScalar(8);
    panel.lookAt(0, 0, 0);
    scene.add(panel);
  }
  const pmrem = new THREE.PMREMGenerator(renderer);
  const texture = pmrem.fromScene(scene, 0.02).texture;
  pmrem.dispose();
  scene.traverse((object) => {
    const mesh = object as THREE.Mesh;
    mesh.geometry?.dispose();
    (mesh.material as THREE.Material | undefined)?.dispose();
  });
  return texture;
}

/** A canvas-drawn texture for roughness, bump or color detail. */
export function canvasTexture(size: number, paint: (ctx: CanvasRenderingContext2D, size: number) => void, srgb = false) {
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = size;
  paint(canvas.getContext("2d")!, size);
  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
  texture.anisotropy = 4;
  if (srgb) texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

/** Drifting specks in a box, one draw call. Moves on the GPU and stays bounded forever. */
export function dust(options: { count: number; size: Vec3; center?: Vec3; color: string; pointSize?: number; opacity?: number; seed?: number; additive?: boolean }) {
  const { count, size, center = [0, 0, 0], color, pointSize = 2.4, opacity = 0.6, seed = 1, additive = true } = options;
  const r = rng(seed);
  const positions = new Float32Array(count * 3);
  const phases = new Float32Array(count);
  for (let i = 0; i < count; i++) {
    for (let k = 0; k < 3; k++) positions[i * 3 + k] = center[k] + (r() - 0.5) * size[k];
    phases[i] = r() * 6.283;
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute("phase", new THREE.BufferAttribute(phases, 1));
  const material = new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: additive ? THREE.AdditiveBlending : THREE.NormalBlending,
    uniforms: {
      uTime: { value: 0 },
      uColor: { value: new THREE.Color(color) },
      uOpacity: { value: opacity },
      uSize: { value: pointSize },
    },
    vertexShader: /* glsl */ `
      attribute float phase; uniform float uTime, uSize; varying float vA;
      void main() {
        vec3 p = position + 0.25 * vec3(sin(uTime * 0.21 + phase), sin(uTime * 0.17 + phase * 2.0), cos(uTime * 0.19 + phase));
        vec4 mv = modelViewMatrix * vec4(p, 1.0);
        gl_Position = projectionMatrix * mv;
        gl_PointSize = uSize * (12.0 / max(1.0, -mv.z));
        vA = (0.5 + 0.5 * sin(uTime * 0.6 + phase * 3.0)) * smoothstep(90.0, 20.0, -mv.z);
      }`,
    fragmentShader: /* glsl */ `
      uniform vec3 uColor; uniform float uOpacity; varying float vA;
      void main() { float d = length(gl_PointCoord - 0.5); gl_FragColor = vec4(uColor, uOpacity * vA * smoothstep(0.5, 0.05, d)); }`,
  });
  const points = new THREE.Points(geometry, material);
  points.frustumCulled = false;
  return Object.assign(points, {
    tick(t: number, fade = 1) {
      material.uniforms.uTime.value = t;
      material.uniforms.uOpacity.value = opacity * fade;
    },
  });
}

/**
 * A glowing line, drawn as a camera-independent flat ribbon with a soft core. This is the cheap
 * stand-in for bloom: full-screen post-processing costs too much on a laptop's integrated GPU.
 * `tick(reveal)` draws it along its length from 0 to 1, so scroll can trace it.
 */
export function glowLine(points: Vec3[], options: { color: string; width?: number; intensity?: number; segments?: number; up?: Vec3 }) {
  const { color, width = 0.12, intensity = 1.6, segments = 180, up = [0, 1, 0] } = options;
  const curve = new THREE.CatmullRomCurve3(points.map((p) => new THREE.Vector3(...p)));
  const position = new Float32Array((segments + 1) * 6);
  const uv = new Float32Array((segments + 1) * 4);
  const index: number[] = [];
  const upVector = new THREE.Vector3(...up);
  const point = new THREE.Vector3();
  const tangent = new THREE.Vector3();
  const side = new THREE.Vector3();
  for (let i = 0; i <= segments; i++) {
    const u = i / segments;
    curve.getPointAt(u, point);
    curve.getTangentAt(u, tangent);
    side.crossVectors(tangent, upVector).normalize().multiplyScalar(width);
    position.set([point.x - side.x, point.y - side.y, point.z - side.z, point.x + side.x, point.y + side.y, point.z + side.z], i * 6);
    uv.set([u, 0, u, 1], i * 4);
    if (i < segments) {
      const a = i * 2;
      index.push(a, a + 1, a + 2, a + 1, a + 3, a + 2);
    }
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.BufferAttribute(position, 3));
  geometry.setAttribute("uv", new THREE.BufferAttribute(uv, 2));
  geometry.setIndex(index);
  const material = new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    side: THREE.DoubleSide,
    blending: THREE.AdditiveBlending,
    uniforms: { uColor: { value: new THREE.Color(color) }, uReveal: { value: 1 }, uFade: { value: 1 }, uGain: { value: intensity } },
    vertexShader: `varying vec2 vUv; void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
    fragmentShader: /* glsl */ `
      uniform vec3 uColor; uniform float uReveal, uFade, uGain; varying vec2 vUv;
      void main() {
        float d = abs(vUv.y - 0.5) * 2.0;
        float glow = pow(1.0 - d, 3.0) + 0.9 * smoothstep(0.1, 0.0, d);
        float front = smoothstep(uReveal, uReveal - 0.02, vUv.x);
        gl_FragColor = vec4(uColor * uGain, glow * front * uFade);
      }`,
  });
  const mesh = new THREE.Mesh(geometry, material);
  mesh.frustumCulled = false;
  return Object.assign(mesh, {
    tick(reveal = 1, fade = 1) {
      material.uniforms.uReveal.value = reveal * 1.02;
      material.uniforms.uFade.value = fade;
    },
  });
}

/** Displaced ground with height-based colors, in one mesh. Keep `resolution` under 256. */
export function terrain(options: { size: [number, number]; resolution: number; height: (x: number, z: number) => number; color: (h: number, x: number, z: number) => string | THREE.Color; roughness?: number; metalness?: number }) {
  const { size, resolution, height, color, roughness = 0.9, metalness = 0 } = options;
  const geometry = new THREE.PlaneGeometry(size[0], size[1], resolution, resolution);
  geometry.rotateX(-Math.PI / 2);
  const position = geometry.attributes.position as THREE.BufferAttribute;
  const colors = new Float32Array(position.count * 3);
  const c = new THREE.Color();
  for (let i = 0; i < position.count; i++) {
    const x = position.getX(i);
    const z = position.getZ(i);
    const h = height(x, z);
    position.setY(i, h);
    c.set(color(h, x, z));
    colors.set([c.r, c.g, c.b], i * 3);
  }
  geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));
  geometry.computeVertexNormals();
  return new THREE.Mesh(geometry, new THREE.MeshStandardMaterial({ vertexColors: true, roughness, metalness }));
}

/**
 * Many copies of a geometry in one draw call. `place` sets each copy through the dummy.
 * Call `.tick(place)` again to move them, though moving thousands every frame costs CPU.
 */
export function instanced(geometry: THREE.BufferGeometry, material: THREE.Material, count: number, place: (dummy: THREE.Object3D, index: number) => void) {
  const mesh = new THREE.InstancedMesh(geometry, material, count);
  const dummy = new THREE.Object3D();
  const apply = (fn: typeof place) => {
    for (let i = 0; i < count; i++) {
      dummy.position.set(0, 0, 0);
      dummy.rotation.set(0, 0, 0);
      dummy.scale.set(1, 1, 1);
      fn(dummy, i);
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
    }
    mesh.instanceMatrix.needsUpdate = true;
  };
  apply(place);
  mesh.frustumCulled = false;
  return Object.assign(mesh, { tick: apply });
}

/** Fades ordinary materials with the act's weight. Remember to call `.apply(weight)` in update. */
export function fader(root: THREE.Object3D) {
  const materials: { material: THREE.Material; opacity: number }[] = [];
  root.traverse((object) => {
    const list = (object as THREE.Mesh).material;
    if (!list) return;
    for (const material of Array.isArray(list) ? list : [list]) {
      material.transparent = true;
      materials.push({ material, opacity: material.opacity });
    }
  });
  return {
    apply(weight: number) {
      for (const entry of materials) entry.material.opacity = entry.opacity * weight;
      root.visible = weight > 0.002;
    },
  };
}
