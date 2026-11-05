// The stack deals itself out sideways, a row of plates in the dark. The camera drifts along the row,
// and the plate each card talks about lights up while the rest stay dim.
import * as THREE from "three";
import { segment, track } from "@/stage/kit";
import type { ActFactory, Vec3 } from "@/stage/types";
import { PLATE, plateOffset, terminalOf } from "@/site/terminal";

const ORIGIN: Vec3 = [0, 0.35, -44];
const EXPLODE = 0.35;
const place = (i: number) => {
  const o = plateOffset(i, EXPLODE, 1);
  return { x: ORIGIN[0] + o.x, y: ORIGIN[1] + o.y, z: ORIGIN[2] + o.z };
};
const TESTS = place(PLATE.tests);
const PROMPT = place(PLATE.prompt);
const PROJECTS = place(PLATE.projects);

const act: ActFactory = (world) => {
  const terminal = terminalOf(world);
  const glow = [0.05, 0.05, 0.05, 0.05, 0.05];
  return {
    group: new THREE.Group(),
    camera(p, aspect) {
      const tall = aspect < 1;
      const d = tall ? 10 : 7.6;
      const side = tall ? 0 : 1.7;
      const dropTarget = tall ? -2.2 : 0;
      const keys = (x: number, y: number, z: number): Vec3 => [x, y, z];
      return {
        position: track(
          [
            [0, keys(TESTS.x - side + 0.5, 0.6, TESTS.z + d + 0.6)],
            [0.22, keys(TESTS.x - side - 0.3, 0.5, TESTS.z + d)],
            [0.44, keys(PROMPT.x + side - 0.3, 0.4, PROMPT.z + d)],
            [0.6, keys(PROMPT.x + side - 0.1, 0.4, PROMPT.z + d - 0.3)],
            [0.78, keys(PROJECTS.x + 0.2, 0.2, PROJECTS.z + d + 0.6)],
            [1, keys(PROJECTS.x - 0.2, 0.2, PROJECTS.z + d + 0.2)],
          ],
          p,
        ),
        target: track(
          [
            [0, keys(TESTS.x - side, TESTS.y + dropTarget, TESTS.z)],
            [0.22, keys(TESTS.x - side, TESTS.y + dropTarget, TESTS.z)],
            [0.44, keys(PROMPT.x + side, PROMPT.y + dropTarget, PROMPT.z)],
            [0.6, keys(PROMPT.x + side, PROMPT.y + dropTarget, PROMPT.z)],
            [0.78, keys(PROJECTS.x, PROJECTS.y - (tall ? 2.2 : 1), PROJECTS.z)],
            [1, keys(PROJECTS.x, PROJECTS.y - (tall ? 2.2 : 1), PROJECTS.z)],
          ],
          p,
        ),
        fov: 34,
      };
    },
    thread() {
      return { position: ORIGIN, rotation: [0, 0, 0], scale: 1 };
    },
    mood() {
      return { background: "#000000", fog: "#000000", fogDensity: 0.016 };
    },
    update({ p, weight }) {
      const first = 1 - segment(p, 0.24, 0.36);
      const third = segment(p, 0.6, 0.7);
      glow[PLATE.tests] = 0.05 + 0.95 * first;
      glow[PLATE.prompt] = 0.05 + 0.95 * (1 - first) * (1 - third);
      glow[PLATE.projects] = 0.05 + 0.95 * third;
      terminal.pose({ explode: EXPLODE, fan: 1, glow }, weight);
    },
  };
};

export default act;
