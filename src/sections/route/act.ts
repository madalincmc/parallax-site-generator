// The route. Sunrise turns to bright morning as the plane flies a dashed line through four waypoint
// gates, one per career stop. Each gate swells and flares white as the plane passes through it, and the
// dashes it has flown shrink to dots behind it.
//
// Beats:
//  0. p 0.00–0.15  Chase view: the line of gates ahead. "The route so far."
//  1. p 0.19–0.35  Side-on, the plane crossing gate 1 (p 0.27). 2013, QA Software Engineer.
//  2. p 0.39–0.55  From above, gate 2 (p 0.47). 2018, QA Team Lead.
//  3. p 0.59–0.75  Low and ahead, looking back as it comes through gate 3 (p 0.67). 2020, Community Lead.
//  4. p 0.79–0.95  Close chase off the left wing into gate 4 (p 0.87). 2026, Engineering Manager.
import * as THREE from "three";
import { instanced, lerp, track } from "@/stage/kit";
import type { ActFactory, Vec3 } from "@/stage/types";
import { makeLabel } from "@/site/label";
import { GATES_Z, moodAt, YELLOW } from "@/site/world";

const planeZ = (p: number) => lerp(-40, -200, p);
const CODES: [string, string][] = [
  ["2013", "QAENG"],
  ["2018", "TLEAD"],
  ["2020", "CMNTY"],
  ["2026", "ENGMG"],
];
const DASHES = 54;
const dashZ = (i: number) => -44 - i * 3;

const act: ActFactory = () => {
  const group = new THREE.Group();
  const yellow = new THREE.Color(YELLOW);
  const white = new THREE.Color("#ffffff");
  const tint = new THREE.Color();

  // Solid lines, like the markings on a flight map: they must stay yellow against a bright sky.
  const line = new THREE.MeshBasicMaterial({ color: "#ffffff", transparent: true, toneMapped: false });
  const faint = new THREE.MeshBasicMaterial({ color: "#ffffff", transparent: true, opacity: 0.5, toneMapped: false });
  const rings = instanced(new THREE.TorusGeometry(4.6, 0.045, 8, 96), line, GATES_Z.length, () => {});
  const outer = instanced(new THREE.TorusGeometry(5.3, 0.016, 6, 96), faint, GATES_Z.length, (d, i) => d.position.set(0, 0, GATES_Z[i]));
  const dashes = instanced(new THREE.BoxGeometry(0.045, 0.045, 1.3), line, DASHES, () => {});
  const labels = CODES.map(([year, code], i) => {
    const label = makeLabel(year, code);
    label.position.set(0, 6.4, GATES_Z[i]);
    return label;
  });
  group.add(rings, outer, dashes, ...labels);

  return {
    group,
    camera(p, aspect) {
      const phone = aspect < 1;
      const z = planeZ(p);
      const s = phone ? 1.35 : 1;
      const offset: Vec3 = track(
        [
          [0, [2, 2.2, 11]],
          [0.12, [3, 2.8, 12.5]],
          [0.27, [-11 * s, 0.6, -2]],
          [0.47, [1, 10 * s, 6]],
          [0.58, [-10 * s, 4.5, -7 * s]],
          [0.67, [-7 * s, -0.7, -13 * s]],
          [0.83, [-3.6 * s, 1.6, 9 * s]],
          [1, [2, 2.2, 11]],
        ],
        p,
      );
      const aim: Vec3 = track(
        [
          [0, [0, 0.5, -30]],
          [0.12, [0, -1, -30]],
          [0.27, phone ? [0, -2.6, -2] : [0, -1.7, -2]],
          [0.47, phone ? [0, 0, 3] : [3.2, 0, -1.5]],
          [0.58, phone ? [0, -1.5, 0] : [0.6, -0.8, -0.5]],
          [0.67, phone ? [0, -2.4, 0] : [0.9, -1.3, -0.5]],
          [0.83, phone ? [0, -2.5, -20] : [13, -0.4, -20]],
          [1, [0, 0.5, -30]],
        ],
        p,
      );
      const fov = track([[0, 40], [0.27, 36], [0.47, 40], [0.67, 36], [0.83, 40], [1, 40]], p);
      return { position: [offset[0], offset[1], z + offset[2]], target: [aim[0], aim[1], z + aim[2]], fov };
    },
    thread(p) {
      return { position: [0, 0, planeZ(p)], rotation: [0.02, 0, 0], scale: 1 };
    },
    mood: (p) => moodAt(planeZ(p)),
    update({ p, weight }) {
      const z = planeZ(p);
      line.opacity = weight;
      faint.opacity = 0.5 * weight;
      const pass = (i: number) => {
        const d = (z - GATES_Z[i]) / 6;
        return Math.exp(-d * d);
      };
      rings.tick((d, i) => {
        d.position.set(0, 0, GATES_Z[i]);
        d.scale.setScalar(1 + 0.1 * pass(i));
      });
      for (let i = 0; i < GATES_Z.length; i++) {
        rings.setColorAt(i, tint.copy(yellow).lerp(white, pass(i) * 0.85));
        (labels[i].material as THREE.SpriteMaterial).opacity = weight * (z > GATES_Z[i] - 4 ? 1 : 0.3);
      }
      rings.instanceColor!.needsUpdate = true;
      dashes.tick((d, i) => {
        const dz = dashZ(i);
        d.position.set(0, 0, dz);
        // Ahead of the nose: full dashes. Behind it: dots.
        d.scale.z = dz > z - 4 ? 0.12 : 1;
      });
      for (let i = 0; i < DASHES; i++) dashes.setColorAt(i, yellow);
      dashes.instanceColor!.needsUpdate = true;
      group.visible = weight > 0.002;
    },
  };
};

export default act;
