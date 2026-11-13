// The building blocks of a section's page content. These are plain server components: they render
// real text and data attributes, and `clock.ts` moves them. With no JavaScript or with reduced
// motion, the same markup falls back to an ordinary readable page.
import { Fragment, type CSSProperties, type ReactNode } from "react";
import { brief } from "@/site/brief";

type StyleWithVars = CSSProperties & Record<`--${string}`, string | number>;

/**
 * One section of the site.
 * `length` is how many screens tall it is: it stays pinned for `length - 1` screens of scrolling.
 * `flow` turns pinning off for content taller than a screen, such as long lists.
 */
export function Section(props: {
  slug: string;
  length?: number;
  flow?: boolean;
  tone?: "dark" | "light";
  label?: string;
  children: ReactNode;
}) {
  const { slug, length = 2.5, flow = false, tone, label, children } = props;
  return (
    <section
      id={slug}
      data-section={slug}
      data-tone={tone}
      aria-label={label}
      className={flow ? "section section-flow" : "section section-pinned"}
      style={{ "--length": length } as StyleWithVars}
    >
      {flow ? children : <div data-stage="" className="section-stage">{children}</div>}
    </section>
  );
}

/**
 * Content that appears between two points of the section's progress, both 0..1. Use from=0 for
 * content already there when the section arrives, and to=1 for content still there when it leaves.
 * Sets `--q`, 0..1, for anything inside to follow. `className` positions it inside the screen.
 */
export function Beat(props: { from: number; to: number; fade?: number; className?: string; children: ReactNode }) {
  const { from, to, fade = 0.05, className = "", children } = props;
  return (
    <div data-beat={`${from},${to},${fade}`} className={`beat ${className}`}>
      {children}
    </div>
  );
}

/** Literal parallax: moves `speed` screen-heights over the section. Negative moves the other way. */
export function Depth(props: { speed: number; className?: string; children: ReactNode }) {
  return (
    <div data-depth={props.speed} className={`depth ${props.className ?? ""}`}>
      {props.children}
    </div>
  );
}

/** Words that rise into place, one after another, as their Beat arrives. Stays readable as text. */
export function Words({ text, className = "" }: { text: string; className?: string }) {
  return (
    <span className={`words ${className}`}>
      {text.split(" ").map((word, i) => (
        <Fragment key={i}>
          <span className="word-mask">
            <span className="word" style={{ "--i": i } as StyleWithVars}>
              {word}
            </span>
          </span>{" "}
        </Fragment>
      ))}
    </span>
  );
}

/**
 * Content in a `flow` section that rises in as it scrolls onto the screen, and sinks back if you
 * scroll up. Sets `--q`, 0..1, like a Beat, so `Words` inside it rise word by word. `order` staggers
 * neighbors: 0, 1, 2... Don't use it inside a pinned section; use a Beat there.
 */
export function Reveal(props: { order?: number; className?: string; children: ReactNode }) {
  const { order = 0, className = "", children } = props;
  return (
    <div data-reveal={order} className={`reveal ${className}`}>
      {children}
    </div>
  );
}

/**
 * A number that counts up as its Beat or Reveal arrives. The page's markup holds the final value,
 * so it reads correctly with no JavaScript. Pass the plain number, and any unit as prefix or suffix.
 */
export function Count(props: { to: number; decimals?: number; prefix?: string; suffix?: string; className?: string }) {
  const { to, decimals = 0, prefix = "", suffix = "", className = "" } = props;
  const format = new Intl.NumberFormat(brief.lang, { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
  return (
    <span className={`count ${className}`}>
      {prefix}
      <span data-count={to} data-decimals={decimals}>
        {format.format(to)}
      </span>
      {suffix}
    </span>
  );
}

/**
 * A row that loops sideways forever, for client names, skills or a running line of type. With no
 * JavaScript or with reduced motion it's a plain wrapped list. `seconds` is one full loop; `reverse`
 * runs it the other way. It may run off the screen on purpose, so it's marked `data-bleed`.
 */
export function Marquee(props: { seconds?: number; reverse?: boolean; className?: string; children: ReactNode }) {
  const { seconds = 40, reverse = false, className = "", children } = props;
  return (
    <div
      data-bleed=""
      className={`marquee ${reverse ? "marquee-reverse" : ""} ${className}`}
      style={{ "--marquee-seconds": `${seconds}s` } as StyleWithVars}
    >
      <div className="marquee-track">
        <div className="marquee-group">{children}</div>
        <div className="marquee-group" aria-hidden="true" inert>
          {children}
        </div>
      </div>
    </div>
  );
}

/** The time now in a city, kept current by the clock. Shows only the city without JavaScript. */
export function LocalTime(props: { city: string; zone: string; className?: string }) {
  return (
    <span className={`local-time ${props.className ?? ""}`}>
      {props.city}{" "}
      <span data-time={props.zone} className="local-time-value tabular-nums">
        --:--
      </span>
    </span>
  );
}
