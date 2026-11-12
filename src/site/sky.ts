// The time of day, as a function of how far the balloon has drifted, and the one set of light uniforms
// every custom shader in this world shares: the land, the mist, the balloons and the sky all read the
// same sun, so they always sit in one atmosphere.
import * as THREE from "three";
import type { Mood } from "@/stage/types";

/** The valley mist ends near here, where the balloon comes down to land. */
export const MIST_END_Z = -452;

type Key = { z: number; zenith: string; horizon: string; lit: string; shadow: string; sun: string; power: number; stars: number; night: number; theta: number; fog: number };
// theta is the sun's angle along its arc: 0 on the horizon behind the balloon (+z), PI on the horizon ahead.
// lit and shadow are the colours of a sunlit and a shaded slope; horizon is also the colour of haze and mist.
const KEYS: Key[] = [
  { z: 0, zenith: "#1d1a4a", horizon: "#9c5a78", lit: "#6a4468", shadow: "#241c44", sun: "#ff9a6a", power: 0.8, stars: 0.7, night: 1, theta: 0.012, fog: 0.0052 },
  { z: -45, zenith: "#5a4288", horizon: "#e58f80", lit: "#c96a68", shadow: "#5c3052", sun: "#ffb884", power: 1, stars: 0.1, night: 0.4, theta: 0.09, fog: 0.0052 },
  { z: -120, zenith: "#6f65a8", horizon: "#dc9c64", lit: "#cf8a52", shadow: "#86564e", sun: "#ffe0b0", power: 1, stars: 0, night: 0, theta: 0.32, fog: 0.0052 },
  { z: -200, zenith: "#3f72ba", horizon: "#a9c0d8", lit: "#93a892", shadow: "#4a6470", sun: "#ffffff", power: 1, stars: 0, night: 0, theta: 1.2, fog: 0.0052 },
  { z: -265, zenith: "#5482c0", horizon: "#ecc58a", lit: "#d2ae70", shadow: "#6a6276", sun: "#ffe3b0", power: 1, stars: 0, night: 0, theta: 2.3, fog: 0.0052 },
  { z: -340, zenith: "#47407e", horizon: "#e9824e", lit: "#e08656", shadow: "#5a355c", sun: "#ffb060", power: 1, stars: 0, night: 0.1, theta: 2.85, fog: 0.0052 },
  { z: -385, zenith: "#2a2460", horizon: "#e8644a", lit: "#b8544e", shadow: "#36224c", sun: "#ff8040", power: 1, stars: 0.25, night: 0.5, theta: 3.06, fog: 0.0052 },
  { z: -425, zenith: "#131136", horizon: "#54386a", lit: "#46385f", shadow: "#181430", sun: "#ff7040", power: 0.35, stars: 0.8, night: 1, theta: 3.2, fog: 0.005 },
  { z: -470, zenith: "#070920", horizon: "#161a3c", lit: "#242a4c", shadow: "#0a0c20", sun: "#ff7040", power: 0, stars: 1, night: 1, theta: 3.3, fog: 0.0044 },
];

export type Sky = { zenith: THREE.Color; horizon: THREE.Color; lit: THREE.Color; shadow: THREE.Color; sun: THREE.Color; power: number; stars: number; night: number; fog: number; sunDir: THREE.Vector3 };
export const makeSky = (): Sky => ({ zenith: new THREE.Color(), horizon: new THREE.Color(), lit: new THREE.Color(), shadow: new THREE.Color(), sun: new THREE.Color(), power: 0, stars: 0, night: 0, fog: 0, sunDir: new THREE.Vector3() });
const A = new THREE.Color();
const B = new THREE.Color();

/** The sky at a point along the drift. */
export function skyAt(z: number, out: Sky = makeSky()) {
  let i = 0;
  while (i < KEYS.length - 2 && z < KEYS[i + 1].z) i++;
  const a = KEYS[i];
  const b = KEYS[i + 1];
  const raw = Math.min(1, Math.max(0, (z - a.z) / (b.z - a.z)));
  const k = raw * raw * (3 - 2 * raw);
  const mixColor = (target: THREE.Color, x: string, y: string) => target.copy(A.set(x)).lerp(B.set(y), k);
  mixColor(out.zenith, a.zenith, b.zenith);
  mixColor(out.horizon, a.horizon, b.horizon);
  mixColor(out.lit, a.lit, b.lit);
  mixColor(out.shadow, a.shadow, b.shadow);
  mixColor(out.sun, a.sun, b.sun);
  const num = (x: number, y: number) => x + (y - x) * k;
  out.power = num(a.power, b.power);
  out.stars = num(a.stars, b.stars);
  out.night = num(a.night, b.night);
  out.fog = num(a.fog, b.fog);
  const theta = num(a.theta, b.theta);
  out.sunDir.set(-0.14, Math.sin(theta), Math.cos(theta)).normalize();
  return out;
}

const moodSky = makeSky();
/** The engine's mood for a point along the drift: return this from an act's `mood(p)`. */
export function moodAt(z: number): Mood {
  skyAt(z, moodSky);
  return { background: `#${moodSky.zenith.getHexString()}`, fog: `#${moodSky.horizon.getHexString()}`, fogDensity: moodSky.fog };
}

/** Shared by every custom material here. The world sets them once a frame. */
export const atmos = {
  uTime: { value: 0 },
  uSunDir: { value: new THREE.Vector3(0, 1, 0) },
  uSunCol: { value: new THREE.Color() },
  uLit: { value: new THREE.Color() },
  uShadow: { value: new THREE.Color() },
  uMist: { value: new THREE.Color() },
  uAmbTop: { value: new THREE.Color() },
  uAmbBottom: { value: new THREE.Color() },
  uEnd: { value: MIST_END_Z },
};

export const fogUniforms = () => THREE.UniformsUtils.clone(THREE.UniformsLib.fog);

export const NOISE = /* glsl */ `
  float h21(vec2 p) { p = fract(p * vec2(123.34, 456.21)); p += dot(p, p + 45.32); return fract(p.x * p.y); }
  float vn(vec2 p) { vec2 i = floor(p), f = fract(p); f = f * f * (3.0 - 2.0 * f);
    return mix(mix(h21(i), h21(i + vec2(1, 0)), f.x), mix(h21(i + vec2(0, 1)), h21(i + vec2(1, 1)), f.x), f.y); }
  float fbm3(vec2 p) { return vn(p) * 0.55 + vn(p * 2.03 + vec2(17.1, 9.2)) * 0.3 + vn(p * 4.1 + vec2(3.7, 31.4)) * 0.15; }
  // 1 where the valley mist lies, falling to 0 past its ragged end.
  float mistCover(vec2 w, float end) { return smoothstep(-26.0, 22.0, (w.y - end) + (vn(w * 0.02 + 11.0) - 0.5) * 70.0); }
`;

export function buildDome() {
  const uniforms = {
    uZenith: { value: new THREE.Color() },
    uHorizon: { value: new THREE.Color() },
    uSun: { value: new THREE.Color() },
    uSunDir: atmos.uSunDir,
    uPower: { value: 1 },
    uStars: { value: 0 },
    uTime: atmos.uTime,
    uFog: { value: new THREE.Color() },
    uFogK: { value: 0 },
  };
  const mesh = new THREE.Mesh(
    new THREE.SphereGeometry(540, 48, 32),
    new THREE.ShaderMaterial({
      side: THREE.BackSide,
      depthWrite: false,
      uniforms,
      vertexShader: `varying vec3 vDir; void main() { vDir = position; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
      fragmentShader: /* glsl */ `
        uniform vec3 uZenith, uHorizon, uSun, uSunDir, uFog; uniform float uPower, uStars, uTime, uFogK;
        varying vec3 vDir;
        ${NOISE}
        float h31(vec3 p) { p = fract(p * vec3(443.897, 441.423, 437.195)); p += dot(p, p.yzx + 19.19); return fract((p.x + p.y) * p.z); }
        void main() {
          vec3 d = normalize(vDir);
          float up = max(d.y, 0.0);
          // The horizon is warm toward the sun and cooler away from it.
          float away = smoothstep(0.35, -0.7, dot(normalize(d.xz + 1e-5), normalize(uSunDir.xz + 1e-5)));
          vec3 rim = mix(uHorizon, mix(uHorizon, uZenith, 0.6), away);
          vec3 col = mix(rim, uZenith, pow(smoothstep(0.0, 0.62, up), 0.62));
          float sd = max(dot(d, uSunDir), 0.0);
          // Thin high cloud streaks that catch the colour of the light.
          vec2 sp = d.xz / (up + 0.14);
          float streak = smoothstep(0.5, 0.74, fbm3(sp * vec2(0.5, 2.3) + vec2(uTime * 0.006, 3.0))) * smoothstep(0.03, 0.14, d.y);
          vec3 cloud = mix(uHorizon, vec3(1.0), 0.22) + uSun * pow(sd, 8.0) * 0.5 * uPower;
          col = mix(col, cloud, streak * 0.5 * (1.0 - 0.75 * uStars));
          float low = pow(1.0 - up, 4.0);
          float sun = smoothstep(0.99955, 0.9998, sd) * 2.2 + pow(sd, 420.0) * 0.9 + pow(sd, 36.0) * 0.34 + pow(sd, 5.0) * 0.36 * low;
          col += uSun * sun * uPower;
          // Stars: one bright point in some cells of a fine grid on the sphere.
          vec3 g = d * 150.0; vec3 id = floor(g); vec3 f = fract(g) - 0.5;
          float r = h31(id);
          float star = step(0.972, r) * smoothstep(0.16, 0.0, length(f)) * (0.55 + 0.45 * sin(uTime * (1.0 + r * 3.0) + r * 60.0));
          col += vec3(0.85, 0.9, 1.0) * star * uStars * smoothstep(0.02, 0.3, d.y);
          // Below the horizon there is only haze, the colour the far mist fades to.
          col = mix(col, uFog, smoothstep(0.015, -0.05, d.y));
          col = mix(col, uFog, uFogK);
          gl_FragColor = vec4(col, 1.0);
          #include <colorspace_fragment>
        }`,
    }),
  );
  mesh.renderOrder = -10;
  mesh.frustumCulled = false;
  return { mesh, uniforms };
}
