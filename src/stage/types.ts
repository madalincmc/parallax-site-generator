import type { Object3D, Scene, WebGLRenderer } from "three";

export type Vec3 = [number, number, number];

/** Where the camera is. `fov` is vertical, written for a 16:9 screen; narrow screens widen it. */
export type CameraPose = { position: Vec3; target: Vec3; fov?: number };

/** Where the thread (the object carried through the whole site) is. */
export type ThreadPose = { position: Vec3; rotation: Vec3; scale: number };

/** Colors the whole world blends between. */
export type Mood = { background: string; fog: string; fogDensity: number };

export type ActState = {
  p: number; // 0 when the section pins, 1 when it lets go
  weight: number; // 1 while pinned, falling to 0 as the camera leaves for the next act
  t: number; // seconds
  dt: number;
  pointer: { x: number; y: number }; // -1..1, smoothed
  aspect: number;
  isPhone: boolean;
};

export type World = {
  scene: Scene;
  renderer: WebGLRenderer;
  isPhone: boolean;
  mood: Mood;
  thread?: Object3D;
  /** How far the pointer sways the camera, in world units. */
  pointerSway?: number;
  update?(state: Omit<ActState, "p" | "weight"> & { y: number }): void;
  dispose?(): void;
};

export type WorldInit = { scene: Scene; renderer: WebGLRenderer; isPhone: boolean };
export type WorldFactory = (init: WorldInit) => World;

export type Act = {
  /** Added to the scene and only drawn while this act or its neighbor is on screen. */
  group: Object3D;
  camera(p: number, aspect: number): CameraPose;
  thread?(p: number, aspect: number): ThreadPose;
  mood?(p: number): Mood;
  update?(state: ActState): void;
  dispose?(): void;
};

export type ActFactory = (world: World) => Act;
export type ActLoader = () => Promise<{ default: ActFactory }>;

/** What the scroll position means right now. While pinned a === b; between sections they differ. */
export type Frame = {
  y: number;
  a: number;
  b: number;
  pA: number;
  pB: number;
  w: number; // 0..1 from a to b
  still: boolean; // reduced motion: hold on the section nearest the middle of the screen
};
