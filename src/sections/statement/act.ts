// Into the cloud. The plane dips into the bright tops and the world whites out: the page's one light
// section. It rolls past close to the camera in the mist while the line of type runs the other way.
import * as THREE from "three";
import { lerp, segment, track } from "@/stage/kit";
import type { ActFactory, Mood, Vec3 } from "@/stage/types";
import { moodAt, planeOf } from "@/site/world";

const planeZ = (p: number) => lerp(-200, -250, p);
const WHITE = new THREE.Color("#e7eefa");
/** How white the world is: full on arrival (the engine blends it in), back to sky by p 1. */
const mist = (p: number) => 1 - segment(p, 0.84, 1);

const act: ActFactory = (world) => {
  const group = new THREE.Group();
  const bg = new THREE.Color();
  const fog = new THREE.Color();
  return {
    group,
    camera(p, aspect) {
      const phone = aspect < 1;
      const z = planeZ(p);
      const s = phone ? 1.5 : 1;
      const offset: Vec3 = track(
        [
          [0, [2, 2.2, 11]],
          [0.22, [-6.5 * s, 0.9, -8 * s]],
          [0.62, [6 * s, 0.6, 3.5 * s]],
          [1, [2, 2.2, 11]],
        ],
        p,
      );
      const aim: Vec3 = track(
        [
          [0, [0, 0.5, -30]],
          [0.22, [0, phone ? -2.2 : -1.2, 0]],
          [0.62, [0, phone ? -2.2 : -1.0, -1]],
          [1, [0, 0.5, -30]],
        ],
        p,
      );
      return { position: [offset[0], offset[1], z + offset[2]], target: [aim[0], aim[1], z + aim[2]], fov: track([[0, 40], [0.4, 46], [1, 40]], p) };
    },
    thread(p) {
      const f = segment(p, 0.05, 0.95);
      const arc = Math.sin(Math.PI * f);
      return { position: [0, -1.1 * arc, planeZ(p)], rotation: [0.02 - 0.05 * Math.sin(2 * Math.PI * f), 0, 0.42 * arc], scale: 1 };
    },
    mood(p): Mood {
      const sky = moodAt(planeZ(p));
      const k = mist(p);
      bg.set(sky.background).lerp(WHITE, k);
      fog.set(sky.fog).lerp(WHITE, k);
      return { background: `#${bg.getHexString()}`, fog: `#${fog.getHexString()}`, fogDensity: lerp(sky.fogDensity, 0.055, k) };
    },
    update({ weight }) {
      planeOf(world).trail(1 - 0.7 * weight);
    },
  };
};

export default act;
