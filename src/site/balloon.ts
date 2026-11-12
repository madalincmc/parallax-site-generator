// Hot air balloons, modelled from code. The thread is one detailed balloon: a gored envelope whose fabric
// bulges between its load tapes, a wicker basket, ropes, a burner frame and a flame. Its pattern (three
// stripe colours, a zigzag belly band, a solid crown and a dark skirt) is painted per pixel, so it stays
// crisp at any distance. `buildFleet` makes many simpler balloons in one draw call, each with its own
// colours and pattern, for the others in the sky and on the ground.
//
// A balloon's origin is the middle of its whole height: it reaches about 4.2 up and down, 2.6 to each side.
import * as THREE from "three";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import { canvasTexture, rng } from "@/stage/kit";
import { atmos, fogUniforms } from "./sky";

const S = 0.7;
const Y0 = -1.9;
const GORES = 24;
/** From a balloon's origin down to the underside of its basket. */
export const BALLOON_FOOT = 4.25;

function envelopeGeometry(columnsPerGore: number, rings: number, bulge: boolean) {
  const R = 3.7;
  const lowerH = 5.2;
  const upperH = 3.5;
  const throat = 0.62;
  const split = 0.62;
  const columns = GORES * columnsPerGore;
  const position: number[] = [];
  const uv: number[] = [];
  const index: number[] = [];
  for (let j = 0; j <= rings; j++) {
    const s = j / rings;
    let r: number;
    let y: number;
    if (s < split) {
      const k = s / split;
      y = k * lowerH;
      r = throat + (R - throat) * Math.pow(Math.sin((k * Math.PI) / 2), 0.85);
    } else {
      const a = (((s - split) / (1 - split)) * Math.PI) / 2;
      y = lowerH + upperH * Math.sin(a);
      r = R * Math.cos(a);
    }
    for (let i = 0; i <= columns; i++) {
      const u = i / columns;
      const phi = u * Math.PI * 2;
      // Fabric bulges between load tapes, most around the belly.
      const swell = bulge ? 1 + 0.035 * Math.pow(Math.abs(Math.sin((phi * GORES) / 2)), 0.6) * Math.sin(Math.PI * Math.min(1, s * 1.02)) : 1;
      position.push(Math.cos(phi) * r * swell * S, y * S + Y0, Math.sin(phi) * r * swell * S);
      uv.push(u, s);
    }
  }
  const stride = columns + 1;
  for (let j = 0; j < rings; j++)
    for (let i = 0; i < columns; i++) {
      const a = j * stride + i;
      index.push(a, a + stride, a + 1, a + 1, a + stride, a + stride + 1);
    }
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(position, 3));
  g.setAttribute("uv", new THREE.Float32BufferAttribute(uv, 2));
  g.setIndex(index);
  g.computeVertexNormals();
  // Weld normals across the seam where u wraps, so no vertical crease shows.
  const normal = g.attributes.normal as THREE.BufferAttribute;
  const n = new THREE.Vector3();
  for (let j = 0; j <= rings; j++) {
    const a = j * stride;
    const b = a + columns;
    n.set(normal.getX(a) + normal.getX(b), normal.getY(a) + normal.getY(b), normal.getZ(a) + normal.getZ(b)).normalize();
    normal.setXYZ(a, n.x, n.y, n.z);
    normal.setXYZ(b, n.x, n.y, n.z);
  }
  return g;
}

const withPart = (g: THREE.BufferGeometry, id: number) => g.setAttribute("part", new THREE.BufferAttribute(new Float32Array(g.attributes.position.count).fill(id), 1));

/** The fabric. One shader for the thread and the fleet: instanced meshes read their colours per balloon. */
function envelopeMaterial() {
  const uniforms = {
    ...fogUniforms(),
    uSunDir: atmos.uSunDir,
    uSunCol: atmos.uSunCol,
    uAmbTop: atmos.uAmbTop,
    uAmbBottom: atmos.uAmbBottom,
    uA: { value: new THREE.Color("#c3202e") },
    uB: { value: new THREE.Color("#f6e7c8") },
    uC: { value: new THREE.Color("#f09a1e") },
    uBandCol: { value: new THREE.Color("#1b2e66") },
    uStyle: { value: new THREE.Vector2(0, 0) },
  };
  const material = new THREE.ShaderMaterial({
    fog: true,
    side: THREE.DoubleSide,
    uniforms,
    vertexShader: /* glsl */ `
      #include <fog_pars_vertex>
      attribute float part;
      #ifdef USE_INSTANCING
        attribute vec3 iA; attribute vec3 iB; attribute vec3 iC; attribute vec3 iBand; attribute vec2 iStyle;
      #endif
      uniform vec3 uA, uB, uC, uBandCol; uniform vec2 uStyle;
      varying vec2 vUv; varying vec3 vN; varying vec3 vW; varying float vPart;
      varying vec3 vA; varying vec3 vB; varying vec3 vC; varying vec3 vBand; varying vec2 vStyle;
      void main() {
        mat4 m = modelMatrix;
        #ifdef USE_INSTANCING
          m = modelMatrix * instanceMatrix;
          vA = iA; vB = iB; vC = iC; vBand = iBand; vStyle = iStyle;
        #else
          vA = uA; vB = uB; vC = uC; vBand = uBandCol; vStyle = uStyle;
        #endif
        vec4 wp = m * vec4(position, 1.0);
        vW = wp.xyz; vN = mat3(m) * normal; vUv = uv; vPart = part;
        vec4 mvPosition = viewMatrix * wp;
        gl_Position = projectionMatrix * mvPosition;
        #include <fog_vertex>
      }`,
    fragmentShader: /* glsl */ `
      #include <fog_pars_fragment>
      uniform vec3 uSunDir, uSunCol, uAmbTop, uAmbBottom;
      varying vec2 vUv; varying vec3 vN; varying vec3 vW; varying float vPart;
      varying vec3 vA; varying vec3 vB; varying vec3 vC; varying vec3 vBand; varying vec2 vStyle;
      void main() {
        vec3 n = normalize(vN);
        vec3 V = vW - cameraPosition;
        vec3 d = normalize(V);
        if (dot(n, d) > 0.0) n = -n;
        float v = vUv.y;
        float fabric = 1.0 - step(0.5, vPart);
        vec3 albedo = vec3(0.13, 0.085, 0.05);
        if (fabric > 0.5) {
          float style = vStyle.x;
          float g = vUv.x * ${GORES.toFixed(1)};
          // Style 1 twists the stripes into a spiral.
          if (style > 0.5 && style < 1.5) g += v * 9.0;
          float id = mod(floor(g), 3.0);
          float f = fract(g);
          albedo = id < 0.5 ? vA : (id < 1.5 ? vB : vC);
          // Style 2 is hoops instead of stripes.
          if (style > 1.5) { float hoop = mod(floor(v * 8.0 + 0.5), 3.0); albedo = hoop < 0.5 ? vA : (hoop < 1.5 ? vB : vC); }
          // Style 0 wears a zigzag belly band with a pale trim.
          if (style < 0.5) {
            float zig = 0.64 + (abs(f - 0.5) * 2.0 - 0.5) * 0.06;
            float w = fwidth(v) * 1.2 + 1e-4;
            albedo = mix(albedo, vec3(1.0, 0.68, 0.19), 1.0 - smoothstep(0.086 - w, 0.086 + w, abs(v - zig)));
            albedo = mix(albedo, vBand, 1.0 - smoothstep(0.069 - w, 0.069 + w, abs(v - zig)));
          }
          albedo = mix(albedo, vA, smoothstep(0.905, 0.91, v));
          albedo = mix(albedo, vBand, 1.0 - smoothstep(0.165, 0.17, v));
          // Load tapes: a darker line down every seam.
          float seam = min(f, 1.0 - f);
          float sw = fwidth(g) * 1.2 + 1e-4;
          albedo *= mix(0.55, 1.0, smoothstep(0.02 - sw, 0.035 + sw, seam));
        }
        float wrap = max(dot(n, uSunDir) * 0.75 + 0.25, 0.0);
        vec3 ambient = mix(uAmbBottom, uAmbTop, n.y * 0.5 + 0.5);
        vec3 col = albedo * (ambient + uSunCol * wrap);
        // Fabric glows when the sun sits behind it, and from inside when the burner fires.
        float back = pow(max(dot(d, uSunDir), 0.0), 5.0);
        col += albedo * uSunCol * back * 0.55 * fabric;
        col += albedo * vec3(1.0, 0.5, 0.17) * vStyle.y * (0.45 + 2.6 * exp(-v * 3.0)) * fabric;
        float rim = pow(1.0 - max(dot(n, -d), 0.0), 3.0);
        col += uSunCol * rim * 0.16;
        gl_FragColor = vec4(col, 1.0);
        #include <colorspace_fragment>
        #include <fog_fragment>
      }`,
  });
  return { material, uniforms };
}

function rope(from: [number, number, number], to: [number, number, number], radius: number, sides = 6) {
  const a = new THREE.Vector3(...from);
  const b = new THREE.Vector3(...to);
  const g = new THREE.CylinderGeometry(radius, radius, a.distanceTo(b), sides);
  const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), b.clone().sub(a).normalize());
  g.applyQuaternion(q);
  const mid = a.add(b).multiplyScalar(0.5);
  return g.translate(mid.x, mid.y, mid.z);
}

const BASKET_Y = -2.75;
const BASKET = 0.82;
const FRAME_Y = -1.25;
const FRAME = 0.55;
const CORNERS: [number, number][] = [
  [1, 1],
  [1, -1],
  [-1, 1],
  [-1, -1],
];

export type BalloonApi = {
  /** 0..1 burner. Ask every frame; with nobody asking, it fires a short burst now and then by itself. */
  burn(value: number): void;
};

export function buildBalloon(isPhone: boolean) {
  const { material, uniforms } = envelopeMaterial();
  const envelopeGeo = withPart(envelopeGeometry(isPhone ? 4 : 8, isPhone ? 48 : 76, true), 0);
  const envelope = new THREE.Mesh(envelopeGeo, material);
  envelope.name = "envelope";

  const r = rng(11);
  const wickerMap = canvasTexture(
    256,
    (ctx, size) => {
      ctx.fillStyle = "#7a5228";
      ctx.fillRect(0, 0, size, size);
      const step = 16;
      for (let y = 0; y < size; y += step)
        for (let x = 0; x < size; x += step) {
          const shade = 150 + r() * 45;
          ctx.fillStyle = `rgb(${shade}, ${shade * 0.72}, ${shade * 0.42})`;
          if ((x / step + y / step) % 2 === 0) ctx.fillRect(x + 1, y + 3, step - 2, step - 6);
          else ctx.fillRect(x + 3, y + 1, step - 6, step - 2);
        }
    },
    true,
  );
  wickerMap.repeat.set(2.5, 2);
  const wicker = new THREE.MeshStandardMaterial({ map: wickerMap, roughness: 0.95, emissive: "#ffffff", emissiveMap: wickerMap, emissiveIntensity: 0.08 });
  const leather = new THREE.MeshStandardMaterial({ color: "#3f2614", roughness: 0.8 });
  const steel = new THREE.MeshStandardMaterial({ color: "#8c8c94", roughness: 0.45, metalness: 0.6 });
  const line = new THREE.MeshStandardMaterial({ color: "#2a2320", roughness: 0.9 });

  // Everything below the envelope is built at the envelope's own scale, then shrunk with it.
  const rig = new THREE.Group();
  rig.scale.setScalar(S);
  rig.position.y = Y0;
  const basket = new THREE.Mesh(new THREE.BoxGeometry(BASKET * 2, 1.15, BASKET * 2), wicker);
  basket.position.y = BASKET_Y;
  const rim = new THREE.Mesh(new THREE.BoxGeometry(BASKET * 2.1, 0.13, BASKET * 2.1), leather);
  rim.position.y = BASKET_Y + 0.6;
  const ropes: THREE.BufferGeometry[] = [];
  for (const [sx, sz] of CORNERS) {
    // Basket corner up to the burner frame, frame up to the throat of the envelope.
    ropes.push(rope([sx * BASKET, BASKET_Y + 0.6, sz * BASKET], [sx * FRAME, FRAME_Y, sz * FRAME], 0.028));
    ropes.push(rope([sx * FRAME, FRAME_Y, sz * FRAME], [sx * 0.42, 0.02, sz * 0.42], 0.022));
  }
  const rigging = new THREE.Mesh(mergeGeometries(ropes)!, line);
  const frame = new THREE.Mesh(new THREE.BoxGeometry(FRAME * 2, 0.07, FRAME * 2), steel);
  frame.position.y = FRAME_Y;
  const burner = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.26, 0.3, 12), steel);
  burner.position.y = FRAME_Y + 0.18;

  const flameUniforms = { uBurn: { value: 0 } };
  const flame = new THREE.Mesh(
    new THREE.ConeGeometry(0.2, 1, 16, 8, true).translate(0, 0.5, 0),
    new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending,
      uniforms: flameUniforms,
      vertexShader: `varying float vH; void main() { vH = position.y; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
      fragmentShader: /* glsl */ `
        varying float vH; uniform float uBurn;
        void main() {
          vec3 c = mix(vec3(1.6, 1.2, 0.7), vec3(1.4, 0.4, 0.06), smoothstep(0.0, 0.85, vH));
          gl_FragColor = vec4(c * uBurn * (1.0 - vH), 1.0);
        }`,
    }),
  );
  flame.position.y = FRAME_Y + 0.32;
  rig.add(basket, rim, rigging, frame, burner, flame);

  // The model sits inside the thread group, so the world can give it a little life of its own.
  const model = new THREE.Group();
  model.add(envelope, rig);
  const group = new THREE.Group();
  group.name = "thread";
  group.add(model);

  const pending = { burn: 0 };
  const api: BalloonApi = { burn: (v) => (pending.burn = Math.max(pending.burn, v)) };
  group.userData.balloon = api;

  return {
    group,
    /** Once per frame, from the world: a slow turn and sway, and the burner. */
    tick(t: number) {
      model.position.y = 0.1 * Math.sin(t * 0.8);
      model.rotation.y = 0.4 + t * 0.07;
      model.rotation.z = 0.012 * Math.sin(t * 0.6 + 0.4);
      const phase = (t % 9) / 9;
      const auto = 0.7 * Math.min(1, phase / 0.02) * Math.min(1, Math.max(0, (0.2 - phase) / 0.04));
      const flicker = 0.84 + 0.16 * Math.sin(t * 41) * Math.sin(t * 27 + 1.3);
      const burn = Math.max(pending.burn, auto) * flicker;
      uniforms.uStyle.value.y = burn;
      flameUniforms.uBurn.value = burn;
      flame.scale.set(1 + burn * 0.25, Math.max(burn * 1.7, 0.001), 1 + burn * 0.25);
      pending.burn = 0;
    },
    dispose() {
      envelopeGeo.dispose();
      material.dispose();
      wickerMap.dispose();
    },
  };
}

/** [stripe A, stripe B, stripe C, band and skirt], and the pattern: 0 zigzag band, 1 spiral, 2 hoops. */
export type Livery = { colors: [string, string, string, string]; style: 0 | 1 | 2 };

/** Many simple balloons in one draw call. Place them, set their burners, then `commit()`, every frame they move. */
export function buildFleet(liveries: Livery[]) {
  const parts: THREE.BufferGeometry[] = [withPart(envelopeGeometry(2, 30, false), 0)];
  const scaled = (g: THREE.BufferGeometry) => withPart(g.scale(S, S, S).translate(0, Y0, 0), 1);
  parts.push(scaled(new THREE.BoxGeometry(BASKET * 2, 1.15, BASKET * 2).translate(0, BASKET_Y, 0)));
  for (const [sx, sz] of CORNERS) parts.push(scaled(rope([sx * BASKET, BASKET_Y + 0.5, sz * BASKET], [sx * 0.42, 0.02, sz * 0.42], 0.035, 4)));
  const geometry = mergeGeometries(parts)!;
  const count = liveries.length;
  const color = new THREE.Color();
  const names = ["iA", "iB", "iC", "iBand"] as const;
  names.forEach((name, k) => {
    const data = new Float32Array(count * 3);
    liveries.forEach((livery, i) => {
      color.set(livery.colors[k]);
      data.set([color.r, color.g, color.b], i * 3);
    });
    geometry.setAttribute(name, new THREE.InstancedBufferAttribute(data, 3));
  });
  const style = new THREE.InstancedBufferAttribute(new Float32Array(count * 2), 2);
  liveries.forEach((livery, i) => style.setX(i, livery.style));
  geometry.setAttribute("iStyle", style);

  const { material } = envelopeMaterial();
  const mesh = new THREE.InstancedMesh(geometry, material, count);
  mesh.frustumCulled = false;
  const dummy = new THREE.Object3D();
  return {
    mesh,
    count,
    place(i: number, x: number, y: number, z: number, scale = 1, yaw = 0) {
      dummy.position.set(x, y, z);
      dummy.rotation.set(0, yaw, 0);
      dummy.scale.setScalar(Math.max(scale, 0.001));
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
    },
    burn(i: number, value: number) {
      style.setY(i, value);
    },
    commit() {
      mesh.instanceMatrix.needsUpdate = true;
      style.needsUpdate = true;
    },
  };
}
