// Generated cover art for cards and project rows: what an image would be on another site, drawn as SVG
// from a seed, in the site's own colors. It's a server component, so it costs no JavaScript, and the
// same seed always draws the same plate. Pass your own SVG as children to draw something bespoke.
import type { CSSProperties, ReactNode } from "react";
import { fbm2, rng } from "./math";

export const PLATE_KINDS = [
  "ridges",
  "orbits",
  "horizon",
  "halftone",
  "spectrum",
  "stack",
  "glyph",
] as const;
export type PlateKind = (typeof PLATE_KINDS)[number];

const W = 400;
const ink = { stroke: "var(--plate-ink)", fill: "none" } satisfies CSSProperties;
const accent = { stroke: "var(--accent)", fill: "none" } satisfies CSSProperties;
const f = (n: number) => n.toFixed(1);

function seedOf(seed: number | string) {
  if (typeof seed === "number") return seed;
  let h = 2166136261;
  for (const c of seed) h = Math.imul(h ^ c.charCodeAt(0), 16777619);
  return h >>> 0;
}

/** Ridge lines, each lifted by noise in the middle: landscape, signal, sound. */
function ridges(r: ReturnType<typeof rng>, H: number) {
  const lines = 26;
  const ox = r.range(0, 50);
  const hot = Math.floor(r.range(6, lines - 6));
  return Array.from({ length: lines }, (_, i) => {
    const base = H * 0.18 + (i / (lines - 1)) * H * 0.72;
    const points: string[] = [];
    for (let x = 0; x <= W; x += 8) {
      const envelope = Math.pow(Math.sin((x / W) * Math.PI), 3);
      const lift = Math.max(0, fbm2(ox + x * 0.012, i * 0.35, 4) + 0.25) * envelope * H * 0.22;
      points.push(`${f(x)},${f(base - lift)}`);
    }
    return (
      <polyline
        key={i}
        points={points.join(" ")}
        style={{ ...(i === hot ? accent : ink), fill: "var(--plate-bg)" }}
        strokeWidth={i === hot ? 2 : 1}
      />
    );
  });
}

/** Tilted orbits around a center, with one body on its path: systems, scale, attention. */
function orbits(r: ReturnType<typeof rng>, H: number) {
  const cx = W * r.range(0.4, 0.6);
  const cy = H * r.range(0.4, 0.6);
  const tilt = r.range(-35, 35);
  const rings = 9;
  const hot = Math.floor(r.range(3, rings));
  const angle = r.range(0, Math.PI * 2);
  const out: ReactNode[] = [
    <circle key="core" cx={cx} cy={cy} r={W * 0.07} style={{ fill: "var(--plate-ink)" }} />,
  ];
  for (let i = 1; i <= rings; i++) {
    const rx = W * 0.07 + i * W * 0.055;
    const ry = rx * 0.38;
    out.push(
      <ellipse
        key={i}
        cx={cx}
        cy={cy}
        rx={rx}
        ry={ry}
        transform={`rotate(${f(tilt)} ${f(cx)} ${f(cy)})`}
        style={i === hot ? accent : ink}
        strokeWidth={i === hot ? 1.6 : 0.8}
        strokeDasharray={i % 3 === 0 ? "2 6" : undefined}
      />,
    );
    if (i === hot) {
      const t = (tilt * Math.PI) / 180;
      const x = Math.cos(angle) * rx;
      const y = Math.sin(angle) * ry;
      out.push(
        <circle
          key="body"
          cx={cx + x * Math.cos(t) - y * Math.sin(t)}
          cy={cy + x * Math.sin(t) + y * Math.cos(t)}
          r={W * 0.025}
          style={{ fill: "var(--accent)" }}
        />,
      );
    }
  }
  return out;
}

/** A floor grid running to a horizon, with a disc rising behind it: arrival, a place, a goal. */
function horizon(r: ReturnType<typeof rng>, H: number) {
  const hy = H * r.range(0.42, 0.58);
  const vx = W * r.range(0.35, 0.65);
  const sun = W * r.range(0.16, 0.26);
  const out: ReactNode[] = [
    <circle key="sun" cx={vx} cy={hy} r={sun} style={{ fill: "var(--accent)" }} />,
    <rect key="floor" x={0} y={hy} width={W} height={H - hy} style={{ fill: "var(--plate-bg)" }} />,
  ];
  for (let i = 0; i < 7; i++)
    out.push(
      <rect
        key={`cut${i}`}
        x={vx - sun}
        y={hy - sun * 0.2 - i * sun * 0.17}
        width={sun * 2}
        height={1.5 + i * 0.9}
        style={{ fill: "var(--plate-bg)" }}
      />,
    );
  for (let i = -12; i <= 12; i++)
    out.push(
      <line
        key={`v${i}`}
        x1={vx}
        y1={hy}
        x2={vx + i * W * 0.14}
        y2={H}
        style={ink}
        strokeWidth={0.8}
      />,
    );
  for (let i = 1; i <= 10; i++) {
    const y = hy + (H - hy) * Math.pow(i / 10, 2.2);
    out.push(<line key={`h${i}`} x1={0} y1={y} x2={W} y2={y} style={ink} strokeWidth={0.8} />);
  }
  out.push(<line key="edge" x1={0} y1={hy} x2={W} y2={hy} style={ink} strokeWidth={1.4} />);
  return out;
}

/** A dot screen whose dots swell toward one point: density, a crowd, a signal in noise. */
function halftone(r: ReturnType<typeof rng>, H: number) {
  const step = 14;
  const fx = W * r.range(0.25, 0.75);
  const fy = H * r.range(0.3, 0.7);
  const ox = r.range(0, 40);
  const out: ReactNode[] = [];
  for (let y = step / 2; y < H; y += step)
    for (let x = step / 2; x < W; x += step) {
      const d = Math.hypot(x - fx, y - fy) / W;
      const size =
        Math.max(0, 1 - d * 1.6) * 0.75 + (fbm2(ox + x * 0.01, y * 0.01, 3) + 0.5) * 0.25;
      if (size < 0.06) continue;
      out.push(
        <circle
          key={`${x},${y}`}
          cx={x}
          cy={y}
          r={f(size * step * 0.48)}
          style={{ fill: d < 0.08 ? "var(--accent)" : "var(--plate-ink)" }}
        />,
      );
    }
  return out;
}

/** Bars of different weights and heights, one lit: data, rhythm, comparison. */
function spectrum(r: ReturnType<typeof rng>, H: number) {
  const out: ReactNode[] = [];
  const ox = r.range(0, 60);
  let x = W * 0.08;
  let i = 0;
  const hot = Math.floor(r.range(4, 14));
  const floor = H * 0.86;
  while (x < W * 0.92) {
    const w = r.range(3, 14);
    const h = (fbm2(ox + i * 0.18, 0, 4) * 0.5 + 0.55) * H * 0.7;
    out.push(
      <rect
        key={i}
        x={f(x)}
        y={f(floor - h)}
        width={f(w)}
        height={f(h)}
        style={{ fill: i === hot ? "var(--accent)" : "var(--plate-ink)" }}
      />,
    );
    x += w + r.range(3, 9);
    i++;
  }
  out.push(
    <line
      key="floor"
      x1={W * 0.08}
      y1={floor + 8}
      x2={W * 0.92}
      y2={floor + 8}
      style={ink}
      strokeWidth={1}
    />,
  );
  return out;
}

/** Slabs stacked in isometric, slightly off true: building, layers, a product. */
function stack(r: ReturnType<typeof rng>, H: number) {
  const out: ReactNode[] = [];
  const cx = W / 2;
  const size = W * 0.3;
  const count = Math.floor(r.range(4, 7));
  const hot = Math.floor(r.range(0, count));
  const thick = H * 0.045;
  let y = H * 0.72;
  for (let i = 0; i < count; i++) {
    const s = size * r.range(0.75, 1.05);
    const dx = r.range(-W * 0.05, W * 0.05);
    const x = cx + dx;
    const top = `${f(x)},${f(y - s * 0.5)} ${f(x + s)},${f(y)} ${f(x)},${f(y + s * 0.5)} ${f(x - s)},${f(y)}`;
    const left = `${f(x - s)},${f(y)} ${f(x)},${f(y + s * 0.5)} ${f(x)},${f(y + s * 0.5 + thick)} ${f(x - s)},${f(y + thick)}`;
    const right = `${f(x + s)},${f(y)} ${f(x)},${f(y + s * 0.5)} ${f(x)},${f(y + s * 0.5 + thick)} ${f(x + s)},${f(y + thick)}`;
    const color = i === hot ? "var(--accent)" : "var(--plate-bg)";
    out.push(
      <g key={i} style={{ stroke: "var(--plate-ink)" }} strokeWidth={1} strokeLinejoin="round">
        <polygon points={left} style={{ fill: "var(--plate-shade)" }} />
        <polygon points={right} style={{ fill: "var(--plate-bg)" }} />
        <polygon points={top} style={{ fill: color }} />
      </g>,
    );
    y -= thick + r.range(H * 0.03, H * 0.08);
  }
  return out;
}

/** One huge character cropped by the frame, with a hairline grid: an index, a chapter, a name. */
function glyph(r: ReturnType<typeof rng>, H: number, mark: string) {
  const out: ReactNode[] = [];
  const size = Math.min(H * 0.85, (W * 1.5) / Math.max(1, mark.length)); // fills the width, cropped only by the bottom
  for (let i = 1; i < 6; i++)
    out.push(
      <line
        key={`g${i}`}
        x1={(W * i) / 6}
        y1={0}
        x2={(W * i) / 6}
        y2={H}
        style={ink}
        strokeWidth={0.5}
        opacity={0.4}
      />,
    );
  out.push(
    <text
      key="mark"
      x={W * r.range(0.04, 0.1)}
      y={H * 0.9}
      style={{ fill: "var(--plate-ink)", fontFamily: "var(--font-heading)" }}
      fontSize={size}
      fontWeight={700}
      letterSpacing={-size * 0.04}
    >
      {mark}
    </text>,
    <circle
      key="dot"
      cx={W * r.range(0.6, 0.85)}
      cy={H * r.range(0.12, 0.3)}
      r={W * 0.045}
      style={{ fill: "var(--accent)" }}
    />,
  );
  return out;
}

/**
 * A generated cover. `seed` is any number or string (a project's slug works), and the same seed
 * always gives the same plate. Leave `kind` out to let the seed choose. `ratio` is width / height.
 * `mark` is the character for `glyph`. Decorative unless given a `label`.
 */
export function Plate(props: {
  seed: number | string;
  kind?: PlateKind;
  ratio?: number;
  mark?: string;
  label?: string;
  className?: string;
  children?: ReactNode;
}) {
  const { seed, ratio = 4 / 5, mark = "01", label, className = "", children } = props;
  const r = rng(seedOf(seed));
  const kind = props.kind ?? PLATE_KINDS[Math.floor(r() * (PLATE_KINDS.length - 1))]; // glyph only when asked for
  const H = Math.round(W / ratio);
  const draw = { ridges, orbits, horizon, halftone, spectrum, stack, glyph }[kind];
  return (
    <figure
      className={`plate ${className}`}
      style={{ aspectRatio: String(ratio) }}
      {...(label ? { role: "img", "aria-label": label } : { "aria-hidden": true })}
    >
      <svg
        className="plate-art"
        viewBox={`0 0 ${W} ${H}`}
        preserveAspectRatio="xMidYMid slice"
        xmlns="http://www.w3.org/2000/svg"
      >
        <rect width={W} height={H} style={{ fill: "var(--plate-bg)" }} />
        {children ?? draw(r, H, mark)}
      </svg>
    </figure>
  );
}
