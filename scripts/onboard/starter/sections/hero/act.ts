import * as THREE from "three";
import { glowLine, segment, track } from "@/stage/kit";
import type { ActFactory, Vec3 } from "@/stage/types";

const act: ActFactory = () => {
  const group = new THREE.Group();
  const lines = [0, 1, 2].map((i) =>
    glowLine(
      [
        [-14, -2 + i, -8 - i * 2],
        [-5, -1.2 + i * 0.5, -3],
        [0, -1.6, -1 + i],
        [6, -0.6 - i * 0.4, -4],
        [14, -2 - i, -9],
      ],
      { color: "#6fb7ff", width: 0.06 + i * 0.02 },
    ),
  );
  group.add(...lines);

  return {
    group,
    camera(p) {
      const position: Vec3 = track(
        [
          [0, [0, 0.2, 7.5]],
          [1, [-3.4, 0.8, 4.4]],
        ],
        p,
      );
      return { position, target: [0, 0.3, 0], fov: 38 };
    },
    thread(p, aspect) {
      const lift = aspect < 1 ? 0.9 : 0.5;
      return {
        position: [0, lift - segment(p, 0, 1) * 0.3, 0],
        rotation: [0.5 + p * 1.2, p * 2.4, 0],
        scale: 1,
      };
    },
    update({ p, weight }) {
      lines.forEach((line, i) => line.tick(0.35 + segment(p, 0, 0.8 - i * 0.1) * 0.65, weight));
    },
  };
};

export default act;
