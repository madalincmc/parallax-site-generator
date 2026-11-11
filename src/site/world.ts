// One flight, one corridor. The plane flies away from the viewer, toward -z, cruising at y 0 over a sea of
// clouds, and the time of day is a function of how far it has flown. Each act owns a stretch of the route:
//   hero         z    0 to  -40   pre-dawn to first light (the sun rises behind the plane, at +z)
//   route        z  -40 to -200   sunrise to bright morning; four waypoint gates at z -83, -115, -147, -179
//   statement    z -200 to -250   into the cloud tops: a white-out, the page's one light section
//   destinations z -250 to -340   golden afternoon; six summits stand above the cloud
//   logbook      z -340 to -400   sunset, the sun low ahead (-z)
//   arrival      z -400 to -512   dusk to night; the cloud ends near z -452, the runway threshold is at
//                                 RUNWAY_Z -505 on the ground at GROUND_Y -18
//
// Thread: the airliner (src/site/plane.ts). Nose toward -z, about 8 long and 7.8 across at scale 1. Pose it
// with `thread()`: rotation.x positive is nose up, rotation.z positive banks left (right wing up). Extras,
// asked for every frame from an act's update: `planeOf(world).gear(0..1)`, `.landing(0..1)`, `.trail(0..1)`.
// It bobs gently on its own, its windows and lights come on by themselves as night falls.
//
// Sky: everything that depends on the time of day (sky dome, sun, stars, cloud colours, the light on the
// plane) follows the plane's z by itself. Acts only have to return `moodAt(z)` from `mood(p)`, with z the
// plane's z at p, so the fog matches. Override it only for a deliberate change, like the white-out.
//
// Clouds: one layer around CLOUD_Y -7, its tops reaching about y -3, drifting slowly back past the plane.
// Keep the camera above y -1.5 or the plane will hide in cloud. It thins out and ends near z -452.
//
// Palette: field #070b1c, ink #f6f7fb, accent airport yellow #ffcf3f, navy #0f1b45, cabin white #f3f5f9.
// Camera: an air-to-air film crew. Mostly within 6 to 16 units of the plane, fov 30 to 46, long gliding
// moves around it: front three-quarter, side-on, top-down, chase. Hand over from behind and slightly above
// the plane, about [x 2, y 2.2, z +11] from it, looking far ahead down -z.
import * as THREE from "three";
import { studioEnvironment } from "@/stage/kit";
import type { Mood, World, WorldFactory } from "@/stage/types";
import { buildPlane, type PlaneApi } from "./plane";

export const CLOUD_Y = -7;
export const GROUND_Y = -18;
export const RUNWAY_Z = -505;
export const CLOUD_END_Z = -452;
export const YELLOW = "#ffcf3f";
export const GATES_Z = [-83, -115, -147, -179];

/** The plane's controls. */
export const planeOf = (world: World) => world.thread!.userData.plane as PlaneApi;

type Key = { z: number; zenith: string; horizon: string; lit: string; shadow: string; sun: string; power: number; stars: number; night: number; theta: number; fog: number };
// theta is the sun's angle along its arc: 0 on the horizon behind the plane (+z), PI on the horizon ahead.
const KEYS: Key[] = [
  { z: 0, zenith: "#0a1030", horizon: "#4b3566", lit: "#5a426e", shadow: "#12183a", sun: "#ff9a6a", power: 0.5, stars: 0.85, night: 1, theta: -0.04, fog: 0.0042 },
  { z: -45, zenith: "#1a2c6c", horizon: "#e98a6c", lit: "#f3a686", shadow: "#272c5c", sun: "#ffb07a", power: 1, stars: 0.15, night: 0.45, theta: 0.1, fog: 0.0042 },
  { z: -120, zenith: "#163f92", horizon: "#6f9bd8", lit: "#a9bfe6", shadow: "#27407a", sun: "#fff1dc", power: 1, stars: 0, night: 0, theta: 0.55, fog: 0.0042 },
  { z: -200, zenith: "#1c4fae", horizon: "#8fb4e8", lit: "#c6d5f0", shadow: "#3d5c94", sun: "#ffffff", power: 1, stars: 0, night: 0, theta: 1.2, fog: 0.0042 },
  { z: -265, zenith: "#1f4a98", horizon: "#f3d3a2", lit: "#f6d9ac", shadow: "#5d5a86", sun: "#ffe3b0", power: 1, stars: 0, night: 0, theta: 2.3, fog: 0.0042 },
  { z: -340, zenith: "#1c357a", horizon: "#ff9a52", lit: "#f4a868", shadow: "#44396a", sun: "#ffb060", power: 1, stars: 0, night: 0.1, theta: 2.85, fog: 0.0042 },
  { z: -385, zenith: "#141c4e", horizon: "#f2643a", lit: "#d96a48", shadow: "#27224c", sun: "#ff8040", power: 1, stars: 0.25, night: 0.5, theta: 3.06, fog: 0.0042 },
  { z: -425, zenith: "#090e2a", horizon: "#3a2a55", lit: "#2f2a50", shadow: "#0f122c", sun: "#ff7040", power: 0.35, stars: 0.8, night: 1, theta: 3.2, fog: 0.004 },
  { z: -470, zenith: "#04071a", horizon: "#0c1332", lit: "#1c2444", shadow: "#070a1c", sun: "#ff7040", power: 0, stars: 1, night: 1, theta: 3.3, fog: 0.0036 },
];

export type Sky = { zenith: THREE.Color; horizon: THREE.Color; lit: THREE.Color; shadow: THREE.Color; sun: THREE.Color; power: number; stars: number; night: number; fog: number; sunDir: THREE.Vector3 };
const makeSky = (): Sky => ({ zenith: new THREE.Color(), horizon: new THREE.Color(), lit: new THREE.Color(), shadow: new THREE.Color(), sun: new THREE.Color(), power: 0, stars: 0, night: 0, fog: 0, sunDir: new THREE.Vector3() });
const A = new THREE.Color();
const B = new THREE.Color();

/** The sky at a point along the route. */
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
  out.sunDir.set(-0.22, Math.sin(theta), Math.cos(theta)).normalize();
  return out;
}

const moodSky = makeSky();
/** The engine's mood for a point along the route: return this from an act's `mood(p)`. */
export function moodAt(z: number): Mood {
  skyAt(z, moodSky);
  return { background: `#${moodSky.zenith.getHexString()}`, fog: `#${moodSky.horizon.getHexString()}`, fogDensity: moodSky.fog };
}

const NOISE = /* glsl */ `
  float h21(vec2 p) { p = fract(p * vec2(123.34, 456.21)); p += dot(p, p + 45.32); return fract(p.x * p.y); }
  float vn(vec2 p) { vec2 i = floor(p), f = fract(p); f = f * f * (3.0 - 2.0 * f);
    return mix(mix(h21(i), h21(i + vec2(1, 0)), f.x), mix(h21(i + vec2(0, 1)), h21(i + vec2(1, 1)), f.x), f.y); }
`;

function buildDome() {
  const uniforms = {
    uZenith: { value: new THREE.Color() },
    uHorizon: { value: new THREE.Color() },
    uSun: { value: new THREE.Color() },
    uSunDir: { value: new THREE.Vector3(0, 1, 0) },
    uPower: { value: 1 },
    uStars: { value: 0 },
    uTime: { value: 0 },
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
        float h31(vec3 p) { p = fract(p * vec3(443.897, 441.423, 437.195)); p += dot(p, p.yzx + 19.19); return fract((p.x + p.y) * p.z); }
        void main() {
          vec3 d = normalize(vDir);
          float up = max(d.y, 0.0);
          // The horizon is warm toward the sun and cooler away from it.
          float away = smoothstep(0.35, -0.7, dot(normalize(d.xz + 1e-5), normalize(uSunDir.xz + 1e-5)));
          vec3 rim = mix(uHorizon, mix(uHorizon, uZenith, 0.6), away);
          vec3 col = mix(rim, uZenith, pow(smoothstep(0.0, 0.62, up), 0.62));
          col = mix(col, uHorizon * 0.72, smoothstep(0.0, -0.25, d.y));
          float sd = max(dot(d, uSunDir), 0.0);
          float low = pow(1.0 - up, 4.0);
          float sun = smoothstep(0.99955, 0.9998, sd) * 2.2 + pow(sd, 420.0) * 0.9 + pow(sd, 36.0) * 0.32 + pow(sd, 5.0) * 0.34 * low;
          col += uSun * sun * uPower;
          // Stars: one bright point in some cells of a fine grid on the sphere.
          vec3 g = d * 150.0; vec3 id = floor(g); vec3 f = fract(g) - 0.5;
          float r = h31(id);
          float star = step(0.972, r) * smoothstep(0.16, 0.0, length(f)) * (0.55 + 0.45 * sin(uTime * (1.0 + r * 3.0) + r * 60.0));
          col += vec3(0.85, 0.9, 1.0) * star * uStars * smoothstep(0.02, 0.3, d.y);
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

function buildClouds(isPhone: boolean) {
  const SIZE = 760;
  const SEG = isPhone ? 110 : 190;
  const CELL = SIZE / SEG;
  const geometry = new THREE.PlaneGeometry(SIZE, SIZE, SEG, SEG).rotateX(-Math.PI / 2);
  const uniforms = THREE.UniformsUtils.merge([
    THREE.UniformsLib.fog,
    {
      uTime: { value: 0 },
      uLit: { value: new THREE.Color() },
      uShadow: { value: new THREE.Color() },
      uSun: { value: new THREE.Color() },
      uLightDir: { value: new THREE.Vector3(0, 1, 0) },
      uPower: { value: 1 },
      uEnd: { value: CLOUD_END_Z },
    },
  ]);
  const material = new THREE.ShaderMaterial({
    fog: true,
    side: THREE.DoubleSide,
    alphaToCoverage: true,
    uniforms,
    vertexShader: /* glsl */ `
      #include <fog_pars_vertex>
      uniform float uTime, uEnd;
      varying vec3 vWorld; varying vec3 vN; varying float vH; varying float vCover;
      ${NOISE}
      // Billowing height, 0..1: rounded tops with sharp creases between them.
      float cloudH(vec2 w) {
        vec2 q = w * 0.021 + vec2(0.0, -uTime * 0.045);
        float a = abs(vn(q) * 2.0 - 1.0);
        float b = abs(vn(q * 2.3 + 7.1) * 2.0 - 1.0);
        float c = vn(q * 5.1 + 3.3);
        return a * 0.58 + b * 0.3 + c * 0.12;
      }
      float cover(vec2 w) { return smoothstep(-26.0, 22.0, (w.y - uEnd) + (vn(w * 0.02 + 11.0) - 0.5) * 70.0); }
      float heightAt(vec2 w) { return ${CLOUD_Y.toFixed(1)} + (cloudH(w) - 0.42) * 9.5 * (0.35 + 0.65 * cover(w)); }
      void main() {
        vec4 wp = modelMatrix * vec4(position, 1.0);
        float e = ${CELL.toFixed(3)};
        float y = heightAt(wp.xz);
        float yx = heightAt(wp.xz + vec2(e, 0.0));
        float yz = heightAt(wp.xz + vec2(0.0, e));
        vN = normalize(vec3(y - yx, e, y - yz));
        vH = cloudH(wp.xz);
        vCover = cover(wp.xz);
        wp.y = y;
        vWorld = wp.xyz;
        vec4 mvPosition = viewMatrix * wp;
        gl_Position = projectionMatrix * mvPosition;
        #include <fog_vertex>
      }`,
    fragmentShader: /* glsl */ `
      #include <fog_pars_fragment>
      uniform vec3 uLit, uShadow, uSun, uLightDir; uniform float uTime, uPower;
      varying vec3 vWorld; varying vec3 vN; varying float vH; varying float vCover;
      ${NOISE}
      void main() {
        float fray = vn(vWorld.xz * 0.16 + vec2(0.0, -uTime * 0.3));
        float alpha = smoothstep(0.02, 0.5, vCover + (fray - 0.5) * 0.5 * (1.0 - vCover));
        if (alpha < 0.01) discard;
        vec2 q = vWorld.xz * 0.19 + vec2(0.0, -uTime * 0.4);
        float detail = vn(q) * 0.6 + vn(q * 2.7 + 5.0) * 0.4;
        vec3 n = normalize(vN + vec3(detail - 0.5, 0.0, vn(q + 9.0) - 0.5) * 0.55);
        if (!gl_FrontFacing) n = -n;
        float ndl = clamp(dot(n, uLightDir) * 0.62 + 0.42, 0.0, 1.0);
        float top = smoothstep(0.12, 0.72, vH + (detail - 0.5) * 0.22);
        float light = top * (0.3 + 0.7 * ndl);
        vec3 col = mix(uShadow, uLit, light);
        // Light bleeding through the thin edges that face the sun.
        vec3 v = normalize(cameraPosition - vWorld);
        float through = pow(max(dot(-v, uLightDir), 0.0), 5.0) * (1.0 - top * 0.6);
        col += uSun * through * 0.3 * uPower;
        if (!gl_FrontFacing) col = uShadow * 0.8;
        gl_FragColor = vec4(col, alpha);
        #include <colorspace_fragment>
        #include <fog_fragment>
      }`,
  });
  const mesh = new THREE.Mesh(geometry, material);
  mesh.frustumCulled = false;
  return {
    mesh,
    uniforms,
    /** Keeps the layer under the plane, moving in whole cells so the clouds never swim. */
    follow(x: number, z: number) {
      mesh.position.set(Math.round(x / CELL) * CELL, 0, Math.round(z / CELL) * CELL);
    },
  };
}

const createWorld: WorldFactory = ({ scene, renderer, isPhone }) => {
  const environment = studioEnvironment(renderer, {
    top: "#9fb8e8",
    horizon: "#e6eefb",
    bottom: "#8f9fc0",
    lights: [
      { dir: [3, 6, 4], color: "#ffffff", size: 5, power: 6 },
      { dir: [-5, 2, -3], color: "#dfe9ff", size: 3, power: 3 },
    ],
  });
  scene.environment = environment;

  const sun = new THREE.DirectionalLight("#ffffff", 2);
  const moon = new THREE.DirectionalLight("#8fa6e6", 0);
  moon.position.set(40, 70, 30);
  const fill = new THREE.HemisphereLight("#ffffff", "#ffffff", 0.5);
  scene.add(sun, sun.target, moon, fill);

  const dome = buildDome();
  const clouds = buildClouds(isPhone);
  const plane = buildPlane(isPhone);
  scene.add(dome.mesh, clouds.mesh, plane.group);

  const sky = makeSky();
  const at = new THREE.Vector3();
  const moonDir = new THREE.Vector3(0.4, 0.7, 0.3).normalize();
  const lightDir = new THREE.Vector3();
  const size = new THREE.Vector2();
  const trail = new THREE.Color();
  const white = new THREE.Color("#ffffff");

  return {
    scene,
    renderer,
    isPhone,
    thread: plane.group,
    pointerSway: 0.35,
    mood: moodAt(0),
    update({ t }) {
      plane.group.getWorldPosition(at);
      skyAt(at.z, sky);
      const fog = scene.fog as THREE.FogExp2;

      dome.mesh.position.copy(at);
      dome.uniforms.uZenith.value.copy(sky.zenith);
      dome.uniforms.uHorizon.value.copy(sky.horizon);
      dome.uniforms.uSun.value.copy(sky.sun);
      dome.uniforms.uSunDir.value.copy(sky.sunDir);
      dome.uniforms.uPower.value = sky.power;
      dome.uniforms.uStars.value = sky.stars;
      dome.uniforms.uTime.value = t;
      dome.uniforms.uFog.value.copy(fog.color);
      dome.uniforms.uFogK.value = 1 - Math.exp(-Math.pow(fog.density * 130, 2));

      // By night the moon takes over from the sun as the clouds' light.
      const moonK = Math.min(1, Math.max(0, (sky.night - 0.55) / 0.45)) * (1 - sky.power);
      lightDir.copy(sky.sunDir).lerp(moonDir, moonK).normalize();
      clouds.follow(at.x, at.z);
      clouds.uniforms.uTime.value = t;
      clouds.uniforms.uLit.value.copy(sky.lit);
      clouds.uniforms.uShadow.value.copy(sky.shadow);
      clouds.uniforms.uSun.value.copy(sky.sun);
      clouds.uniforms.uLightDir.value.copy(lightDir);
      clouds.uniforms.uPower.value = sky.power;

      const day = 1 - sky.night;
      const height = Math.max(0, sky.sunDir.y + 0.12);
      sun.color.copy(sky.sun);
      sun.intensity = 3.2 * sky.power * Math.min(1, height * 3 + 0.25);
      sun.position.copy(at).addScaledVector(sky.sunDir, 80);
      sun.target.position.copy(at);
      moon.intensity = 0.5 * moonK;
      fill.color.copy(sky.zenith).lerp(sky.horizon, 0.5);
      fill.groundColor.copy(sky.shadow).lerp(sky.lit, 0.4);
      fill.intensity = 0.35 + 0.9 * day;
      scene.environmentIntensity = 0.1 + 0.75 * day;

      renderer.getDrawingBufferSize(size);
      trail.copy(sky.lit).lerp(white, 0.55);
      plane.tick(t, { night: sky.night, trail }, size.y);
    },
    dispose() {
      environment.dispose();
      plane.dispose();
    },
  };
};

export default createWorld;
