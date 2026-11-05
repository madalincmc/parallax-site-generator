// The window opens turned away and small, then swings to face the viewer as the camera pushes in.
// Its insides are held back for the story.
import * as THREE from "three";
import { segment, track } from "@/stage/kit";
import type { ActFactory, Vec3 } from "@/stage/types";
import { terminalOf } from "@/site/terminal";

const act: ActFactory = (world) => {
  const terminal = terminalOf(world);
  return {
    group: new THREE.Group(),
    camera(p, aspect) {
      if (aspect < 1) {
        return {
          position: track([[0, [0, -1.2, 13]], [1, [0, -1.6, 9.5]]] as [number, Vec3][], p),
          target: [0, -1.1, 0],
          fov: 30,
        };
      }
      return {
        position: track([[0, [0, 0.5, 12.5]], [0.55, [-0.4, -0.2, 8.4]], [1, [0.2, -0.4, 8]]] as [number, Vec3][], p),
        target: track([[0, [0, 0.35, 0]], [1, [0, -0.4, 0]]] as [number, Vec3][], p),
        fov: 30,
      };
    },
    thread(p) {
      const turn = 1 - segment(p, 0, 0.55);
      return { position: [0, 0.35, 0], rotation: [0.1 * turn, -0.62 * turn, 0.03 * turn], scale: 1 };
    },
    update({ weight }) {
      terminal.pose({}, weight);
    },
  };
};

export default act;
