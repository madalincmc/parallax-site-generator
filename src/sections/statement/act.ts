// The flash. The field turns white and the exploded stack crosses the screen, black on white, in step
// with the line of type sliding the other way.
import * as THREE from "three";
import { track } from "@/stage/kit";
import type { ActFactory, Vec3 } from "@/stage/types";
import { terminalOf } from "@/site/terminal";

const LIGHT = "#f7f6fa";

const act: ActFactory = (world) => {
  const terminal = terminalOf(world);
  return {
    group: new THREE.Group(),
    camera(p, aspect) {
      const back = aspect < 1 ? 13 : 10;
      return {
        position: track([[0, [0.8, 0.6, -28 + back]], [1, [-0.8, 0.3, -28 + back]]] as [number, Vec3][], p),
        target: [0, 0.4, -30],
        fov: 34,
      };
    },
    thread(p, aspect) {
      const span = aspect < 1 ? 3.4 : 5.6;
      return {
        position: track([[0, [span, -0.35, -30.5]], [1, [-span - 0.6, -0.35, -30.5]]] as [number, Vec3][], p),
        rotation: [0.06, 0.95 - p * 0.5, 0],
        scale: 0.62,
      };
    },
    mood() {
      return { background: LIGHT, fog: LIGHT, fogDensity: 0.03 };
    },
    update({ weight }) {
      terminal.pose({ explode: 1 }, weight);
    },
  };
};

export default act;
