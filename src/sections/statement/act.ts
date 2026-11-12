// Into the mist. The balloon sinks into a bright bank of it and the world whites out: the page's one
// light section. The camera drifts round to its side and back, the balloon half lost, while the line of type runs past.
import * as THREE from "three";
import { lerp, segment, track } from "@/stage/kit";
import type { ActFactory, Mood, Vec3 } from "@/stage/types";
import { moodAt } from "@/site/world";

const balloonZ = (p: number) => lerp(-200, -250, p);
const WHITE = new THREE.Color("#f1e9dc");
/** How white the world is: full on arrival (the engine blends it in), back to sky by p 1. */
const mist = (p: number) => 1 - segment(p, 0.84, 1);

const act: ActFactory = () => {
  const group = new THREE.Group();
  const bg = new THREE.Color();
  const fog = new THREE.Color();
  return {
    group,
    camera(p, aspect) {
      const phone = aspect < 1;
      const z = balloonZ(p);
      const s = phone ? 1.5 : 1;
      const offset: Vec3 = track(
        [
          [0, [3.5, 1.2, 17]],
          [0.5, [14 * s, 0.8, 6 * s]],
          [1, [3.5, 1.2, 17]],
        ],
        p,
      );
      const aim: Vec3 = track(
        [
          [0, [0, 0.3, -30]],
          [0.5, [0, phone ? -3 : -1.2, -2]],
          [1, [0, 0.3, -30]],
        ],
        p,
      );
      return { position: [offset[0], offset[1], z + offset[2]], target: [aim[0], aim[1], z + aim[2]], fov: track([[0, 40], [0.5, 44], [1, 40]], p) };
    },
    thread(p) {
      const arc = Math.sin(Math.PI * segment(p, 0.05, 0.95));
      return { position: [0, -1.6 * arc, balloonZ(p)], rotation: [0, 0, 0], scale: 1 };
    },
    mood(p): Mood {
      const sky = moodAt(balloonZ(p));
      const k = mist(p);
      bg.set(sky.background).lerp(WHITE, k);
      fog.set(sky.fog).lerp(WHITE, k);
      return { background: `#${bg.getHexString()}`, fog: `#${fog.getHexString()}`, fogDensity: lerp(sky.fogDensity, 0.045, k) };
    },
  };
};

export default act;
