// Beats:
// p 0.00-0.17  The closed window floats apart along Z while the camera swings low and wide.
//              "What I do." The stack of five plates is revealed.
// p 0.20-0.38  The teams plate slides out to the right, an org tree in amber. Text left.
// p 0.40-0.58  The tests plate slides out to the left, rows of green ticks. Text right.
// p 0.60-0.78  The projects plate slides out to the right, close up. Caption along the bottom.
// p 0.80-1.00  The writing plate slides out to the left. Text upper right. Handed on fully exploded.
import * as THREE from "three";
import { lerp, segment, track } from "@/stage/kit";
import type { ActFactory, Vec3 } from "@/stage/types";
import { plateOffset, terminalOf } from "@/site/terminal";

const ORIGIN_Z = -16.3;
const Y = 0.35;

const at = (i: number, sign: number) => {
  const o = plateOffset(i, 1, 0, sign);
  return { x: o.x, y: Y + o.y, z: ORIGIN_Z + o.z };
};
const TEAMS = at(1, 1);
const TESTS = at(2, -1);
const PROJECTS = at(3, 1);
const WRITING = at(4, -1);

type Keys = [number, Vec3][];

const wide: { position: Keys; target: Keys } = {
  position: [
    [0, [0.2, -0.4, -6]],
    [0.16, [8.6, -1.4, -9.6]],
    [0.26, [TEAMS.x - 0.75, 0.5, TEAMS.z + 6.6]],
    [0.34, [TEAMS.x - 0.95, 0.4, TEAMS.z + 6.3]],
    [0.46, [TESTS.x + 0.8, 0.4, TESTS.z + 6.5]],
    [0.54, [TESTS.x + 1.0, 0.3, TESTS.z + 6.2]],
    [0.66, [PROJECTS.x - 0.1, -0.3, PROJECTS.z + 5.8]],
    [0.74, [PROJECTS.x + 0.1, -0.4, PROJECTS.z + 5.2]],
    [0.86, [WRITING.x + 1.2, 0.5, WRITING.z + 7]],
    [1, [WRITING.x + 1.5, 0.4, WRITING.z + 6.5]],
  ],
  target: [
    [0, [0, -0.4, -14]],
    [0.16, [0, -0.5, -14]],
    [0.26, [TEAMS.x - 1.4, TEAMS.y, TEAMS.z]],
    [0.34, [TEAMS.x - 1.4, TEAMS.y, TEAMS.z]],
    [0.46, [TESTS.x + 1.4, TESTS.y, TESTS.z]],
    [0.54, [TESTS.x + 1.4, TESTS.y, TESTS.z]],
    [0.66, [PROJECTS.x, PROJECTS.y - 0.65, PROJECTS.z]],
    [0.74, [PROJECTS.x, PROJECTS.y - 0.65, PROJECTS.z]],
    [0.86, [WRITING.x + 1.4, WRITING.y - 0.1, WRITING.z]],
    [1, [WRITING.x + 1.4, WRITING.y - 0.1, WRITING.z]],
  ],
};

// On a phone the text sits at the bottom, so each plate is centered and framed high.
const tall: { position: Keys; target: Keys } = {
  position: [
    [0, [0, -1.6, -4.5]],
    [0.16, [6, -2, -6]],
    [0.26, [TEAMS.x, -1, TEAMS.z + 9]],
    [0.46, [TESTS.x, -1, TESTS.z + 9]],
    [0.66, [PROJECTS.x, -1, PROJECTS.z + 8.5]],
    [0.86, [WRITING.x, -1, WRITING.z + 9]],
    [1, [WRITING.x, -1, WRITING.z + 9]],
  ],
  target: [
    [0, [0, -1.1, -14]],
    [0.16, [0, -1.2, -14]],
    [0.26, [TEAMS.x, -1.6, TEAMS.z]],
    [0.46, [TESTS.x, -1.6, TESTS.z]],
    [0.66, [PROJECTS.x, -1.6, PROJECTS.z]],
    [0.86, [WRITING.x, -1.6, WRITING.z]],
    [1, [WRITING.x, -1.6, WRITING.z]],
  ],
};

const act: ActFactory = (world) => {
  const terminal = terminalOf(world);
  const pull = [0, 0, 0, 0, 0];
  const glow = [1, 1, 1, 1, 1];
  return {
    group: new THREE.Group(),
    camera(p, aspect) {
      const path = aspect < 1 ? tall : wide;
      return { position: track(path.position, p), target: track(path.target, p), fov: 32 };
    },
    thread(p) {
      const open = segment(p, 0, 0.16);
      return { position: [0, Y, lerp(-14, ORIGIN_Z, open)], rotation: [0, 0, 0], scale: 1 };
    },
    update({ p, weight }) {
      pull[1] = segment(p, 0.16, 0.24) - segment(p, 0.36, 0.44);
      pull[2] = -(segment(p, 0.36, 0.44) - segment(p, 0.56, 0.64));
      pull[3] = segment(p, 0.56, 0.64) - segment(p, 0.76, 0.84);
      pull[4] = -segment(p, 0.76, 0.84);
      const dim = 1 - segment(p, 0.14, 0.2) * 0.988;
      for (let i = 0; i < 5; i++) glow[i] = Math.max(dim, Math.abs(pull[i]));
      terminal.pose({ explode: segment(p, 0, 0.16), pull, glow }, weight);
    },
  };
};

export default act;
