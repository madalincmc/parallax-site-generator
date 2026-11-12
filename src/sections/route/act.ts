// The route. Sunrise turns to gold and then to morning as the balloon drifts past four summits that stand
// clear of the mist, one per career stop. Each carries a flag and its year, and the burner fires as the
// balloon passes it.
//
// Beats:
//  0. p 0.00–0.15  From behind: the summits ahead. "The route so far."
//  1. p 0.19–0.35  Side-on, passing summit 1 (p 0.27). 2013, QA Software Engineer.
//  2. p 0.39–0.55  From high behind, summit 2 on the left (p 0.47). 2018, QA Team Lead.
//  3. p 0.59–0.75  Low on the left and a little ahead, as it comes past summit 3 (p 0.67). 2020, Community Lead.
//  4. p 0.79–0.95  Close behind on the left, summit 4 ahead (p 0.87). 2026, Engineering Manager.
import * as THREE from "three";
import { instanced, lerp, track } from "@/stage/kit";
import type { ActFactory, Vec3 } from "@/stage/types";
import { makeLabel } from "@/site/label";
import { AMBER, balloonOf, heightAt, moodAt, SUMMITS } from "@/site/world";

const balloonZ = (p: number) => lerp(-40, -200, p);
const CODES: [string, string][] = [
  ["2013", "QA ENGINEER"],
  ["2018", "TEAM LEAD"],
  ["2020", "COMMUNITY LEAD"],
  ["2026", "ENG MANAGER"],
];

const act: ActFactory = (world) => {
  const group = new THREE.Group();
  const tops = SUMMITS.map(([x, z]) => heightAt(x, z));

  const poleMaterial = new THREE.MeshStandardMaterial({ color: "#2a2320", roughness: 0.8, transparent: true });
  const flagMaterial = new THREE.MeshBasicMaterial({ color: AMBER, side: THREE.DoubleSide, transparent: true, toneMapped: false });
  const poles = instanced(new THREE.CylinderGeometry(0.05, 0.08, 3.8, 6).translate(0, 1.9, 0), poleMaterial, SUMMITS.length, (d, i) => d.position.set(SUMMITS[i][0], tops[i] - 0.2, SUMMITS[i][1]));
  const pennant = new THREE.ShapeGeometry(new THREE.Shape([new THREE.Vector2(0.05, 3.7), new THREE.Vector2(0.05, 2.7), new THREE.Vector2(1.9, 3.2)]));
  const flags = instanced(pennant, flagMaterial, SUMMITS.length, () => {});
  const labels = CODES.map(([year, code], i) => {
    const label = makeLabel(year, code);
    label.scale.set(7, 1.75, 1);
    label.position.set(SUMMITS[i][0], tops[i] + 5.2, SUMMITS[i][1]);
    return label;
  });
  group.add(poles, flags, ...labels);

  return {
    group,
    camera(p, aspect) {
      const phone = aspect < 1;
      const z = balloonZ(p);
      const s = phone ? 1.4 : 1;
      const offset: Vec3 = track(
        [
          [0, [3.5, 1.2, 17]],
          [0.08, [5, 2.6, 20]],
          [0.27, [-17 * s, 0.6, -2]],
          [0.47, [-2, 12 * s, 10 * s]],
          [0.67, [-15 * s, -1, -7 * s]],
          [0.83, [-9 * s, 1.6, 15 * s]],
          [1, [3.5, 1.2, 17]],
        ],
        p,
      );
      const aim: Vec3 = track(
        [
          [0, [0, 0.3, -30]],
          [0.08, [0, -1.5, -30]],
          [0.27, phone ? [0, -4.6, -2] : [0, -2.6, -6]],
          [0.47, phone ? [0, -5, -2] : [6, -1, -2]],
          [0.67, phone ? [0, -4.6, 0] : [0.9, -2.8, -0.5]],
          [0.83, phone ? [0, -4.5, -20] : [16, -0.6, -20]],
          [1, [0, 0.3, -30]],
        ],
        p,
      );
      const fov = track([[0, 40], [0.27, 36], [0.47, 40], [0.67, 36], [0.83, 40], [1, 40]], p);
      return { position: [offset[0], offset[1], z + offset[2]], target: [aim[0], aim[1], z + aim[2]], fov };
    },
    thread(p) {
      return { position: [0, 0, balloonZ(p)], rotation: [0, 0, 0], scale: 1 };
    },
    mood: (p) => moodAt(balloonZ(p)),
    update({ p, weight, t }) {
      const z = balloonZ(p);
      poleMaterial.opacity = weight;
      flagMaterial.opacity = weight;
      // Abeam of a summit, 1; a few lengths before or after, 0.
      const pass = (i: number) => Math.exp(-Math.pow((z - SUMMITS[i][1]) / 5, 2));
      let burn = 0;
      for (let i = 0; i < SUMMITS.length; i++) {
        burn = Math.max(burn, pass(i));
        // A summit still ahead is faint; once reached, its label stays lit.
        (labels[i].material as THREE.SpriteMaterial).opacity = weight * (z < SUMMITS[i][1] + 14 ? 1 : 0.4);
      }
      flags.tick((d, i) => {
        d.position.set(SUMMITS[i][0], tops[i] - 0.2, SUMMITS[i][1]);
        d.rotation.y = 0.5 + 0.22 * Math.sin(t * 1.3 + i * 2.1);
      });
      balloonOf(world).burn(burn * weight);
      group.visible = weight > 0.002;
    },
  };
};

export default act;
