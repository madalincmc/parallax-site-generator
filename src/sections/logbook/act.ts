// Logbook. Sunset. The camera drops far back on a long lens and the balloon becomes a small shape against
// the low sun, pulling ahead of the six it flew with: a quiet, wide moment for the numbers.
import * as THREE from "three";
import { lerp, track } from "@/stage/kit";
import type { ActFactory, Vec3 } from "@/stage/types";
import { moodAt } from "@/site/world";

const balloonZ = (p: number) => lerp(-340, -400, p);

const act: ActFactory = () => {
  const group = new THREE.Group();
  return {
    group,
    camera(p, aspect) {
      const phone = aspect < 1;
      const z = balloonZ(p);
      const offset: Vec3 = track(
        [
          [0, [3.5, 1.2, 17]],
          [0.3, [-12, 1.4, 31]],
          [0.72, [-4, 3, 35]],
          [1, [3.5, 1.2, 17]],
        ],
        p,
      );
      const aim: Vec3 = track(
        [
          [0, [0, 0.3, -30]],
          [0.3, phone ? [-10, -6, -60] : [5, -3.5, -60]],
          [0.72, phone ? [-3, -6, -60] : [27, 1.5, -60]],
          [1, [0, 0.3, -30]],
        ],
        p,
      );
      return { position: [offset[0], offset[1], z + offset[2]], target: [aim[0], aim[1], z + aim[2]], fov: track([[0, 40], [0.3, 30], [0.72, 30], [1, 40]], p) };
    },
    thread(p) {
      return { position: [0, 0, balloonZ(p)], rotation: [0, 0, 0], scale: 1 };
    },
    mood: (p) => moodAt(balloonZ(p)),
  };
};

export default act;
