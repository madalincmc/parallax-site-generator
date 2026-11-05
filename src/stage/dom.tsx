// The building blocks of a section's page content. These are plain server components: they render
// real text and data attributes, and `clock.ts` moves them. With no JavaScript or with reduced
// motion, the same markup falls back to an ordinary readable page.
import { Fragment, type CSSProperties, type ReactNode } from "react";

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
