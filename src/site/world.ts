// One Z corridor, each act owning 14 units, going away from the viewer. Close enough that the engine's
// one-screen handoffs read as a dolly, not a jump.
// hero z 0, story z -14, statement z -28, features z -42, proof z -56, closer z -70.
//
// Thread: a dark metal terminal window, ~/portfolio — zsh (src/site/terminal.ts). Named parts: bezel,
// back, 3 lamps and 5 plates, front to back: prompt, teams, tests, projects, writing. Pose it from an
// act's update with `terminalOf(world).pose({ explode, fan, contact, lamps, pull, glow }, weight)`.
// Palette: field #000000 (statement flips to #f7f6fa), ink #ffffff, muted #a3a3a3, and the only colors
// are the lamps' #ff5f57, #febc2e and #28c840. Everything else is black metal.
// Camera: long lens, fov 30 to 36, eye height near the window's middle, moving slowly. The floor is at
// y -3 and carries the reference site's grid plus the lamps' pools of light. Dark slabs stand along both
// sides at |x| >= 9, so keep camera paths inside them.
import * as THREE from "three";
import { dust, instanced, rng, studioEnvironment } from "@/stage/kit";
import type { WorldFactory } from "@/stage/types";
import { buildTerminal, COLORS, lampOffset } from "./terminal";

export const FLOOR_Y = -3;

const createWorld: WorldFactory = ({ scene, renderer, isPhone }) => {
  const environment = studioEnvironment(renderer, {
    top: "#26262c",
    horizon: "#0a0a0c",
    bottom: "#000000",
    lights: [
      { dir: [3, 6, 5], color: "#ffffff", size: 6, power: 9 },
      { dir: [-6, 1, 3], color: "#ff8d87", size: 2.5, power: 5 },
      { dir: [6, -1, 2], color: "#7fe89a", size: 2, power: 3 },
    ],
  });
  scene.environment = environment;

  const key = new THREE.DirectionalLight("#ffffff", 2.2);
  key.position.set(3, 6, 6);
  scene.add(key);

  const thread = buildTerminal(isPhone);
  scene.add(thread);

  const specks = dust({ count: isPhone ? 450 : 1000, size: [34, 16, 110], center: [0, 1, -35], color: "#ffffff", seed: 3, opacity: 0.5 });
  scene.add(specks);

  // Slabs down both sides, so the corridor has near, middle and far layers to slide past.
  const r = rng(9);
  const slabMaterial = new THREE.MeshStandardMaterial({ color: "#121215", metalness: 0.95, roughness: 0.48, transparent: true });
  const slabs = instanced(new THREE.BoxGeometry(1, 1, 1), slabMaterial, isPhone ? 28 : 60, (dummy, i) => {
    const side = i % 2 ? 1 : -1;
    const height = 6 + r() * 20;
    dummy.position.set(side * (9.5 + r() * 9), FLOOR_Y + height / 2, 14 - (i / (isPhone ? 28 : 60)) * 130 + r() * 2);
    dummy.scale.set(0.5 + r() * 1.8, height, 0.5 + r() * 2.5);
  });
  scene.add(slabs);

  // The floor: the reference site's grid, plus the pools of light the lamps throw on it.
  const floorUniforms = {
    uLine: { value: new THREE.Color("#ffffff") },
    uLineAlpha: { value: 0.12 },
    uThread: { value: new THREE.Vector3() },
    uLamp: { value: [new THREE.Vector3(), new THREE.Vector3(), new THREE.Vector3()] },
    uLampColor: { value: [COLORS.red, COLORS.amber, COLORS.green].map((c) => new THREE.Color(c)) },
    uLevel: { value: new THREE.Vector3(1, 1, 1) },
  };
  const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(90, 240).rotateX(-Math.PI / 2),
    new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      uniforms: floorUniforms,
      vertexShader: /* glsl */ `
        varying vec3 vW;
        void main() {
          vec4 w = modelMatrix * vec4(position, 1.0);
          vW = w.xyz;
          gl_Position = projectionMatrix * viewMatrix * w;
        }`,
      fragmentShader: /* glsl */ `
        uniform vec3 uLine, uLamp[3], uLampColor[3], uLevel, uThread;
        uniform float uLineAlpha;
        varying vec3 vW;
        float pool(vec3 at, float spread) {
          vec2 q = vW.xz - at.xz;
          return exp(-dot(q, q) * spread);
        }
        void main() {
          vec2 g = vW.xz / 2.0;
          vec2 d = max(fwidth(g), vec2(0.0008));
          vec2 l = abs(fract(g - 0.5) - 0.5) / d;
          float line = 1.0 - min(min(l.x, l.y), 1.0);
          float away = length(vW - cameraPosition);
          float fade = exp(-away * away * 0.0035);
          float a = line * uLineAlpha * fade;
          vec3 color = uLine * a;
          float mass = a;
          for (int i = 0; i < 3; i++) {
            float k = pool(uLamp[i], 0.2) * uLevel[i] * 0.13;
            color += uLampColor[i] * k;
            mass += k;
          }
          float screen = pool(uThread, 0.14) * 0.05;
          color += vec3(screen);
          mass += screen;
          mass = clamp(mass, 0.0, 1.0);
          gl_FragColor = vec4(color / max(mass, 0.001), mass);
          #include <colorspace_fragment>
        }`,
    }),
  );
  floor.position.y = FLOOR_Y;
  floor.position.z = -35;
  floor.frustumCulled = false;
  scene.add(floor);

  const tilt = new THREE.Vector3();
  return {
    scene,
    renderer,
    isPhone,
    thread,
    pointerSway: 0.2,
    mood: { background: "#000000", fog: "#000000", fogDensity: 0.022 },
    update({ t, pointer }) {
      specks.tick(t);
      thread.begin(t);
      // The window breathes and leans toward the pointer. The engine re-poses it every frame.
      thread.position.y += Math.sin(t * 0.7) * 0.03;
      thread.rotateY(pointer.x * 0.08);
      thread.rotateX(-pointer.y * 0.05);

      // Dark slabs and a white grid suit the dark field, and fade out when the field turns light.
      const background = scene.background as THREE.Color;
      const light = THREE.MathUtils.clamp(background.r * 1.2, 0, 1);
      slabMaterial.opacity = 1 - light;
      slabs.visible = light < 0.98;
      floorUniforms.uLine.value.setScalar(1 - light);
      floorUniforms.uLineAlpha.value = 0.12 + light * 0.04;

      floorUniforms.uThread.value.copy(thread.position);
      floorUniforms.uLamp.value.forEach((lamp, i) => {
        const at = lampOffset(i);
        tilt.set((i - 1) * 3.4, 0, at.z + 1).applyQuaternion(thread.quaternion);
        lamp.copy(thread.position).add(tilt);
      });
      floorUniforms.uLevel.value.set(thread.lampLevel(0), thread.lampLevel(1), thread.lampLevel(2)).multiplyScalar(1 - light);
    },
    dispose() {
      environment.dispose();
      thread.dispose();
    },
  };
};

export default createWorld;
