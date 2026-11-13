// The one clock of the site. It owns smooth scrolling and the single requestAnimationFrame loop,
// works out which section the scroll position is in, and drives the DOM effects. It never loads
// three.js, so the page's text and effects work even if WebGL never starts.
import Lenis from "lenis";
import type { Frame } from "./types";

type Span = {
  slug: string;
  el: HTMLElement;
  top: number;
  end: number;
  beats: Beat[];
  depths: Depth[];
  lastP: number;
};
type Beat = { el: HTMLElement; from: number; to: number; fade: number; last: number; counts: Count[] };
type Reveal = { el: HTMLElement; top: number; order: number; last: number; counts: Count[] };
type Count = { el: HTMLElement; to: number; format: Intl.NumberFormat; last: string };
type Time = { el: HTMLElement; format: Intl.DateTimeFormat | null };
type Depth = { el: HTMLElement; speed: number };
type Listener = (frame: Frame, now: number) => void;

const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
const easeOut = (x: number) => 1 - Math.pow(1 - x, 3);
const REVEAL_START = 0.92; // a Reveal starts rising when its top passes this far down the screen
const REVEAL_SPAN = 0.22; // and takes this share of a screen of scrolling to arrive
const REVEAL_STAGGER = 0.045;

/** Distance from the top of the document, ignoring transforms (which the clock itself sets). */
function documentTop(el: HTMLElement) {
  let top = 0;
  for (let node: HTMLElement | null = el; node; node = node.offsetParent as HTMLElement | null) top += node.offsetTop;
  return top;
}

function countsIn(root: HTMLElement, lang: string): Count[] {
  return [...root.querySelectorAll<HTMLElement>("[data-count]")].map((el) => {
    const decimals = Number(el.dataset.decimals ?? 0);
    const format = new Intl.NumberFormat(lang, { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
    return { el, to: Number(el.dataset.count), format, last: el.textContent ?? "" };
  });
}

function paintCounts(counts: Count[], q: number) {
  for (const count of counts) {
    const text = count.format.format(count.to * easeOut(q));
    if (text === count.last) continue;
    count.last = text;
    count.el.textContent = text;
  }
}

function clockFormat(zone: string, lang: string) {
  try {
    return new Intl.DateTimeFormat(lang, { hour: "2-digit", minute: "2-digit", hourCycle: "h23", timeZone: zone });
  } catch {
    return null; // an unknown time zone keeps its placeholder rather than breaking the page
  }
}

export function beatStrength(p: number, from: number, to: number, fade: number) {
  const rise = from <= 0 ? 1 : clamp01((p - from) / fade);
  const fall = to >= 1 ? 1 : clamp01((to - p) / fade);
  return Math.min(rise, fall);
}

export function createClock() {
  const motion = document.documentElement.classList.contains("motion");
  const lenis = motion ? new Lenis({ autoRaf: false, lerp: 0.1 }) : null;
  const listeners = new Set<Listener>();
  let spans: Span[] = [];
  let reveals: Reveal[] = [];
  let times: Time[] = [];
  let lastTick = 0;
  const progress = document.querySelector<HTMLElement>("[data-scroll-progress]");
  const lang = document.documentElement.lang || "en";
  let vh = window.innerHeight;
  let frameId = 0;
  let dirty = true;
  let lastY = -1;

  const measure = () => {
    vh = window.innerHeight;
    const scroll = window.scrollY;
    spans = [...document.querySelectorAll<HTMLElement>("[data-section]")].map((el) => {
      const rect = el.getBoundingClientRect();
      const stage = el.querySelector<HTMLElement>("[data-stage]");
      const top = rect.top + scroll;
      const pinned = stage ? stage.offsetHeight : vh;
      return {
        slug: el.dataset.section!,
        el,
        top,
        end: Math.max(top, top + rect.height - pinned),
        lastP: -1,
        beats: [...el.querySelectorAll<HTMLElement>("[data-beat]")].map((beat) => {
          const [from, to, fade] = beat.dataset.beat!.split(",").map(Number);
          return { el: beat, from, to, fade, last: -1, counts: countsIn(beat, lang) };
        }),
        depths: [...el.querySelectorAll<HTMLElement>("[data-depth]")].map((depth) => ({
          el: depth,
          speed: Number(depth.dataset.depth),
        })),
      };
    });
    reveals = [...document.querySelectorAll<HTMLElement>("[data-reveal]")].map((el) => ({
      el,
      top: documentTop(el),
      order: Number(el.dataset.reveal) || 0,
      last: -1,
      counts: countsIn(el, lang),
    }));
    times = [...document.querySelectorAll<HTMLElement>("[data-time]")].map((el) => ({
      el,
      format: clockFormat(el.dataset.time!, lang),
    }));
    lastTick = 0;
    dirty = true;
  };

  const frameAt = (y: number): Frame => {
    if (!motion) {
      const middle = y + vh / 2;
      let a = 0;
      spans.forEach((span, i) => {
        if (span.top <= middle) a = i;
      });
      return { y, a, b: a, pA: 0.5, pB: 0.5, w: 0, still: true };
    }
    const last = spans.length - 1;
    for (let i = 0; i <= last; i++) {
      const span = spans[i];
      if (y <= span.end) {
        if (y >= span.top || i === 0) {
          const length = span.end - span.top;
          const p = length > 0 ? clamp01((y - span.top) / length) : 0;
          return { y, a: i, b: i, pA: p, pB: p, w: 0, still: false };
        }
        const previous = spans[i - 1];
        const w = clamp01((y - previous.end) / Math.max(1, span.top - previous.end));
        return { y, a: i - 1, b: i, pA: 1, pB: 0, w, still: false };
      }
    }
    return { y, a: last, b: last, pA: 1, pB: 1, w: 0, still: false };
  };

  const paintSection = (span: Span, p: number) => {
    if (p === span.lastP) return;
    span.lastP = p;
    span.el.style.setProperty("--p", p.toFixed(4));
    for (const beat of span.beats) {
      const q = beatStrength(p, beat.from, beat.to, beat.fade);
      if (q === beat.last) continue;
      beat.last = q;
      const rising = p < (beat.from + beat.to) / 2;
      beat.el.style.opacity = q.toFixed(3);
      beat.el.style.setProperty("--q", q.toFixed(3));
      beat.el.style.transform = `translate3d(0, ${((1 - q) * (rising ? 28 : -28)).toFixed(1)}px, 0)`;
      beat.el.style.visibility = q === 0 ? "hidden" : "visible";
      paintCounts(beat.counts, q);
    }
    for (const depth of span.depths) {
      const shift = (0.5 - p) * depth.speed * vh;
      depth.el.style.transform = `translate3d(0, ${shift.toFixed(1)}px, 0)`;
    }
  };

  let activeNav = "";
  const paint = (frame: Frame) => {
    if (!motion) return;
    spans.forEach((span, i) => {
      const y = frame.y;
      if (y + vh < span.top - vh || y > span.end + vh * 2) return;
      paintSection(span, i === frame.a ? frame.pA : i === frame.b ? frame.pB : y < span.top ? 0 : 1);
    });
    for (const reveal of reveals) {
      const start = reveal.top - vh * (REVEAL_START - reveal.order * REVEAL_STAGGER);
      const q = clamp01((frame.y - start) / (vh * REVEAL_SPAN));
      if (q === reveal.last) continue;
      reveal.last = q;
      reveal.el.style.setProperty("--q", q.toFixed(3));
      paintCounts(reveal.counts, q);
    }
    if (progress) {
      const share = Math.round((frame.y / Math.max(1, document.documentElement.scrollHeight - vh)) * 100);
      progress.textContent = String(Math.min(100, share)).padStart(3, "0");
    }
    const current = spans[frame.w > 0.5 ? frame.b : frame.a]?.slug ?? "";
    if (current !== activeNav) {
      activeNav = current;
      document.querySelectorAll<HTMLElement>("[data-nav]").forEach((link) => {
        if (link.dataset.nav === current) link.setAttribute("aria-current", "true");
        else link.removeAttribute("aria-current");
      });
    }
  };

  const loop = (now: number) => {
    frameId = requestAnimationFrame(loop);
    lenis?.raf(now);
    const y = window.scrollY;
    const frame = frameAt(y);
    if (y !== lastY || dirty) {
      lastY = y;
      dirty = false;
      paint(frame);
    }
    listeners.forEach((listener) => listener(frame, now));
    if (times.length && now - lastTick > 1000) {
      lastTick = now;
      const date = new Date();
      for (const time of times) if (time.format) time.el.textContent = time.format.format(date);
    }
  };

  measure();
  const resizeObserver = new ResizeObserver(measure);
  resizeObserver.observe(document.body);
  window.addEventListener("resize", measure);
  frameId = requestAnimationFrame(loop);

  const onLink = (event: MouseEvent) => {
    const link = (event.target as HTMLElement).closest?.('a[href^="#"]');
    const id = link?.getAttribute("href")?.slice(1);
    const target = id ? document.getElementById(id) : null;
    if (!lenis || !target) return;
    event.preventDefault();
    lenis.scrollTo(target, { duration: 1.6 });
  };
  document.addEventListener("click", onLink);

  return {
    motion,
    sections: () => spans,
    frameAt,
    now: () => frameAt(window.scrollY),
    onFrame(listener: Listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    jump(y: number) {
      if (lenis) lenis.scrollTo(y, { immediate: true, force: true });
      else window.scrollTo(0, y);
      dirty = true;
    },
    destroy() {
      cancelAnimationFrame(frameId);
      resizeObserver.disconnect();
      window.removeEventListener("resize", measure);
      document.removeEventListener("click", onLink);
      lenis?.destroy();
      listeners.clear();
    },
  };
}

export type Clock = ReturnType<typeof createClock>;
