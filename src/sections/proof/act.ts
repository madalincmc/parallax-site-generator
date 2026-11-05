// A macro on the lamps for the project count, a wide shot with the plates lit behind the tester's
// numbers, and then the writing plate slides out for the latest post.
import * as THREE from "three";
import { segment, track } from "@/stage/kit";
import type { ActFactory, Vec3 } from "@/stage/types";
import { lampOffset, PLATE, plateOffset, terminalOf } from "@/site/terminal";

const ORIGIN: Vec3 = [0, 0.35, -56];
const LAMP = lampOffset(1);
const LAMP_AT: Vec3 = [ORIGIN[0] + LAMP.x, ORIGIN[1] + LAMP.y, ORIGIN[2] + LAMP.z];
const WIDE_EXPLODE = 0.6;
const DIM = 0.008; // the closed window's screen, nearly off, so the text over it stays clean
const writing = plateOffset(PLATE.writing, WIDE_EXPLODE, 0, 1);
const WRITING: Vec3 = [ORIGIN[0] + writing.x, ORIGIN[1] + writing.y, ORIGIN[2] + writing.z];

const act: ActFactory = (world) => {
  const terminal = terminalOf(world);
  const pull = [0, 0, 0, 0, 0];
  const glow = [1, 1, 1, 1, 1];
  return {
    group: new THREE.Group(),
    camera(p, aspect) {
      const tall = aspect < 1;
      return {
        position: track(
          [
            [0, tall ? [LAMP_AT[0], LAMP_AT[1] - 0.62, LAMP_AT[2] + 3.4] : [LAMP_AT[0] + 0.7, LAMP_AT[1] - 0.2, LAMP_AT[2] + 6]],
            [0.22, tall ? [LAMP_AT[0], LAMP_AT[1] - 0.62, LAMP_AT[2] + 3] : [LAMP_AT[0] + 0.4, LAMP_AT[1] + 0.02, LAMP_AT[2] + 1.75]],
            [0.5, tall ? [-3, 0.5, -44] : [-5, 2.4, -46]],
            [0.58, tall ? [-3.4, 0.5, -44] : [-5.6, 2.2, -46.5]],
            [0.86, tall ? [WRITING[0], -0.5, WRITING[2] + 9] : [WRITING[0] - 1, 0.5, WRITING[2] + 6.6]],
            [1, tall ? [WRITING[0], -0.5, WRITING[2] + 8.6] : [WRITING[0] - 1.2, 0.4, WRITING[2] + 6.2]],
          ] as [number, Vec3][],
          p,
        ),
        target: track(
          [
            [0, tall ? [LAMP_AT[0], LAMP_AT[1] - 0.62, LAMP_AT[2]] : [LAMP_AT[0] + 0.7, LAMP_AT[1] - 0.2, LAMP_AT[2]]],
            [0.22, tall ? [LAMP_AT[0], LAMP_AT[1] - 0.62, LAMP_AT[2]] : [LAMP_AT[0] + 0.45, LAMP_AT[1], LAMP_AT[2]]],
            [0.5, tall ? [0, -1.4, -54] : [1.4, 0.5, -54]],
            [0.58, tall ? [0, -1.4, -54] : [1.4, 0.5, -54]],
            [0.86, tall ? [WRITING[0], -1.6, WRITING[2]] : [WRITING[0] - 1.4, WRITING[1], WRITING[2]]],
            [1, tall ? [WRITING[0], -1.6, WRITING[2]] : [WRITING[0] - 1.4, WRITING[1], WRITING[2]]],
          ] as [number, Vec3][],
          p,
        ),
        fov: 30,
      };
    },
    thread() {
      return { position: ORIGIN, rotation: [0, 0, 0], scale: 1 };
    },
    update({ p, weight }) {
      const open = segment(p, 0.3, 0.44);
      const out = segment(p, 0.66, 0.76);
      pull[PLATE.writing] = out;
      for (let i = 0; i < 5; i++) {
        const lit = i === PLATE.teams ? DIM : 1;
        glow[i] = DIM + (lit - DIM) * open;
        if (out > 0) glow[i] = glow[i] + (0.012 - glow[i]) * out;
      }
      glow[PLATE.writing] = 1;
      terminal.pose({ explode: WIDE_EXPLODE * open, pull, glow }, weight);
    },
  };
};

export default act;
