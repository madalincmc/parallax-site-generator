// Pure math with no three.js, so server components (like Plate) can share the seeded helpers.
export const clamp = (x: number, min = 0, max = 1) => Math.min(max, Math.max(min, x));
export const lerp = (a: number, b: number, k: number) => a + (b - a) * k;
export const remap = (x: number, from: number, to: number) => clamp((x - from) / (to - from));
export const smooth = (x: number) => x * x * (3 - 2 * x);
export const smoother = (x: number) => x * x * x * (x * (x * 6 - 15) + 10);
/** 0 to 1 over the slice [from, to] of p, eased. The basic building block of a scrubbed act. */
export const segment = (p: number, from: number, to: number) => smoother(remap(p, from, to));
/** Seeded random, because Math.random would change the site on every visit. */
export function rng(seed = 1) {
  let s = seed >>> 0 || 1;
  const next = () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let z = s;
    z = Math.imul(z ^ (z >>> 15), z | 1);
    z ^= z + Math.imul(z ^ (z >>> 7), z | 61);
    return ((z ^ (z >>> 14)) >>> 0) / 4294967296;
  };
  return Object.assign(next, { range: (a: number, b: number) => a + (b - a) * next() });
}

function hash2(x: number, y: number) {
  const s = Math.sin(x * 127.1 + y * 311.7) * 43758.5453;
  return s - Math.floor(s);
}

/** Smooth value noise, about -1..1. */
export function noise2(x: number, y: number) {
  const xi = Math.floor(x);
  const yi = Math.floor(y);
  const u = smooth(x - xi);
  const v = smooth(y - yi);
  const a = lerp(hash2(xi, yi), hash2(xi + 1, yi), u);
  const b = lerp(hash2(xi, yi + 1), hash2(xi + 1, yi + 1), u);
  return lerp(a, b, v) * 2 - 1;
}

export function fbm2(x: number, y: number, octaves = 5) {
  let sum = 0;
  let amp = 0.5;
  for (let i = 0; i < octaves; i++) {
    sum += noise2(x, y) * amp;
    x = x * 2.03 + 17.1;
    y = y * 2.03 + 9.2;
    amp *= 0.5;
  }
  return sum;
}
