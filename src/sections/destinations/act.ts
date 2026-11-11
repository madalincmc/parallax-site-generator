// Destinations. In the gold of the afternoon, six snow-capped summits stand above the cloud, one per side
// project, each marked with a map pin and its name. The plane flies between them; the pins of the pair
// being read light up. Calm, wide moves: this is where the visitor reads.
import * as THREE from "three";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import { fbm2, instanced, lerp, segment, terrain, track } from "@/stage/kit";
import type { ActFactory, Vec3 } from "@/stage/types";
import { makeLabel } from "@/site/label";
import { moodAt, YELLOW } from "@/site/world";

const planeZ = (p: number) => lerp(-250, -340, p);
const BASE = -24;
const CENTER_Z = -330;
// x, z, summit height, width, card, category, name
const PEAKS: [number, number, number, number, number, string, string][] = [
  [20, -286, 7, 24, 0, "TEST AUTOMATION", "SELECTOR GENERATOR"],
  [34, -300, 4.5, 20, 0, "TEST AUTOMATION", "QA PLAYGROUND"],
  [-22, -306, 9, 26, 1, "BUILT WITH CLAUDE", "VIDEO GENERATOR"],
  [-38, -320, 5, 20, 1, "BUILT WITH CLAUDE", "LINKEDIN STUDIO"],
  [-12, -362, 8, 24, 2, "LIVE", "SNAPBUDGET"],
  [15, -370, 12, 28, 2, "LIVE", "HARDWICK"],
];

function heightAt(x: number, z: number) {
  // Warp the ground plan so no summit is a clean cone.
  const wx = x + fbm2(x * 0.045 + 5, z * 0.045) * 10;
  const wz = z + fbm2(x * 0.045, z * 0.045 + 9) * 10;
  let h = BASE;
  for (const [px, pz, top, w] of PEAKS) {
    const d = Math.hypot(wx - px, wz - pz);
    const k = Math.max(0, 1 - d / w);
    h = Math.max(h, BASE + (top - BASE) * Math.pow(k, 1.55));
  }
  const rise = Math.min(1, (h - BASE) / 10);
  // Sharp ridges with gullies between them.
  const ridge = 1 - Math.abs(fbm2(x * 0.15, z * 0.15)) * 2.2;
  const fine = fbm2(x * 0.5, z * 0.5);
  return h + (ridge * ridge * 5 - 2.2 + fine * 0.9) * rise;
}

const act: ActFactory = () => {
  const group = new THREE.Group();
  const rock = new THREE.Color("#353b54");
  const snow = new THREE.Color("#eef2fa");
  const rockLight = new THREE.Color("#555a70");
  const land = terrain({
    size: [150, 150],
    resolution: 150,
    height: (x, z) => heightAt(x, z + CENTER_Z),
    color: (h, x, z) => {
      // Snow settles high up and on gentle ground; steep faces stay bare rock.
      const zz = z + CENTER_Z;
      const slope = Math.hypot(heightAt(x + 0.8, zz) - h, heightAt(x, zz + 0.8) - h) / 0.8;
      const cover = (h + 3 + fbm2(x * 0.35, z * 0.35) * 2.5) / 5 - Math.max(0, slope - 0.9) * 0.9;
      const stone = rock.clone().lerp(rockLight, 0.5 + 0.5 * fbm2(x * 0.22, z * 0.22));
      return stone.lerp(snow, Math.min(1, Math.max(0, cover)));
    },
    roughness: 0.85,
  });
  land.position.z = CENTER_Z;
  group.add(land);

  // Map pins: a ball on a point, floating over each summit.
  const pinGeometry = mergeGeometries([
    new THREE.SphereGeometry(0.62, 24, 16).translate(0, 1.15, 0),
    new THREE.ConeGeometry(0.4, 1.1, 20).rotateX(Math.PI).translate(0, 0.42, 0),
  ])!;
  const pins = instanced(pinGeometry, new THREE.MeshBasicMaterial({ color: "#ffffff", toneMapped: false, fog: false }), PEAKS.length, () => {});
  const labels = PEAKS.map(([x, z, top, , , category, name]) => {
    const label = makeLabel(category, name);
    label.scale.set(10, 2.5, 1);
    label.position.set(x, top + 6.4, z);
    return label;
  });
  group.add(pins, ...labels);
  const summits = PEAKS.map(([x, z]) => heightAt(x, z));
  const yellow = new THREE.Color(YELLOW);
  const tint = new THREE.Color();

  /** How strongly card i's pair is in focus at p. */
  const focus = (card: number, p: number) => [segment(p, 0, 0.06) * (1 - segment(p, 0.3, 0.36)), segment(p, 0.32, 0.38) * (1 - segment(p, 0.63, 0.69)), segment(p, 0.65, 0.71)][card];

  return {
    group,
    camera(p, aspect) {
      const phone = aspect < 1;
      const z = planeZ(p);
      const s = phone ? 1.3 : 1;
      const offset: Vec3 = track(
        [
          [0, [-4.5 * s, 2.2, 11.5 * s]],
          [0.15, [-5 * s, 2.4, 11.5 * s]],
          [0.485, [5.5 * s, 2.4, 11.5 * s]],
          [0.81, [0, 1.3, 13 * s]],
          [1, [2, 2.2, 11]],
        ],
        p,
      );
      const aim: Vec3 = track(
        [
          [0, phone ? [5, -3, -40] : [9, 1.5, -40]],
          [0.15, phone ? [5, -3, -40] : [9, 1.5, -40]],
          [0.485, phone ? [-5, -3, -40] : [-10, 1.5, -40]],
          [0.81, phone ? [0, -4, -50] : [0, -3.6, -50]],
          [1, [0, 0.5, -30]],
        ],
        p,
      );
      return { position: [offset[0], offset[1], z + offset[2]], target: [aim[0], aim[1], z + aim[2]], fov: track([[0, 40], [0.81, 42], [1, 40]], p) };
    },
    thread(p) {
      const bank = track([[0, 0], [0.15, -0.1], [0.32, 0], [0.485, 0.1], [0.66, 0], [1, 0]], p);
      return { position: [0, 0, planeZ(p)], rotation: [0.02, 0, bank], scale: 1 };
    },
    mood: (p) => moodAt(planeZ(p)),
    update({ p, weight, t }) {
      // The range rises out of the cloud as the act arrives and sinks back as it leaves.
      const down = (1 - weight) * (1 - weight) * 36;
      land.position.y = -down;
      pins.tick((d, i) => {
        const [x, z] = PEAKS[i];
        d.position.set(x, summits[i] + 2.2 + 0.25 * Math.sin(t * 1.4 + i) - down, z);
        d.scale.setScalar(1 + 0.35 * focus(PEAKS[i][4], p));
      });
      PEAKS.forEach((peak, i) => {
        const f = focus(peak[4], p);
        pins.setColorAt(i, tint.copy(yellow).multiplyScalar(weight * (0.45 + 1.1 * f)));
        labels[i].position.y = summits[i] + 6.2 - down;
        (labels[i].material as THREE.SpriteMaterial).opacity = weight * (0.25 + 0.75 * f);
      });
      pins.instanceColor!.needsUpdate = true;
    },
  };
};

export default act;
