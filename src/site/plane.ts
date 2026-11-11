// The thread: an airliner, modelled from code. Nose toward -z, up +y, right wing +x, about 8 units long
// and 7.8 across. One merged mesh carries the whole airframe; its livery (white body, navy tail sweep,
// airport-yellow fin and winglets), the cabin windows and the windscreen are painted per pixel from the
// local position, so they stay crisp at any distance. Navigation lights, landing lights, contrails and a
// simple landing gear ride along as children.
import * as THREE from "three";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";

const L = 8;
const R = 0.44;
const ENGINE: [number, number, number] = [1.45, -0.5, -0.55];

/** Makes a closed part's triangles face outward, whatever order it was built in. */
function outward(input: THREE.BufferGeometry) {
  const g = input.index ? input.toNonIndexed() : input;
  g.computeBoundingBox();
  const c = g.boundingBox!.getCenter(new THREE.Vector3());
  const pos = g.attributes.position as THREE.BufferAttribute;
  const a = new THREE.Vector3();
  const b = new THREE.Vector3();
  const d = new THREE.Vector3();
  const n = new THREE.Vector3();
  let sum = 0;
  for (let i = 0; i < pos.count; i += 3) {
    a.fromBufferAttribute(pos, i);
    b.fromBufferAttribute(pos, i + 1);
    d.fromBufferAttribute(pos, i + 2);
    n.crossVectors(b.clone().sub(a), d.clone().sub(a));
    sum += n.dot(a.add(b).add(d).multiplyScalar(1 / 3).sub(c));
  }
  if (sum < 0) flip(g);
  // Make every vertex normal agree with its face, so smooth normals survive a rewind.
  if (!g.attributes.normal) g.computeVertexNormals();
  else {
    const nor = g.attributes.normal as THREE.BufferAttribute;
    const v = new THREE.Vector3();
    for (let i = 0; i < pos.count; i += 3) {
      a.fromBufferAttribute(pos, i);
      b.fromBufferAttribute(pos, i + 1);
      d.fromBufferAttribute(pos, i + 2);
      n.crossVectors(b.sub(a), d.sub(a));
      for (let k = 0; k < 3; k++) {
        v.fromBufferAttribute(nor, i + k);
        if (v.dot(n) < 0) nor.setXYZ(i + k, -v.x, -v.y, -v.z);
      }
    }
  }
  return g;
}

/** Reverses triangle winding, for parts that were mirrored. */
function flip(g: THREE.BufferGeometry) {
  for (const name of Object.keys(g.attributes)) {
    const attr = g.attributes[name] as THREE.BufferAttribute;
    const size = attr.itemSize;
    const arr = attr.array as Float32Array;
    for (let i = 0; i < attr.count; i += 3) {
      for (let k = 0; k < size; k++) {
        const t = arr[(i + 1) * size + k];
        arr[(i + 1) * size + k] = arr[(i + 2) * size + k];
        arr[(i + 2) * size + k] = t;
      }
    }
    attr.needsUpdate = true;
  }
  return g;
}

const mirror = (g: THREE.BufferGeometry) => flip(g.clone().scale(-1, 1, 1));

/** A flat plate cut from a 2D outline, with softened edges. Lies in XY, thickness centred on z. */
function slab(points: [number, number][], thickness: number, bevel = 0.02) {
  const shape = new THREE.Shape(points.map(([x, y]) => new THREE.Vector2(x, y)));
  const g = new THREE.ExtrudeGeometry(shape, { depth: thickness, bevelEnabled: true, bevelThickness: bevel, bevelSize: bevel, bevelSegments: 2, steps: 1, curveSegments: 4 });
  g.translate(0, 0, -thickness / 2);
  return g;
}

/** Top-view outline (x, z) to a horizontal plate: thickness along y. */
const flat = (points: [number, number][], thickness: number) => slab(points, thickness).rotateX(Math.PI / 2);
/** Side-view outline (z, y) to a vertical plate: thickness along x. */
const upright = (points: [number, number][], thickness: number) => slab(points, thickness).rotateY(-Math.PI / 2);

function fuselage() {
  const rings = 64;
  const around = 32;
  const positions: number[] = [];
  const index: number[] = [];
  for (let i = 0; i <= rings; i++) {
    const s = i / rings;
    let r = R;
    let y = 0;
    if (s < 0.13) {
      const k = 1 - s / 0.13;
      r = R * Math.pow(Math.max(0, 1 - k * k), 0.62);
      y = -R * 0.16 * k * k;
    } else if (s > 0.66) {
      const k = (s - 0.66) / 0.34;
      r = R * (1 - Math.pow(k, 1.7)) + 0.03 * k;
      y = R * 0.78 * Math.pow(k, 1.6);
    }
    for (let j = 0; j <= around; j++) {
      const a = (j / around) * Math.PI * 2;
      positions.push(Math.sin(a) * r, y + Math.cos(a) * r, -L / 2 + s * L);
    }
  }
  const row = around + 1;
  for (let i = 0; i < rings; i++)
    for (let j = 0; j < around; j++) {
      const a = i * row + j;
      index.push(a, a + row, a + 1, a + 1, a + row, a + row + 1);
    }
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  g.setIndex(index);
  g.computeVertexNormals();
  return g;
}

function nacelle() {
  const profile = [
    [0.19, -0.5],
    [0.245, -0.47],
    [0.275, -0.3],
    [0.27, 0.0],
    [0.22, 0.38],
    [0.17, 0.5],
  ].map(([r, z]) => new THREE.Vector2(r, z));
  // Lathe turns around y; lay it down so its axis runs along z, front at -z.
  return new THREE.LatheGeometry(profile, 28).rotateX(Math.PI / 2);
}

function part(g: THREE.BufferGeometry, id: number, fix = true) {
  let out = fix ? outward(g) : g.index ? g.toNonIndexed() : g;
  if (!out.attributes.normal) out.computeVertexNormals();
  out = out.clone();
  for (const name of Object.keys(out.attributes)) if (name !== "position" && name !== "normal") out.deleteAttribute(name);
  out.setAttribute("part", new THREE.BufferAttribute(new Float32Array(out.attributes.position.count).fill(id), 1));
  return out;
}

export type PlaneApi = {
  /** 0..1 landing gear down. Ask every frame; it retracts when nobody asks. */
  gear(value: number): void;
  /** 0..1 landing lights. Ask every frame. */
  landing(value: number): void;
  /** 0..1 contrail strength. Defaults to 1 when nobody asks. */
  trail(value: number): void;
};

export function buildPlane(isPhone: boolean) {
  const parts: THREE.BufferGeometry[] = [];

  // 0 fuselage
  parts.push(part(outward(fuselage()), 0, false));

  // 1 wings and stabilisers
  const wing = outward(flat(
    [
      [0.3, -1.05],
      [3.9, 0.9],
      [3.9, 1.32],
      [1.5, 0.62],
      [0.3, 0.72],
    ],
    0.085,
  ))
    .rotateZ(0.09)
    .translate(0, -0.2, 0);
  const stab = outward(flat(
    [
      [0.12, 3.0],
      [1.55, 3.62],
      [1.55, 3.95],
      [0.12, 3.78],
    ],
    0.055,
  ))
    .rotateZ(0.1)
    .translate(0, 0.3, 0);
  parts.push(part(wing, 1, false), part(mirror(wing), 1, false), part(stab, 1, false), part(mirror(stab), 1, false));

  // 2 fin
  parts.push(
    part(
      upright(
        [
          [2.45, 0.36],
          [3.5, 1.82],
          [3.98, 1.82],
          [3.84, 0.44],
        ],
        0.07,
      ),
      2,
    ),
  );

  // 4 winglets
  const winglet = outward(upright(
    [
      [0.92, 0],
      [1.32, 0],
      [1.56, 0.62],
      [1.4, 0.62],
    ],
    0.045,
  ))
    .rotateZ(-0.16)
    .translate(3.88, -0.2 + 3.9 * Math.sin(0.09) + 0.02, 0);
  parts.push(part(winglet, 4, false), part(mirror(winglet), 4, false));

  // 3 engines, 5 dark insides
  for (const side of [1, -1]) {
    const [ex, ey, ez] = [ENGINE[0] * side, ENGINE[1], ENGINE[2]];
    parts.push(part(nacelle().translate(ex, ey, ez), 3));
    parts.push(part(new THREE.CircleGeometry(0.2, 24).rotateY(Math.PI).translate(ex, ey, ez - 0.44), 5, false));
    parts.push(part(new THREE.ConeGeometry(0.075, 0.2, 16).rotateX(-Math.PI / 2).translate(ex, ey, ez - 0.46), 3));
    parts.push(part(new THREE.ConeGeometry(0.15, 0.36, 16).rotateX(Math.PI / 2).translate(ex, ey, ez + 0.52), 5));
    parts.push(part(new THREE.BoxGeometry(0.06, 0.2, 0.62).translate(ex, ey + 0.26, ez + 0.2), 1));
  }

  const geometry = mergeGeometries(parts)!;
  const uniforms = {
    uNight: { value: 0 },
    uWhite: { value: new THREE.Color("#f3f5f9") },
    uBelly: { value: new THREE.Color("#c9d1df") },
    uNavy: { value: new THREE.Color("#0f1b45") },
    uYellow: { value: new THREE.Color("#ffcf3f") },
    uWing: { value: new THREE.Color("#d3d9e4") },
    uGlass: { value: new THREE.Color("#0a0f1e") },
    uWarm: { value: new THREE.Color("#ffd9a0") },
  };
  const material = new THREE.MeshPhysicalMaterial({ color: "#ffffff", roughness: 0.36, metalness: 0.05, clearcoat: 0.5, clearcoatRoughness: 0.25 });
  material.onBeforeCompile = (shader) => {
    Object.assign(shader.uniforms, uniforms);
    shader.vertexShader = shader.vertexShader
      .replace("#include <common>", "#include <common>\nattribute float part;\nvarying vec3 vLocal;\nvarying float vPart;")
      .replace("#include <begin_vertex>", "#include <begin_vertex>\nvLocal = position;\nvPart = part;");
    shader.fragmentShader = shader.fragmentShader
      .replace(
        "#include <common>",
        /* glsl */ `#include <common>
        varying vec3 vLocal; varying float vPart;
        uniform float uNight;
        uniform vec3 uWhite, uBelly, uNavy, uYellow, uWing, uGlass, uWarm;
        float planeGlass; float planeCabin;
        float band(float x, float a, float b) { float w = fwidth(x) * 1.2 + 1e-5; return smoothstep(a - w, a + w, x) * (1.0 - smoothstep(b - w, b + w, x)); }
        float above(float x, float a) { float w = fwidth(x) * 1.2 + 1e-5; return smoothstep(a - w, a + w, x); }
        vec3 planePaint() {
          vec3 p = vLocal;
          planeGlass = 0.0; planeCabin = 0.0;
          if (vPart < 0.5) {
            vec3 c = mix(uBelly, uWhite, above(p.y, -0.2));
            // A thin navy cheatline under the windows.
            c = mix(c, uNavy, band(p.y, -0.035, 0.0) * (1.0 - above(p.z, 2.5)));
            // The tail sweep: a yellow edge, then navy to the tail cone.
            float sweep = p.z - 0.9 * p.y;
            c = mix(c, uYellow, above(sweep, 2.56));
            c = mix(c, uNavy, above(sweep, 2.72));
            // Cabin windows.
            float cell = p.z / 0.17;
            float win = band(fract(cell), 0.24, 0.76) * band(p.y, 0.085, 0.18) * band(p.z, -2.95, 2.25);
            // Windscreen: a dark band wrapped over the nose, split by three posts.
            float top = 0.115 + 0.62 * (p.z + 3.86);
            float post = 1.0 - band(abs(p.x), 0.0, 0.012) - band(abs(p.x), 0.2, 0.222);
            float screen = band(p.z, -3.83, -3.5) * above(p.y, 0.115) * (1.0 - above(p.y, top)) * clamp(post, 0.0, 1.0);
            planeCabin = win;
            planeGlass = max(win, screen);
            return mix(c, uGlass, planeGlass);
          }
          if (vPart < 1.5) return uWing;
          if (vPart < 2.5) return mix(uNavy, uYellow, above(p.y - 0.55 * (p.z - 3.2), 1.22));
          if (vPart < 3.5) return mix(uWhite, uWing * 0.8, 1.0 - above(p.z, -0.99));
          if (vPart < 4.5) return uYellow;
          return vec3(0.02, 0.025, 0.04);
        }`,
      )
      .replace("#include <color_fragment>", "#include <color_fragment>\ndiffuseColor.rgb *= planePaint();")
      .replace("#include <roughnessmap_fragment>", "#include <roughnessmap_fragment>\nroughnessFactor = mix(roughnessFactor, 0.12, planeGlass);")
      .replace("#include <emissivemap_fragment>", "#include <emissivemap_fragment>\ntotalEmissiveRadiance += uWarm * (planeCabin * 1.9 + (planeGlass - planeCabin) * 0.35) * uNight;");
  };
  const airframe = new THREE.Mesh(geometry, material);
  airframe.name = "airframe";

  // Landing gear: three legs with paired wheels, one small mesh that drops out of the belly.
  const gearParts: THREE.BufferGeometry[] = [];
  for (const [x, z, h] of [
    [0, -3.0, 0.5],
    [0.62, 0.25, 0.46],
    [-0.62, 0.25, 0.46],
  ] as [number, number, number][]) {
    gearParts.push(new THREE.CylinderGeometry(0.035, 0.035, h, 8).translate(x, -R - h / 2 + 0.1, z));
    for (const dx of [-0.09, 0.09]) gearParts.push(new THREE.CylinderGeometry(0.12, 0.12, 0.07, 16).rotateZ(Math.PI / 2).translate(x + dx, -R - h + 0.1, z));
  }
  const gear = new THREE.Mesh(mergeGeometries(gearParts)!, new THREE.MeshStandardMaterial({ color: "#1b2030", roughness: 0.6, metalness: 0.5 }));
  gear.visible = false;

  // Lights: [x, y, z, r, g, b, size, kind]. kind 0 steady, 1 beacon, 2 strobe, 3 landing (seen from ahead).
  const lamps = [
    [-3.95, 0.24, 1.15, 1, 0.12, 0.1, 0.5, 0],
    [3.95, 0.24, 1.15, 0.15, 1, 0.3, 0.5, 0],
    [0, 0.55, 4.02, 1, 1, 1, 0.42, 0],
    [0, 0.5, -0.4, 1, 0.1, 0.08, 0.8, 1],
    [0, -0.5, 0.1, 1, 0.1, 0.08, 0.8, 1],
    [-3.98, 0.3, 1.3, 1, 1, 1, 1.3, 2],
    [3.98, 0.3, 1.3, 1, 1, 1, 1.3, 2],
    [-0.62, -0.26, -0.95, 1, 0.97, 0.9, 3.4, 3],
    [0.62, -0.26, -0.95, 1, 0.97, 0.9, 3.4, 3],
    [0, -0.62, -3.1, 1, 0.97, 0.9, 2.2, 3],
  ];
  const lampGeometry = new THREE.BufferGeometry();
  lampGeometry.setAttribute("position", new THREE.Float32BufferAttribute(lamps.flatMap((l) => l.slice(0, 3)), 3));
  lampGeometry.setAttribute("color", new THREE.Float32BufferAttribute(lamps.flatMap((l) => l.slice(3, 6)), 3));
  lampGeometry.setAttribute("spec", new THREE.Float32BufferAttribute(lamps.flatMap((l) => [l[6], l[7]]), 2));
  const lampUniforms = { uTime: { value: 0 }, uPower: { value: 0.4 }, uLanding: { value: 0 }, uHeight: { value: 800 } };
  const lampMaterial = new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    uniforms: lampUniforms,
    vertexShader: /* glsl */ `
      attribute vec3 color; attribute vec2 spec;
      uniform float uTime, uPower, uLanding, uHeight;
      varying vec3 vC; varying float vA;
      void main() {
        vec4 mv = modelViewMatrix * vec4(position, 1.0);
        gl_Position = projectionMatrix * mv;
        float k = uPower;
        if (spec.y > 0.5 && spec.y < 1.5) k *= 0.25 + 0.75 * smoothstep(0.86, 0.9, fract(uTime * 0.8));
        if (spec.y > 1.5 && spec.y < 2.5) { float f = fract(uTime * 0.9); k *= step(f, 0.04) + step(0.12, f) * step(f, 0.16); }
        if (spec.y > 2.5) {
          vec3 forward = normalize((modelViewMatrix * vec4(0.0, 0.0, -1.0, 0.0)).xyz);
          k = uLanding * (0.25 + 1.4 * pow(max(dot(forward, normalize(-mv.xyz)), 0.0), 3.0));
        }
        vC = color; vA = k;
        gl_PointSize = clamp(spec.x * projectionMatrix[1][1] * uHeight * 0.5 / max(0.1, -mv.z), 2.0, 260.0);
      }`,
    fragmentShader: /* glsl */ `
      varying vec3 vC; varying float vA;
      void main() {
        float d = length(gl_PointCoord - 0.5) * 2.0;
        float core = smoothstep(0.22, 0.0, d);
        float halo = pow(max(0.0, 1.0 - d), 2.6) * 0.55;
        gl_FragColor = vec4((vC * (halo + core) + vec3(core)) * vA, 1.0);
      }`,
  });
  const lights = new THREE.Points(lampGeometry, lampMaterial);
  lights.frustumCulled = false;

  // Contrails: two crossed ribbons behind each engine, widening and thinning as they fall back.
  const trailPositions: number[] = [];
  const trailUv: number[] = [];
  const trailIndex: number[] = [];
  const TRAIL = 90;
  const SEG = isPhone ? 16 : 28;
  for (const side of [1, -1])
    for (const vertical of [0, 1]) {
      const base = trailPositions.length / 3;
      for (let i = 0; i <= SEG; i++) {
        const u = i / SEG;
        const w = 0.08 + 1.1 * Math.pow(u, 0.8);
        const z = ENGINE[2] + 0.9 + u * u * TRAIL;
        for (const v of [0, 1]) {
          const off = (v - 0.5) * 2 * w;
          trailPositions.push(ENGINE[0] * side + (vertical ? 0 : off), ENGINE[1] + 0.05 + (vertical ? off : 0), z);
          trailUv.push(u, v);
        }
        if (i < SEG) {
          const a = base + i * 2;
          trailIndex.push(a, a + 1, a + 2, a + 1, a + 3, a + 2);
        }
      }
    }
  const trailGeometry = new THREE.BufferGeometry();
  trailGeometry.setAttribute("position", new THREE.Float32BufferAttribute(trailPositions, 3));
  trailGeometry.setAttribute("uv", new THREE.Float32BufferAttribute(trailUv, 2));
  trailGeometry.setIndex(trailIndex);
  const trailUniforms = { uTime: { value: 0 }, uStrength: { value: 1 }, uColor: { value: new THREE.Color("#ffffff") } };
  const trails = new THREE.Mesh(
    trailGeometry,
    new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      side: THREE.DoubleSide,
      uniforms: trailUniforms,
      vertexShader: `varying vec2 vUv; void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
      fragmentShader: /* glsl */ `
        uniform float uTime, uStrength; uniform vec3 uColor; varying vec2 vUv;
        float h(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
        float vn(vec2 p) { vec2 i = floor(p), f = fract(p); f = f * f * (3.0 - 2.0 * f);
          return mix(mix(h(i), h(i + vec2(1, 0)), f.x), mix(h(i + vec2(0, 1)), h(i + vec2(1, 1)), f.x), f.y); }
        void main() {
          float across = 1.0 - pow(abs(vUv.y * 2.0 - 1.0), 2.0);
          float along = smoothstep(0.0, 0.05, vUv.x) * pow(1.0 - vUv.x, 1.4);
          float puff = 0.55 + 0.45 * vn(vec2(vUv.x * 46.0 - uTime * 1.6, vUv.y * 3.0));
          gl_FragColor = vec4(uColor, across * along * puff * 0.34 * uStrength);
        }`,
    }),
  );
  trails.frustumCulled = false;

  // The model sits inside the thread group, so the world can give it a little life of its own.
  const model = new THREE.Group();
  model.add(airframe, gear, lights, trails);
  const group = new THREE.Group();
  group.name = "thread";
  group.add(model);

  const pending = { gear: 0, landing: 0, trail: -1 };
  const api: PlaneApi = {
    gear: (v) => (pending.gear = Math.max(pending.gear, v)),
    landing: (v) => (pending.landing = Math.max(pending.landing, v)),
    trail: (v) => (pending.trail = Math.max(pending.trail, v)),
  };
  group.userData.plane = api;

  return {
    group,
    /** Once per frame, from the world: applies what acts asked for and the time of day. */
    tick(t: number, sky: { night: number; trail: THREE.Color }, bufferHeight: number) {
      model.position.y = 0.07 * Math.sin(t * 0.9);
      model.rotation.z = 0.022 * Math.sin(t * 0.62);
      model.rotation.x = 0.008 * Math.sin(t * 0.74 + 1.0);
      uniforms.uNight.value = sky.night;
      lampUniforms.uTime.value = t;
      lampUniforms.uPower.value = 0.3 + 0.9 * sky.night;
      lampUniforms.uLanding.value = pending.landing;
      lampUniforms.uHeight.value = bufferHeight;
      trailUniforms.uTime.value = t;
      trailUniforms.uStrength.value = pending.trail < 0 ? 1 : pending.trail;
      trailUniforms.uColor.value.copy(sky.trail);
      gear.visible = pending.gear > 0.01;
      gear.position.y = (1 - pending.gear) * 0.55;
      pending.gear = 0;
      pending.landing = 0;
      pending.trail = -1;
    },
    dispose() {
      geometry.dispose();
      material.dispose();
    },
  };
}
