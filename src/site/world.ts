// One drift, one corridor. The balloon drifts away from the viewer, toward -z, at y 0 above mountains
// whose valleys are full of mist, and the time of day is a function of how far it has drifted. Each act
// owns a stretch of the route:
//   hero         z    0 to  -40   pre-dawn to first light (the sun rises behind the balloon, at +z)
//   route        z  -40 to -200   sunrise to gold to morning; four flagged summits beside the route, SUMMITS
//   statement    z -200 to -250   down into a bank of mist: a white-out, the page's one light section
//   destinations z -250 to -340   golden afternoon; six project balloons drift along in formation
//   logbook      z -340 to -400   sunset, the sun low ahead (-z); the six spread wide to the sides
//   closer       z -400 to -512   dusk to night; the mist ends near z -452 and the balloon lands in a
//                                 meadow, FIELD_Z -516 on the ground at GROUND_Y -18
//
// Thread: the balloon (src/site/balloon.ts). Its origin is the middle of its height: about 4.2 up and
// down, 2.6 to each side, so it is tall, and fills a phone screen well. Pose it with `thread()`; it turns
// and sways slowly on its own, so leave its rotation at 0. `balloonOf(world).burn(0..1)`, asked every frame
// from an act's update, fires the burner and lights the fabric from inside. It also fires by itself now
// and then.
//
// Fleet: `fleetOf(world)` are the other balloons. The first six are the projects, in PROJECTS order. They
// wait at z -250, drift with the thread through destinations (`projectAt(i, threadZ)` is where each is),
// keep pace through logbook while spreading wide, and stop at z -400. `.burn(i, 0..1)` lights one; ask every frame.
//
// Sky: everything that depends on the time of day (sky dome, sun, stars, the colour of slopes, mist and
// fabric) follows the balloon's z by itself. Acts only return `moodAt(z)` from `mood(p)`, with z the
// balloon's z at p, so the haze matches. Override it only for a deliberate change, like the white-out.
//
// Land: `heightAt(x, z)` is the ground. Under the route it stays below y -9; to the sides, peaks rise past
// y 15. Mist lies at MIST_Y -14.5 and hides everything below about y -12. Keep the camera above y -6 and
// within 30 of the route, and it will never meet a slope.
//
// Palette: field #17122e, ink #fbf4ec, accent amber #ffb648, crimson #c3202e, cream #f6e7c8, navy #1b2e66.
// Camera: another balloon's passenger with a long lens. Mostly 14 to 30 units from the balloon, fov 30 to
// 46, slow gliding moves around it. Hand over from behind and slightly to the right, about
// [x 3.5, y 1.2, z +17] from it, looking far ahead down -z.
import * as THREE from "three";
import { studioEnvironment } from "@/stage/kit";
import type { Vec3, World, WorldFactory } from "@/stage/types";
import { buildBalloon, buildFleet, type BalloonApi, type Livery } from "./balloon";
import { buildLand } from "./land";
import { atmos, buildDome, makeSky, moodAt, skyAt } from "./sky";

export { BALLOON_FOOT } from "./balloon";
export { FIELD_Z, GROUND_Y, heightAt, MIST_Y, SUMMITS } from "./land";
export { moodAt, skyAt } from "./sky";

export const AMBER = "#ffb648";

/** The six project balloons: where each flies relative to the thread while they drift together. */
export const PROJECTS: { rel: Vec3; livery: Livery }[] = [
  { rel: [12, 1.5, -2], livery: { colors: ["#1f8a8a", "#f6e7c8", "#1b2e66", "#f09a1e"], style: 0 } },
  { rel: [17, 3, -19], livery: { colors: ["#c3202e", "#f6e7c8", "#1b2e66", "#1b2e66"], style: 1 } },
  { rel: [-12, 1, -3], livery: { colors: ["#6b3fa0", "#f09a1e", "#f6e7c8", "#3a1f66"], style: 2 } },
  { rel: [-18, 3.5, -21], livery: { colors: ["#2a6fc4", "#f6e7c8", "#2a6fc4", "#f6e7c8"], style: 0 } },
  { rel: [-10, 4, -30], livery: { colors: ["#2f9e62", "#f6e7c8", "#f0c21e", "#1d5c3a"], style: 1 } },
  { rel: [11, 5.5, -38], livery: { colors: ["#8a4a22", "#f6e7c8", "#c9772c", "#3f2614"], style: 0 } },
];
// Others, far off along the route, so the sky is never empty.
const OTHERS: { at: Vec3; livery: Livery }[] = [
  { at: [40, 6, 62], livery: { colors: ["#2a6fc4", "#f6e7c8", "#f09a1e", "#1b2e66"], style: 0 } },
  { at: [-64, 10, 105], livery: { colors: ["#c3202e", "#f0c21e", "#c3202e", "#3f2614"], style: 2 } },
  { at: [-52, 8, -105], livery: { colors: ["#2f9e62", "#f6e7c8", "#2f9e62", "#f09a1e"], style: 0 } },
  { at: [58, 4, -168], livery: { colors: ["#6b3fa0", "#f6e7c8", "#f09a1e", "#3a1f66"], style: 1 } },
  { at: [-70, 11, -222], livery: { colors: ["#f09a1e", "#f6e7c8", "#c3202e", "#1b2e66"], style: 0 } },
  { at: [46, 7, -432], livery: { colors: ["#1f8a8a", "#f0c21e", "#f6e7c8", "#1b2e66"], style: 2 } },
  { at: [-52, 3, -458], livery: { colors: ["#c3202e", "#f6e7c8", "#2a6fc4", "#1b2e66"], style: 1 } },
];

const FORMATION_FROM = -250;
const FORMATION_TO = -340;
const PARTING_TO = -400;
/** Where project balloon `i` is when the thread is at `threadZ`. */
export function projectAt(i: number, threadZ: number): Vec3 {
  const [x, y, z] = PROJECTS[i].rel;
  // Past the formation they keep pace for a while, but spread wide and climb, opening the sky for the sunset.
  const k = Math.min(1, Math.max(0, (FORMATION_TO - threadZ) / (FORMATION_TO - PARTING_TO)));
  const part = k * k * (3 - 2 * k);
  return [x * (1 + 2.6 * part), y + 3 * part, z + Math.min(FORMATION_FROM, Math.max(PARTING_TO, threadZ))];
}

export type FleetApi = {
  /** 0..1 burner of balloon `i`. Ask every frame. */
  burn(i: number, value: number): void;
};

/** The thread's controls. */
export const balloonOf = (world: World) => world.thread!.userData.balloon as BalloonApi;
/** The other balloons' controls. */
export const fleetOf = (world: World) => world.thread!.userData.fleet as FleetApi;

const createWorld: WorldFactory = ({ scene, renderer, isPhone }) => {
  const environment = studioEnvironment(renderer, {
    top: "#b9a6d8",
    horizon: "#f6dcc4",
    bottom: "#8a6a7c",
    lights: [
      { dir: [3, 6, 4], color: "#ffffff", size: 5, power: 6 },
      { dir: [-5, 2, -3], color: "#ffe6d0", size: 3, power: 3 },
    ],
  });
  scene.environment = environment;

  const sun = new THREE.DirectionalLight("#ffffff", 2);
  const moon = new THREE.DirectionalLight("#8fa6e6", 0);
  moon.position.set(40, 70, 30);
  const fill = new THREE.HemisphereLight("#ffffff", "#ffffff", 0.5);
  scene.add(sun, sun.target, moon, fill);

  const dome = buildDome();
  const land = buildLand(isPhone);
  const balloon = buildBalloon(isPhone);
  const fleet = buildFleet([...PROJECTS.map((p) => p.livery), ...OTHERS.map((o) => o.livery)]);
  scene.add(dome.mesh, land.group, fleet.mesh, balloon.group);

  const asked = new Float32Array(fleet.count);
  const fleetApi: FleetApi = { burn: (i, v) => (asked[i] = Math.max(asked[i], v)) };
  balloon.group.userData.fleet = fleetApi;

  const sky = makeSky();
  const at = new THREE.Vector3();
  const white = new THREE.Color("#ffffff");

  return {
    scene,
    renderer,
    isPhone,
    thread: balloon.group,
    pointerSway: 0.5,
    mood: moodAt(0),
    update({ t }) {
      balloon.group.getWorldPosition(at);
      skyAt(at.z, sky);
      const fog = scene.fog as THREE.FogExp2;
      const day = 1 - sky.night;
      const height = Math.max(0, sky.sunDir.y + 0.12);
      const strength = sky.power * Math.min(1, height * 3 + 0.25);

      atmos.uTime.value = t;
      atmos.uSunDir.value.copy(sky.sunDir);
      atmos.uSunCol.value.copy(sky.sun).multiplyScalar(strength);
      atmos.uLit.value.copy(sky.lit);
      atmos.uShadow.value.copy(sky.shadow);
      atmos.uMist.value.copy(sky.horizon).lerp(white, 0.1 * day);
      atmos.uAmbTop.value.copy(sky.zenith).lerp(sky.horizon, 0.5).lerp(white, 0.3 * day).multiplyScalar(0.5 + 0.35 * day);
      atmos.uAmbBottom.value.copy(sky.shadow).lerp(sky.lit, 0.45).multiplyScalar(0.55 + 0.3 * day);

      dome.mesh.position.copy(at);
      dome.uniforms.uZenith.value.copy(sky.zenith);
      dome.uniforms.uHorizon.value.copy(sky.horizon);
      dome.uniforms.uSun.value.copy(sky.sun);
      dome.uniforms.uPower.value = sky.power;
      dome.uniforms.uStars.value = sky.stars;
      dome.uniforms.uFog.value.copy(fog.color);
      dome.uniforms.uFogK.value = 1 - Math.exp(-Math.pow(fog.density * 130, 2));

      land.follow(at.x, at.z);

      // The fleet: each bobs and turns a little, and fires its burner now and then on its own clock.
      for (let i = 0; i < fleet.count; i++) {
        const [x, y, z] = i < PROJECTS.length ? projectAt(i, at.z) : OTHERS[i - PROJECTS.length].at;
        fleet.place(i, x, y + 0.14 * Math.sin(t * 0.7 + i * 1.9), z, 1, i * 1.3 + t * 0.05);
        const phase = ((t + i * 3.7) % 11) / 11;
        const auto = 0.6 * Math.min(1, phase / 0.02) * Math.min(1, Math.max(0, (0.16 - phase) / 0.04));
        fleet.burn(i, Math.max(asked[i], auto) * (0.86 + 0.14 * Math.sin(t * 37 + i)));
        asked[i] = 0;
      }
      fleet.commit();
      balloon.tick(t);

      // By night the moon takes over from the sun for the basket and rigging.
      const moonK = Math.min(1, Math.max(0, (sky.night - 0.55) / 0.45)) * (1 - sky.power);
      sun.color.copy(sky.sun);
      sun.intensity = 3.2 * strength;
      sun.position.copy(at).addScaledVector(sky.sunDir, 80);
      sun.target.position.copy(at);
      moon.intensity = 0.5 * moonK;
      fill.color.copy(sky.zenith).lerp(sky.horizon, 0.5);
      fill.groundColor.copy(sky.shadow).lerp(sky.lit, 0.4);
      fill.intensity = 0.35 + 0.9 * day;
      scene.environmentIntensity = 0.1 + 0.75 * day;
    },
    dispose() {
      environment.dispose();
      balloon.dispose();
    },
  };
};

export default createWorld;
