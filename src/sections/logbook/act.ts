// Logbook. Sunset. The camera drops far back on a long lens and the plane becomes a small silhouette
// with its contrails against the low sun: a quiet, wide moment for the numbers.
import * as THREE from "three";
import { lerp, track } from "@/stage/kit";
import type { ActFactory, Vec3 } from "@/stage/types";
import { moodAt } from "@/site/world";

const planeZ = (p: number) => lerp(-340, -400, p);

const act: ActFactory = () => {
  const group = new THREE.Group();
  return {
    group,
    camera(p, aspect) {
      const phone = aspect < 1;
      const z = planeZ(p);
      const offset: Vec3 = track(
        [
          [0, [2, 2.2, 11]],
          [0.3, [-9, 1.2, 24]],
          [0.72, [10, 1.6, 22]],
          [1, [2, 2.2, 11]],
        ],
        p,
      );
      const aim: Vec3 = track(
        [
          [0, [0, 0.5, -30]],
          [0.3, phone ? [-3, -3.5, -60] : [5, 2.5, -60]],
          [0.72, phone ? [3, -3.5, -60] : [-5, 2.5, -60]],
          [1, [0, 0.5, -30]],
        ],
        p,
      );
      return { position: [offset[0], offset[1], z + offset[2]], target: [aim[0], aim[1], z + aim[2]], fov: track([[0, 40], [0.3, 30], [0.72, 30], [1, 40]], p) };
    },
    thread(p) {
      return { position: [0, 0, planeZ(p)], rotation: [0.02, 0, 0], scale: 1 };
    },
    mood: (p) => moodAt(planeZ(p)),
  };
};

export default act;
