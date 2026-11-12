// Lift-off. Before dawn, the balloon hangs over the mist with the first light behind it, a dark shape lit
// from inside by its burner. The camera swings round its side as the sun comes up, and settles behind it,
// looking down the route.
import * as THREE from "three";
import { lerp, segment, track } from "@/stage/kit";
import type { ActFactory, Vec3 } from "@/stage/types";
import { balloonOf, moodAt } from "@/site/world";

const balloonZ = (p: number) => lerp(0, -40, p);

const act: ActFactory = (world) => {
  const group = new THREE.Group();
  return {
    group,
    camera(p, aspect) {
      const phone = aspect < 1;
      const z = balloonZ(p);
      const offset: Vec3 = track(
        [
          [0, phone ? [-4, -1, -27] : [-6, -1.6, -20]],
          [0.16, phone ? [-5, -0.8, -27] : [-7.5, -1.3, -20]],
          [0.5, phone ? [-27, 1, 1] : [-19, 0.6, 1]],
          [1, [3.5, 1.2, 17]],
        ],
        p,
      );
      const aim: Vec3 = track(
        [
          [0, phone ? [0, 0.5, 0] : [0.4, 0.4, 0]],
          [0.16, phone ? [0, 0.5, 0] : [0.4, 0.4, 0]],
          [0.5, phone ? [0, -4.5, 0] : [0, -2.8, -1]],
          [1, [0, 0.3, -30]],
        ],
        p,
      );
      return { position: [offset[0], offset[1], z + offset[2]], target: [aim[0], aim[1], z + aim[2]], fov: track([[0, 34], [0.5, 38], [1, 40]], p) };
    },
    thread(p) {
      return { position: [0, 0, balloonZ(p)], rotation: [0, 0, 0], scale: 1 };
    },
    mood: (p) => moodAt(balloonZ(p)),
    update({ p, t, weight }) {
      // In the dark the burner breathes on its own; the first scroll gives it a long burn.
      const idle = 0.35 + 0.3 * Math.sin(t * 0.9) * Math.sin(t * 0.37 + 1);
      const lift = segment(p, 0.01, 0.08) * (1 - segment(p, 0.3, 0.45));
      balloonOf(world).burn(Math.max(idle * (1 - segment(p, 0, 0.5)), lift) * weight);
    },
  };
};

export default act;
