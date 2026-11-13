// Blocks for photographs: the Frame style's whole vocabulary, usable in any style that has images.
// They're server components. Scroll-linked motion comes from the section's --p through CSS (see the
// "Frame" part of globals.css), so there's still one clock. The carousel's buttons and counter are the
// clock's too. With no JavaScript or reduced motion, each block is a plain photo or a row of photos.
//
// Images are the owner's own, imported to public/images/work/ by scripts/onboard/images.mjs, which
// writes manifest.json with each one's size. Next.js serves each at the size the screen needs.
import Image from "next/image";
import type { CSSProperties, ReactNode } from "react";

type Vars = CSSProperties & Record<`--${string}`, string | number>;

/** One photograph: where it is, its real size, and what it shows (empty alt only if decorative). */
export type Picture = { src: string; width: number; height: number; alt: string };

/** A rectangle on the screen, in percent: [left, top, width, height]. */
export type Rect = [number, number, number, number];

const pad = (n: number) => String(n).padStart(2, "0");
const FULL: Rect = [0, 0, 100, 100];
const clampTo = (x: number, min: number, max: number) => Math.min(max, Math.max(min, x));

/**
 * The same frame on a tall phone screen. A rectangle given in percent of a wide screen would become a
 * thin sliver on a phone, so this keeps its shape (as it looks on a 16:9 screen) and its center, and
 * makes it larger, since a phone is narrow.
 */
export function portraitRect([x, y, w, h]: Rect): Rect {
  if (w >= 99 && h >= 99) return FULL;
  const shape = (w * 16) / (h * 9); // its width over its height, as seen on a wide screen
  const pw = clampTo(w * 2.6, 44, 92);
  const ph = clampTo((pw * 390) / (844 * shape), 12, 70);
  const cx = clampTo(x + w / 2, pw / 2, 100 - pw / 2);
  const cy = clampTo(y + h / 2, ph / 2, 100 - ph / 2);
  return [cx - pw / 2, cy - ph / 2, pw, ph];
}

/** A photograph at its own proportions, or cropped to `ratio`. `drift` slides it inside its frame with scroll. */
export function Photo(props: {
  image: Picture;
  ratio?: number;
  sizes?: string;
  drift?: number;
  priority?: boolean;
  className?: string;
  children?: ReactNode;
}) {
  const {
    image,
    ratio = image.width / image.height,
    sizes = "(min-width: 900px) 50vw, 100vw",
    drift = 0,
    priority,
    className = "",
    children,
  } = props;
  return (
    <figure
      className={`photo ${className}`}
      style={{ aspectRatio: String(ratio), "--drift": drift } as Vars}
    >
      <span className="photo-media">
        <Image src={image.src} alt={image.alt} fill sizes={sizes} priority={priority} />
      </span>
      {children}
    </figure>
  );
}

/** A small photo set inside a line of text, like a word. Put it inside a heading or paragraph. */
export function InlinePhoto({ image, className = "" }: { image: Picture; className?: string }) {
  return (
    <span className={`inline-photo ${className}`}>
      <Image src={image.src} alt={image.alt} fill sizes="160px" />
    </span>
  );
}

/**
 * The signature move: a photograph that grows from a small frame (`start`) to the full screen (`end`)
 * between `from` and `to` of the section's progress, or the reverse if you swap them. By default the
 * whole picture scales with its frame; `crop` keeps it full size and opens a window onto it instead.
 * Place it directly in a pinned Section, before the Beats that sit over it. `shade` darkens it for
 * text over it, 0 to 0.6, in proportion to how much of the screen it fills. With no motion it's an
 * ordinary photo.
 */
export function Expand(props: {
  image: Picture;
  from?: number;
  to?: number;
  start?: Rect;
  end?: Rect;
  radius?: [number, number];
  phone?: { start?: Rect; end?: Rect };
  crop?: boolean;
  shade?: number;
  priority?: boolean;
  className?: string;
}) {
  const {
    image,
    from = 0,
    to = 0.6,
    start = [36, 30, 28, 36],
    end = FULL,
    radius = [16, 0],
    phone = {},
    crop = false,
    shade = 0,
    priority,
    className = "",
  } = props;
  const rects = {
    s: start,
    e: end,
    ps: phone.start ?? portraitRect(start),
    pe: phone.end ?? portraitRect(end),
  };
  const corners = Object.fromEntries(
    Object.entries(rects).flatMap(([key, [x, y, w, h]]) => [
      [`--${key}x`, x],
      [`--${key}y`, y],
      [`--${key}w`, w],
      [`--${key}h`, h],
    ]),
  );
  const style = {
    ...corners,
    "--from": from,
    "--to": to,
    "--r0": radius[0],
    "--r1": radius[1],
    "--shade": shade,
    "--ratio": String(image.width / image.height),
  } as Vars;
  return (
    <div className={`expand ${crop ? "expand-crop" : ""} ${className}`} style={style}>
      <span className="expand-inner">
        <Image src={image.src} alt={image.alt} fill sizes="100vw" priority={priority} />
      </span>
    </div>
  );
}

/**
 * Full-screen photographs in a pinned Section, each wiping up over the last as you scroll, with a
 * caption, a big index, a progress line and dots. `from` and `to` are the slice of the section it
 * runs over. Give the section about 0.8 screens per photo, plus one.
 */
export function Sequence(props: {
  items: (Picture & { title?: string; note?: string })[];
  from?: number;
  to?: number;
  label?: string;
  className?: string;
}) {
  const { items, from = 0, to = 1, label, className = "" } = props;
  const n = items.length;
  return (
    <div
      className={`sequence ${className}`}
      style={{ "--n": n, "--from": from, "--to": to } as Vars}
      aria-label={label}
    >
      {items.map((item, i) => (
        <figure key={item.src + i} className="sequence-item" style={{ "--i": i } as Vars}>
          <span className="sequence-media">
            <Image src={item.src} alt={item.alt} fill sizes="100vw" priority={i === 0} />
          </span>
          {(item.title || item.note) && (
            <figcaption className="sequence-caption">
              <span className="sequence-label">
                {item.title && <span className="sequence-title">{item.title}</span>}
                {item.note && <span className="sequence-note">{item.note}</span>}
              </span>
              <span className="sequence-index" aria-hidden="true">
                {pad(i + 1)}
                <small>/ {pad(n)}</small>
              </span>
            </figcaption>
          )}
        </figure>
      ))}
      <span className="sequence-ui" aria-hidden="true">
        <i className="sequence-bar" />
        <span className="sequence-dots">
          {items.map((item, i) => (
            <i key={item.src + i} style={{ "--i": i } as Vars} />
          ))}
        </span>
      </span>
    </div>
  );
}

/**
 * A row of photographs to swipe or click through, snapping one at a time, with a counter and
 * previous and next buttons (and `thumbs`, a strip of thumbnails that jump to each). It works with
 * no JavaScript as a native scrolling row. `slide` is each slide's width in percent of the row.
 */
export function Carousel(props: {
  items: (Picture & { title?: string; note?: string })[];
  label: string;
  slide?: number;
  ratio?: number;
  thumbs?: boolean;
  className?: string;
}) {
  const { items, label, slide = 78, ratio = 3 / 2, thumbs = false, className = "" } = props;
  const n = items.length;
  return (
    <div
      className={`carousel ${className}`}
      data-carousel=""
      role="region"
      aria-roledescription="carousel"
      aria-label={label}
      style={{ "--slide": `${slide}%` } as Vars}
    >
      <div className="carousel-track" data-carousel-track="" tabIndex={0}>
        {items.map((item, i) => (
          <figure key={item.src + i} className="carousel-slide" aria-label={`${i + 1} of ${n}`}>
            <span className="carousel-media" style={{ aspectRatio: String(ratio) }}>
              <Image
                src={item.src}
                alt={item.alt}
                fill
                sizes={`(min-width: 900px) ${Math.round(slide * 0.9)}vw, 90vw`}
              />
            </span>
            {(item.title || item.note) && (
              <figcaption className="carousel-caption">
                {item.title && <span className="carousel-title">{item.title}</span>}
                {item.note && <span className="carousel-note">{item.note}</span>}
              </figcaption>
            )}
          </figure>
        ))}
      </div>
      <div className="carousel-ui">
        <button type="button" data-carousel-prev="" aria-label="Previous photo">
          ←
        </button>
        <span className="carousel-count tabular-nums">
          <span data-carousel-index="">01</span> / {pad(n)}
        </span>
        <button type="button" data-carousel-next="" aria-label="Next photo">
          →
        </button>
      </div>
      {thumbs && (
        <div className="carousel-thumbs">
          {items.map((item, i) => (
            <button
              key={item.src + i}
              type="button"
              data-carousel-go={i}
              aria-label={`Show photo ${i + 1}`}
            >
              <Image src={item.src} alt="" fill sizes="96px" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/**
 * Small photographs floating around a heading at different depths, drifting at their own speed as
 * the section scrolls. Place it in a pinned Section with the heading in a Beat. Each tile is
 * `[left, top, width]` in percent of the screen and a `depth` (0.1 slow to 0.6 fast). Hidden on phones.
 */
export function Scatter(props: {
  tiles: { image: Picture; at: [number, number, number]; depth?: number }[];
  className?: string;
}) {
  return (
    <div className={`scatter ${props.className ?? ""}`} aria-hidden="true">
      {props.tiles.map(({ image, at: [x, y, w], depth = 0.25 }, i) => (
        <span
          key={image.src + i}
          className="scatter-tile"
          style={
            {
              "--x": x,
              "--y": y,
              "--w": w,
              "--depth": depth,
              aspectRatio: String(image.width / image.height),
            } as Vars
          }
        >
          <Image src={image.src} alt="" fill sizes={`${Math.ceil(w * 1.2)}vw`} />
        </span>
      ))}
    </div>
  );
}

/**
 * A bank of cloud or mist that rolls up over everything between `from` and `to`, to change chapter
 * the way a cut can't. It's drawn from SVG noise in the page color, not an image. Place it last in a
 * pinned Section: at the end of one section (from 0.75 to 1) it rises until it covers the screen, and
 * with `clear` at the start of the next (0 to 0.25) it carries on up and away.
 */
export function Mist({
  from = 0.75,
  to = 1,
  clear = false,
  seed = 4,
}: {
  from?: number;
  to?: number;
  clear?: boolean;
  seed?: number;
}) {
  const id = `mist-${seed}`;
  return (
    <div
      className={`mist ${clear ? "mist-clear" : ""}`}
      style={{ "--from": from, "--to": to } as Vars}
      aria-hidden="true"
    >
      <svg width="100%" height="100%" preserveAspectRatio="none" viewBox="0 0 1600 1000">
        <defs>
          <linearGradient id={`${id}-band`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#fff" stopOpacity="0" />
            <stop offset="0.3" stopColor="#fff" stopOpacity="1" />
            <stop offset="0.7" stopColor="#fff" stopOpacity="1" />
            <stop offset="1" stopColor="#fff" stopOpacity="0" />
          </linearGradient>
          <filter id={id} x="0" y="0" width="100%" height="100%" colorInterpolationFilters="sRGB">
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.0035 0.009"
              numOctaves={5}
              seed={seed}
              result="noise"
            />
            <feColorMatrix
              in="noise"
              type="matrix"
              values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  1.6 0 0 0 -0.35"
              result="cloud"
            />
            <feComposite
              in="SourceAlpha"
              in2="cloud"
              operator="arithmetic"
              k1="0"
              k2="1.5"
              k3="1"
              k4="-0.55"
              result="shape"
            />
            <feGaussianBlur in="shape" stdDeviation="6" result="soft" />
            <feFlood style={{ floodColor: "var(--mist, var(--bg))" }} result="color" />
            <feComposite in="color" in2="soft" operator="in" />
          </filter>
        </defs>
        <rect width="1600" height="1000" fill={`url(#${id}-band)`} filter={`url(#${id})`} />
      </svg>
    </div>
  );
}
