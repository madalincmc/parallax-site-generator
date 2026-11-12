// The land under the drift: one range of ridged mountains with a low corridor along the route, pine
// forest on the slopes that stand clear of the mist, and the mist itself pooled in every valley. The
// heights are worked out once on the CPU, so trees, flags and village lights can stand exactly on them.
import * as THREE from "three";
import { clamp, fbm2, lerp, noise2, rng, smooth } from "@/stage/kit";
import { atmos, fogUniforms, NOISE } from "./sky";

export const GROUND_Y = -18;
/** Centre of the flat meadow where the balloon lands. */
export const FIELD_Z = -516;
/** The surface of the valley mist. Slopes fade into it from about y -9 down. */
export const MIST_Y = -14.5;
/** The four summits beside the route, one per career stop: [x, z]. */
export const SUMMITS: [number, number][] = [
  [13, -79],
  [-12, -117],
  [12, -150],
  [11, -184],
];
const SUMMIT_TOP = -5.2;
const BASE = -30;
const X_HALF = 300;
const Z_START = 300;
const Z_END = -840;

function ridged(x: number, z: number) {
  let a = 1;
  let f = 1;
  let sum = 0;
  let norm = 0;
  for (let o = 0; o < 5; o++) {
    const r = 1 - Math.abs(noise2(x * f + o * 11.7, z * f + o * 5.3));
    sum += a * r * r;
    norm += a;
    a *= 0.5;
    f *= 2.03;
  }
  return sum / norm;
}

/** Height of the ground at a point in the world. */
export function heightAt(x: number, z: number) {
  const wx = x + fbm2(x * 0.011 + 3.1, z * 0.011, 3) * 26;
  const wz = z + fbm2(x * 0.011, z * 0.011 + 7.7, 3) * 26;
  const large = 0.5 + 0.5 * noise2(wx * 0.0075 + 40, wz * 0.0075 + 13);
  const r = ridged(wx * 0.021, wz * 0.021);
  let h = BASE + 50 * (0.28 + 0.72 * large) * (0.2 + 0.8 * r);
  // A low corridor under the route, so nothing stands in the balloon's way. It closes past the meadow.
  const open = Math.max(smooth(clamp((Math.abs(x) - 12) / 62)), smooth(clamp((-590 - z) / 60)));
  h = BASE + (h - BASE) * (0.42 + 0.58 * open);
  for (const [px, pz] of SUMMITS) {
    const k = Math.max(0, 1 - Math.hypot(x - px, z - pz) / 15);
    h = Math.max(h, BASE + (SUMMIT_TOP - BASE) * Math.pow(k, 1.3) + (r - 0.5) * 3 * k * (1 - k));
  }
  // The meadow: flat ground in a bowl of hills.
  const field = 1 - smooth(clamp((Math.hypot(x / 110, (z - FIELD_Z) / 120) - 0.5) / 0.5));
  h = lerp(h, GROUND_Y + noise2(x * 0.08, z * 0.08) * 0.22, field);
  // The edges sink under the mist, so the range never ends in a wall.
  const edge = Math.max(smooth(clamp((Math.abs(x) - 235) / 60)), smooth(clamp((z - 235) / 60)), smooth(clamp((-775 - z) / 60)));
  return lerp(h, BASE, edge);
}

/** 0..1, how wooded the ground is here. */
function forestAt(x: number, z: number, h: number) {
  const patch = smooth(clamp(fbm2(x * 0.03 + 50, z * 0.03) * 2.4 + 0.55));
  return patch * smooth(clamp((9 - h) / 4));
}

function landMaterial(tint: number) {
  return new THREE.ShaderMaterial({
    fog: true,
    uniforms: { ...fogUniforms(), uTime: atmos.uTime, uSunDir: atmos.uSunDir, uLit: atmos.uLit, uShadow: atmos.uShadow, uMist: atmos.uMist, uEnd: atmos.uEnd, uTint: { value: tint } },
    vertexShader: /* glsl */ `
      #include <fog_pars_vertex>
      attribute float forest;
      varying vec3 vW; varying vec3 vN; varying float vForest;
      void main() {
        mat4 m = modelMatrix;
        #ifdef USE_INSTANCING
          m = modelMatrix * instanceMatrix;
        #endif
        vec4 wp = m * vec4(position, 1.0);
        vW = wp.xyz; vN = mat3(m) * normal; vForest = forest;
        vec4 mvPosition = viewMatrix * wp;
        gl_Position = projectionMatrix * mvPosition;
        #include <fog_vertex>
      }`,
    fragmentShader: /* glsl */ `
      #include <fog_pars_fragment>
      uniform vec3 uSunDir, uLit, uShadow, uMist; uniform float uTime, uEnd, uTint;
      varying vec3 vW; varying vec3 vN; varying float vForest;
      ${NOISE}
      void main() {
        vec3 n = normalize(vN);
        float ndl = clamp(dot(n, uSunDir) * 0.65 + 0.35, 0.0, 1.0);
        vec3 col = mix(uShadow, uLit, ndl * (0.55 + 0.45 * (n.y * 0.5 + 0.5)));
        col *= mix(1.0, 0.6, vForest) * uTint;
        // Snow on the high, gentle ground.
        float snow = smoothstep(8.0, 13.0, vW.y + (n.y - 0.75) * 10.0);
        col = mix(col, mix(uShadow * 1.5, uLit * 0.6 + 0.5, ndl), snow);
        // Mist pooled in the valleys: every slope fades into it at its foot.
        float pool = smoothstep(${(MIST_Y + 5.5).toFixed(1)}, ${(MIST_Y - 0.5).toFixed(1)}, vW.y + (vn(vW.xz * 0.05 + uTime * 0.02) - 0.5) * 3.0);
        col = mix(col, uMist, pool * 0.96 * mistCover(vW.xz, uEnd));
        gl_FragColor = vec4(col, 1.0);
        #include <colorspace_fragment>
        #include <fog_fragment>
      }`,
  });
}

function pineGeometry() {
  // Three stacked open cones, about 1.1 tall.
  const tiers: [number, number, number][] = [
    [0.42, 0.62, 0.3],
    [0.33, 0.52, 0.62],
    [0.22, 0.42, 0.9],
  ];
  const position: number[] = [];
  const normal: number[] = [];
  for (const [radius, height, y] of tiers) {
    const cone = new THREE.ConeGeometry(radius, height, 6, 1, true).translate(0, y, 0).toNonIndexed();
    position.push(...(cone.attributes.position.array as Float32Array));
    normal.push(...(cone.attributes.normal.array as Float32Array));
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(position, 3));
  g.setAttribute("normal", new THREE.Float32BufferAttribute(normal, 3));
  return g;
}

export function buildLand(isPhone: boolean) {
  const cols = isPhone ? 120 : 200;
  const rows = isPhone ? 230 : 380;
  const position = new Float32Array((cols + 1) * (rows + 1) * 3);
  const forest = new Float32Array((cols + 1) * (rows + 1));
  const index: number[] = [];
  let v = 0;
  for (let j = 0; j <= rows; j++) {
    const z = lerp(Z_START, Z_END, j / rows);
    for (let i = 0; i <= cols; i++) {
      // Columns crowd toward the route, where the camera is close.
      const u = (i / cols) * 2 - 1;
      const x = X_HALF * (0.35 * u + 0.65 * u * u * u);
      const h = heightAt(x, z);
      position.set([x, h, z], v * 3);
      forest[v++] = forestAt(x, z, h);
    }
  }
  const row = cols + 1;
  for (let j = 0; j < rows; j++)
    for (let i = 0; i < cols; i++) {
      const a = j * row + i;
      index.push(a, a + row, a + 1, a + 1, a + row, a + row + 1);
    }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.BufferAttribute(position, 3));
  geometry.setAttribute("forest", new THREE.BufferAttribute(forest, 1));
  geometry.setIndex(index);
  geometry.computeVertexNormals();
  const ground = new THREE.Mesh(geometry, landMaterial(1));
  ground.frustumCulled = false;

  // Pines on whatever stands clear of the mist, thicker where the ground is marked as forest.
  const count = isPhone ? 1500 : 3800;
  const pines = new THREE.InstancedMesh(pineGeometry(), landMaterial(0.5), count);
  const dummy = new THREE.Object3D();
  const r = rng(31);
  let placed = 0;
  for (let tries = 0; tries < count * 14 && placed < count; tries++) {
    const x = r.range(-200, 200);
    const z = r.range(250, -790);
    const h = heightAt(x, z);
    const clear = z < -440 ? GROUND_Y + 0.8 : MIST_Y + 1;
    if (h < clear || h > 9) continue;
    if (Math.hypot(x, z - FIELD_Z) < 62) continue;
    if (r() > 0.12 + 0.88 * forestAt(x, z, h)) continue;
    const s = r.range(1.5, 2.9);
    dummy.position.set(x, h - s * 0.06, z);
    dummy.scale.set(s, s * r.range(0.9, 1.3), s);
    dummy.rotation.y = r() * Math.PI;
    dummy.updateMatrix();
    pines.setMatrixAt(placed++, dummy.matrix);
  }
  pines.count = placed;
  pines.frustumCulled = false;

  // The mist: one sheet at the level the slopes fade to, with slow holes and wisps drifting through it.
  const mist = new THREE.Mesh(
    new THREE.PlaneGeometry(1300, 1300).rotateX(-Math.PI / 2),
    new THREE.ShaderMaterial({
      fog: true,
      transparent: true,
      depthWrite: false,
      uniforms: { ...fogUniforms(), uTime: atmos.uTime, uSunDir: atmos.uSunDir, uSunCol: atmos.uSunCol, uMist: atmos.uMist, uEnd: atmos.uEnd },
      vertexShader: /* glsl */ `
        #include <fog_pars_vertex>
        varying vec3 vW;
        void main() {
          vec4 wp = modelMatrix * vec4(position, 1.0);
          vW = wp.xyz;
          vec4 mvPosition = viewMatrix * wp;
          gl_Position = projectionMatrix * mvPosition;
          #include <fog_vertex>
        }`,
      fragmentShader: /* glsl */ `
        #include <fog_pars_fragment>
        uniform vec3 uSunDir, uSunCol, uMist; uniform float uTime, uEnd;
        varying vec3 vW;
        ${NOISE}
        void main() {
          vec2 q = vW.xz * 0.014 + vec2(uTime * 0.008, 0.0);
          float warp = fbm3(q * 0.6 + vec2(4.0, uTime * 0.004));
          float n = fbm3(q + warp * 1.1);
          float fine = fbm3(q * 3.1 + 9.0);
          float alpha = smoothstep(0.2, 0.52, n + 0.14) * mistCover(vW.xz, uEnd);
          if (alpha < 0.004) discard;
          vec3 v = normalize(vW - cameraPosition);
          vec3 col = uMist * (0.86 + 0.16 * n + 0.12 * fine);
          // Forward scatter: the mist burns in the direction of the sun.
          col += uSunCol * pow(max(dot(v, uSunDir), 0.0), 14.0) * 0.22;
          gl_FragColor = vec4(col, alpha);
          #include <colorspace_fragment>
          #include <fog_fragment>
        }`,
    }),
  );
  mist.position.y = MIST_Y;
  mist.frustumCulled = false;
  mist.renderOrder = -1;

  const group = new THREE.Group();
  group.add(ground, pines, mist);
  return {
    group,
    /** Keeps the mist sheet centred under the balloon. Its pattern is fixed to the world, so it never swims. */
    follow(x: number, z: number) {
      mist.position.set(x, MIST_Y, z);
    },
  };
}
