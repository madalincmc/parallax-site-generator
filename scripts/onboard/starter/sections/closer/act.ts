import * as THREE from "three";
import { track } from "@/stage/kit";
import type { ActFactory, Vec3 } from "@/stage/types";

const act: ActFactory = () => ({
  group: new THREE.Group(),
  camera(p) {
    const position: Vec3 = track(
      [
        [0, [4, 2.4, 3]],
        [1, [0, 4.5, 11]],
      ],
      p,
    );
    return { position, target: [0, 1.2, 0], fov: 42 };
  },
  thread(p) {
    return { position: [0, 2.6, -1], rotation: [1.4 - p * 1.2, 2.4 + p, 0], scale: 1 + p * 0.5 };
  },
  mood(p) {
    return { background: p > 0.5 ? "#0b1424" : "#07090f", fog: "#0b1424", fogDensity: 0.03 };
  },
});

export default act;
