// The fleet. In the gold of the afternoon the balloon comes out of the mist among six others, one per
// side project, each in its own colours with its name above it. They drift along together; the pair being
// read fire their burners. Calm, wide moves: this is where the visitor reads.
//
// Cards:
//  0. p 0.00–0.30  Card on the left. From behind on the left: the thread right of centre, pair 1 beyond it
//                  on the right.
//  1. p 0.34–0.63  Card on the right. The mirror image: pair 2 on the left.
//  2. p 0.67–0.95  Card along the bottom. From straight behind, looking down a little: the thread high in
//                  the middle, pair 3 either side of it ahead, the other four at the edges.
import * as THREE from "three";
import { lerp, segment, track } from "@/stage/kit";
import type { ActFactory, Vec3 } from "@/stage/types";
import { makeLabel } from "@/site/label";
import { fleetOf, moodAt, projectAt, PROJECTS } from "@/site/world";

const balloonZ = (p: number) => lerp(-250, -340, p);
// card, category, name
const NAMES: [number, string, string][] = [
  [0, "TEST AUTOMATION", "SELECTOR GENERATOR"],
  [0, "TEST AUTOMATION", "QA PLAYGROUND"],
  [1, "BUILT WITH CLAUDE", "VIDEO GENERATOR"],
  [1, "BUILT WITH CLAUDE", "LINKEDIN STUDIO"],
  [2, "LIVE", "SNAPBUDGET"],
  [2, "LIVE", "HARDWICK"],
];

const act: ActFactory = (world) => {
  const group = new THREE.Group();
  const labels = NAMES.map(([, category, name]) => {
    const label = makeLabel(category, name);
    label.scale.set(6.4, 1.6, 1);
    return label;
  });
  group.add(...labels);
  const at = new THREE.Vector3();

  /** How strongly card i's pair is in focus at p. */
  const focus = (card: number, p: number) => [segment(p, 0, 0.06) * (1 - segment(p, 0.3, 0.36)), segment(p, 0.32, 0.38) * (1 - segment(p, 0.63, 0.69)), segment(p, 0.65, 0.71)][card];

  return {
    group,
    camera(p, aspect) {
      const phone = aspect < 1;
      const z = balloonZ(p);
      const s = phone ? 1.5 : 1;
      const offset: Vec3 = track(
        [
          [0, [-7 * s, 2, 19 * s]],
          [0.15, [-7 * s, 2.2, 19 * s]],
          [0.485, [7 * s, 2.2, 19 * s]],
          [0.81, [0, 1.3, 21 * s]],
          [1, [3.5, 1.2, 17]],
        ],
        p,
      );
      const aim: Vec3 = track(
        [
          [0, phone ? [5, -7, -30] : [6, 0.5, -30]],
          [0.15, phone ? [5, -7, -30] : [6, 0.5, -30]],
          [0.485, phone ? [-5, -7, -30] : [-6, 0.5, -30]],
          [0.81, phone ? [0, -12, -50] : [0, -9, -50]],
          [1, [0, 0.3, -30]],
        ],
        p,
      );
      return { position: [offset[0], offset[1], z + offset[2]], target: [aim[0], aim[1], z + aim[2]], fov: track([[0, 40], [0.81, 42], [1, 40]], p) };
    },
    thread(p) {
      return { position: [0, 0, balloonZ(p)], rotation: [0, 0, 0], scale: 1 };
    },
    mood: (p) => moodAt(balloonZ(p)),
    update({ p, weight, t }) {
      world.thread!.getWorldPosition(at);
      const fleet = fleetOf(world);
      PROJECTS.forEach((_, i) => {
        const f = focus(NAMES[i][0], p) * weight;
        const [x, y, z] = projectAt(i, at.z);
        labels[i].position.set(x, y + 5.6, z);
        (labels[i].material as THREE.SpriteMaterial).opacity = f;
        // The pair in focus take turns on the burner.
        fleet.burn(i, f * (0.3 + 0.45 * Math.max(0, Math.sin(t * 0.9 + i * Math.PI))));
      });
      group.visible = weight > 0.002;
    },
  };
};

export default act;
