// Landing. Dusk turns to night. The balloon sinks out of the last of the mist into a valley: village
// lights on the slopes, a ring of lanterns in a meadow, and six balloons already on the ground, glowing in
// turn like lamps. It settles inside the ring as the camera rises behind it for the call to action.
import * as THREE from "three";
import { fbm2, lerp, rng, segment, smooth, track } from "@/stage/kit";
import type { ActFactory, Mood, Vec3 } from "@/stage/types";
import { buildFleet, type Livery } from "@/site/balloon";
import { BALLOON_FOOT, balloonOf, FIELD_Z, GROUND_Y, heightAt, moodAt } from "@/site/world";

const balloonZ = (p: number) => lerp(-400, -512, 1 - Math.pow(1 - p, 1.5));
/** 0 at cruise, 1 on the ground. */
const descent = (z: number) => smooth(Math.min(1, Math.max(0, (-410 - z) / 100)));
const balloonY = (z: number) => lerp(0, GROUND_Y + BALLOON_FOOT + 0.05, descent(z));
const LANDING_Z = -512;

// The balloons on the ground, in an arc beyond the landing ring: x, z, colours.
const GLOW: { x: number; z: number; livery: Livery }[] = [
  { x: -42, z: -556, livery: { colors: ["#c3202e", "#f6e7c8", "#f09a1e", "#1b2e66"], style: 1 } },
  { x: -26, z: -568, livery: { colors: ["#2a6fc4", "#f6e7c8", "#f0c21e", "#1b2e66"], style: 0 } },
  { x: -11, z: -576, livery: { colors: ["#f09a1e", "#f6e7c8", "#c3202e", "#3f2614"], style: 2 } },
  { x: 12, z: -575, livery: { colors: ["#6b3fa0", "#f09a1e", "#f6e7c8", "#3a1f66"], style: 0 } },
  { x: 27, z: -566, livery: { colors: ["#2f9e62", "#f6e7c8", "#f0c21e", "#1d5c3a"], style: 1 } },
  { x: 43, z: -554, livery: { colors: ["#1f8a8a", "#f6e7c8", "#c3202e", "#1b2e66"], style: 2 } },
];
/** Each ground balloon's burner at time t: a slow swell, out of step with its neighbours. */
const glowAt = (i: number, t: number) => 0.2 + 0.8 * smooth(0.5 + 0.5 * Math.sin(t * 0.8 + i * 1.9));

function buildLights(isPhone: boolean) {
  const position: number[] = [];
  const color: number[] = [];
  const spec: number[] = [];
  const add = (x: number, z: number, c: [number, number, number], size: number, kind = 0, phase = 0, lift = 0.35) => {
    position.push(x, heightAt(x, z) + lift, z);
    color.push(...c);
    spec.push(size, kind, phase);
  };
  const LANTERN: [number, number, number] = [1, 0.74, 0.38];
  // The landing ring, and two rows of lanterns leading on from it toward the glowing balloons.
  for (let i = 0; i < 26; i++) {
    const a = (i / 26) * Math.PI * 2;
    add(Math.cos(a) * 8.5, LANDING_Z + Math.sin(a) * 8.5, LANTERN, 0.75, 1, i * 0.37);
  }
  for (let z = LANDING_Z - 13; z > LANDING_Z - 44; z -= 4.5) for (const x of [-2.6, 2.6]) add(x, z, LANTERN, 0.6, 1, z * 0.21);
  // A pool of warm light on the grass under each glowing balloon, swelling with its burner.
  GLOW.forEach((g, i) => add(g.x, g.z, [1, 0.52, 0.2], 17, 3, i * 1.9, 0.6));
  // The village: warm windows along loose lanes, in clusters, on the valley floor and the first slopes.
  const r = rng(77);
  const count = isPhone ? 800 : 2000;
  for (let i = 0; i < count * 6 && position.length / 3 < count + 70; i++) {
    let x = r.range(-170, 170);
    let z = r.range(FIELD_Z - 150, FIELD_Z + 90);
    if (Math.hypot(x, z - (LANDING_Z - 28)) < 62) continue;
    if (fbm2(x * 0.02 + 3, z * 0.02) + 0.1 < r() * 0.5) continue;
    if (r() < 0.5) x = Math.round(x / 6) * 6;
    else z = Math.round(z / 6) * 6;
    if (heightAt(x, z) > -7) continue;
    const k = r();
    add(x, z, k < 0.8 ? [1, 0.72, 0.4] : k < 0.96 ? [1, 0.9, 0.75] : [1, 0.4, 0.25], r.range(1, 1.9), 1, r() * 20);
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.Float32BufferAttribute(position, 3));
  geometry.setAttribute("color", new THREE.Float32BufferAttribute(color, 3));
  geometry.setAttribute("spec", new THREE.Float32BufferAttribute(spec, 3));
  const uniforms = { uTime: { value: 0 }, uHeight: { value: 800 }, uFade: { value: 1 }, uGlow: { value: 0 } };
  const material = new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    uniforms,
    vertexShader: /* glsl */ `
      attribute vec3 color; attribute vec3 spec;
      uniform float uTime, uHeight, uFade, uGlow;
      varying vec3 vC; varying float vA; varying float vSoft;
      void main() {
        vec4 mv = modelViewMatrix * vec4(position, 1.0);
        gl_Position = projectionMatrix * mv;
        float dist = max(0.1, -mv.z);
        float k = 1.0;
        vSoft = 0.0;
        if (spec.y > 0.5 && spec.y < 1.5) k = 0.7 + 0.3 * sin(uTime * (0.6 + fract(spec.z) * 1.8) + spec.z * 6.0);
        if (spec.y > 2.5) { float s = 0.5 + 0.5 * sin(uTime * 0.8 + spec.z); k = 0.34 * uGlow * (0.2 + 0.8 * s * s * (3.0 - 2.0 * s)); vSoft = 1.0; }
        float px = spec.x * projectionMatrix[1][1] * uHeight * 0.5 / dist;
        // Far lights can't shrink below a pixel or two, so dim them instead.
        vA = uFade * k * min(1.0, px / 2.0) * exp(-pow(dist * 0.003, 2.0));
        vC = color;
        gl_PointSize = clamp(px, 2.2, 240.0);
      }`,
    fragmentShader: /* glsl */ `
      varying vec3 vC; varying float vA; varying float vSoft;
      void main() {
        float d = length(gl_PointCoord - 0.5) * 2.0;
        float core = smoothstep(0.3, 0.0, d) * (1.0 - vSoft);
        float halo = pow(max(0.0, 1.0 - d), 2.4) * 0.6;
        gl_FragColor = vec4((vC * (halo + core) + vec3(core * 0.6)) * vA, 1.0);
      }`,
  });
  const points = new THREE.Points(geometry, material);
  points.frustumCulled = false;
  return { points, uniforms };
}

const act: ActFactory = (world) => {
  const group = new THREE.Group();
  const lights = buildLights(world.isPhone);
  const glow = buildFleet(GLOW.map((g) => g.livery));
  const feet = GLOW.map((g) => heightAt(g.x, g.z) + BALLOON_FOOT);
  group.add(lights.points, glow.mesh);
  const size = new THREE.Vector2();
  const fogColor = new THREE.Color();
  const dark = new THREE.Color("#1c1838");

  return {
    group,
    camera(p, aspect) {
      const phone = aspect < 1;
      const z = balloonZ(p);
      const y = balloonY(z);
      const offset: Vec3 = track(
        [
          [0, [3.5, 1.2, 17]],
          [0.28, [-8, 1.8, 15]],
          [0.5, phone ? [0, 6, 31] : [0, 5, 24]],
          [1, phone ? [0, 6.4, 32] : [0, 5.2, 25]],
        ],
        p,
      );
      const aim: Vec3 = track(
        [
          [0, [0, 0.3, -30]],
          [0.28, phone ? [0, -6, -30] : [3, -4, -30]],
          [0.5, phone ? [0, 16, -80] : [0, 12.5, -80]],
          [1, phone ? [0, 17, -90] : [0, 13, -90]],
        ],
        p,
      );
      return { position: [offset[0], y + offset[1], z + offset[2]], target: [aim[0], y + aim[1], z + aim[2]], fov: track([[0, 40], [0.5, 42], [1, 42]], p) };
    },
    thread(p) {
      const z = balloonZ(p);
      return { position: [0, balloonY(z), z], rotation: [0, 0, 0], scale: 1 };
    },
    mood(p): Mood {
      const sky = moodAt(balloonZ(p));
      // A veil as the balloon sinks through the last of the mist.
      const veil = Math.exp(-Math.pow((p - 0.27) / 0.09, 2));
      fogColor.set(sky.fog).lerp(dark, veil * 0.6);
      return { background: sky.background, fog: `#${fogColor.getHexString()}`, fogDensity: sky.fogDensity + 0.014 * veil };
    },
    update({ p, weight, t }) {
      world.renderer.getDrawingBufferSize(size);
      // The lights come on as night falls, once the balloon is under the mist: they would shine through it.
      const night = segment(p, 0.27, 0.5);
      lights.uniforms.uTime.value = t;
      lights.uniforms.uHeight.value = size.y;
      lights.uniforms.uFade.value = weight * night;
      lights.uniforms.uGlow.value = night;
      // The balloons on the ground fill as the act arrives, then glow in turn.
      GLOW.forEach((g, i) => {
        glow.place(i, g.x, feet[i], g.z, smooth(weight), i * 1.1);
        glow.burn(i, night * glowAt(i, t));
      });
      glow.commit();
      // Short burns on the way down, then a steady glow once it has landed.
      const down = segment(p, 0.3, 0.42) * (1 - segment(p, 0.5, 0.6)) * 0.8;
      balloonOf(world).burn(Math.max(down, segment(p, 0.74, 0.9) * (0.5 + 0.2 * Math.sin(t * 0.8))) * weight);
    },
  };
};

export default act;
