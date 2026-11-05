// The payoff. The window closes for good, its screen now asking for you, and the camera pulls right
// back to reveal what the page held back: a whole night city of small lit windows behind it.
import * as THREE from "three";
import { canvasTexture, instanced, rng, segment, track } from "@/stage/kit";
import type { ActFactory, Vec3 } from "@/stage/types";
import { COLORS, terminalOf } from "@/site/terminal";

const act: ActFactory = (world) => {
  const terminal = terminalOf(world);
  const group = new THREE.Group();
  const r = rng(77);

  const texture = canvasTexture(
    128,
    (ctx, s) => {
      ctx.fillStyle = "#0b0b0e";
      ctx.fillRect(0, 0, s, s);
      ctx.strokeStyle = "#ffffff";
      ctx.lineWidth = 3;
      ctx.strokeRect(2, 2, s - 4, s - 4);
      ctx.fillStyle = "#ffffff";
      [0, 1, 2].forEach((i) => {
        ctx.beginPath();
        ctx.arc(16 + i * 14, 16, 4.5, 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.globalAlpha = 0.65;
      for (let i = 0; i < 5; i++) ctx.fillRect(12, 38 + i * 15, 30 + (i * 37) % 70, 6);
    },
    true,
  );
  const count = world.isPhone ? 180 : 420;
  const material = new THREE.MeshBasicMaterial({ map: texture, transparent: true, opacity: 0, toneMapped: false, depthWrite: false });
  const city = instanced(new THREE.PlaneGeometry(1.6, 1), material, count, (dummy) => {
    const z = -84 - r() * 90;
    // A skyline with a valley in the middle, so the sky above the window stays clear for the words.
    const spread = 26 + (-84 - z) * 0.55;
    const x = (r() - 0.5) * 2 * spread;
    const edge = Math.min(1, Math.abs(x) / spread);
    dummy.position.set(x, -0.6 + Math.pow(r(), 1.6) * (1.5 + Math.pow(edge, 1.5) * 20), z);
    dummy.scale.setScalar(0.7 + r() * 1.5);
  });
  const tint = new THREE.Color();
  const palette = [COLORS.red, COLORS.amber, COLORS.green, COLORS.white, COLORS.white];
  for (let i = 0; i < count; i++) {
    city.setColorAt(i, tint.set(palette[Math.floor(r() * palette.length)]).multiplyScalar(0.25 + r() * 0.45));
  }
  group.add(city);

  return {
    group,
    camera(p, aspect) {
      const tall = aspect < 1;
      const from: Vec3 = tall ? [0.6, -1.4, -60.5] : [2.2, 0.1, -61];
      const to: Vec3 = tall ? [0, -0.8, -58] : [0, 0.3, -54];
      return {
        position: track([[0, from], [0.5, to], [1, to]] as [number, Vec3][], p),
        target: track(
          [
            [0, tall ? [0, -2.4, -70] : [0, 0, -70]],
            [0.5, tall ? [0, -1, -70] : [0, 2.9, -70]],
            [1, tall ? [0, -1, -70] : [0, 2.9, -70]],
          ] as [number, Vec3][],
          p,
        ),
        fov: 34,
      };
    },
    thread(p, aspect) {
      const settle = 1 - segment(p, 0, 0.5);
      return { position: [0, aspect < 1 ? -1.5 : 0, -70], rotation: [0, 0.35 * settle, 0], scale: 1 };
    },
    mood() {
      return { background: "#000000", fog: "#000000", fogDensity: 0.006 };
    },
    update({ p, weight }) {
      material.opacity = segment(p, 0.1, 0.7) * weight;
      city.visible = material.opacity > 0.002;
      terminal.pose({ contact: segment(p, 0, 0.2) }, weight);
    },
    dispose() {
      texture.dispose();
    },
  };
};

export default act;
