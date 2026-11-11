// Departure. Before dawn, the plane comes toward the camera with the first light behind it, its windows
// and lights glowing. The camera swings down its side and settles behind it, looking down the route.
import * as THREE from "three";
import { lerp, track } from "@/stage/kit";
import type { ActFactory, Vec3 } from "@/stage/types";
import { moodAt } from "@/site/world";

const planeZ = (p: number) => lerp(0, -40, p);

const act: ActFactory = () => {
  const group = new THREE.Group();
  return {
    group,
    camera(p, aspect) {
      const phone = aspect < 1;
      const z = planeZ(p);
      const offset: Vec3 = track(
        [
          [0, phone ? [-5, -0.2, -17] : [-6.5, -0.4, -12]],
          [0.5, phone ? [-15, 1, 1] : [-10.5, 0.8, 1]],
          [1, [2, 2.2, 11]],
        ],
        p,
      );
      const aim: Vec3 = track(
        [
          [0, phone ? [0, 0.4, 0] : [0.6, 0.3, 0]],
          [0.5, phone ? [0, -2.2, 0] : [0, -1.4, -1]],
          [1, [0, 0.5, -30]],
        ],
        p,
      );
      return { position: [offset[0], offset[1], z + offset[2]], target: [aim[0], aim[1], z + aim[2]], fov: track([[0, 34], [0.5, 38], [1, 40]], p) };
    },
    thread(p) {
      return { position: [0, 0, planeZ(p)], rotation: [0.02, 0, 0], scale: 1 };
    },
    mood: (p) => moodAt(planeZ(p)),
  };
};

export default act;
