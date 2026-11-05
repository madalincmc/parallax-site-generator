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
type Beat = { el: HTMLElement; from: number; to: number; fade: number; last: number };
type Depth = { el: HTMLElement; speed: number };
type Listener = (frame: Frame, now: number) => void;

const clamp01 = (x: number) => Math.min(1, Math.max(0, x));

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
          return { el: beat, from, to, fade, last: -1 };
        }),
        depths: [...el.querySelectorAll<HTMLElement>("[data-depth]")].map((depth) => ({
          el: depth,
          speed: Number(depth.dataset.depth),
        })),
      };
    });
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
