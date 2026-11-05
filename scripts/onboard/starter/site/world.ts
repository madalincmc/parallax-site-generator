// What every act shares: light, environment, atmosphere and the thread object.
import * as THREE from "three";
import { dust, studioEnvironment } from "@/stage/kit";
import type { WorldFactory } from "@/stage/types";

const createWorld: WorldFactory = ({ scene, renderer, isPhone }) => {
  const environment = studioEnvironment(renderer, {
    top: "#2a3a55",
    horizon: "#10141f",
    bottom: "#020306",
    lights: [
      { dir: [4, 5, 3], color: "#cfe4ff", size: 5, power: 7 },
      { dir: [-5, 1, -3], color: "#6fb7ff", size: 3, power: 5 },
    ],
  });
  scene.environment = environment;

  const key = new THREE.DirectionalLight("#dbe9ff", 1.5);
  key.position.set(4, 6, 5);
  scene.add(key);

  const thread = new THREE.Mesh(
    new THREE.TorusGeometry(1, 0.2, 48, 160),
    new THREE.MeshPhysicalMaterial({ color: "#c7d3e6", metalness: 1, roughness: 0.22, clearcoat: 0.6 }),
  );
  scene.add(thread);

  const specks = dust({ count: isPhone ? 500 : 1200, size: [40, 20, 60], color: "#9cc8ff", seed: 3 });
  scene.add(specks);

  return {
    scene,
    renderer,
    isPhone,
    thread,
    pointerSway: 0.14,
    mood: { background: "#07090f", fog: "#07090f", fogDensity: 0.035 },
    update({ t }) {
      specks.tick(t);
    },
    dispose() {
      environment.dispose();
    },
  };
};

export default createWorld;
