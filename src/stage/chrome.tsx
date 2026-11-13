// The page's chrome, the menu and the preloader, which differ by site style. Sections never draw
// their own menu. Whatever the style, the fixed menu carries the class `chapters`, which
// scripts/check.mjs uses to fail text that runs under it.
import Link from "next/link";
import { getPosts, getProjects } from "@/lib/content";
import { brief } from "@/site/brief";
import { LocalTime } from "./dom";
import { clocks, siteStyle, status } from "./style";

type Entry = { slug: string; label: string; anchor?: string };

const pad = (n: number) => String(n).padStart(2, "0");
const href = ({ slug, anchor }: Entry) => `#${anchor ?? slug}`;

export function Preloader() {
  if (siteStyle === "editorial")
    return (
      <div className="preloader preloader-editorial" aria-hidden="true">
        <span className="font-display text-[clamp(2.5rem,9vw,8rem)] leading-[0.9] tracking-[-0.03em]">
          {brief.name}
        </span>
        <span className="font-mono text-sm" data-preloader-count="">
          0%
        </span>
        <i className="preloader-bar" />
      </div>
    );
  if (siteStyle === "frame")
    return (
      <div className="preloader preloader-frame" aria-hidden="true">
        <i className="preloader-frame-box" />
        <span className="font-display text-[clamp(2.5rem,8vw,6.5rem)] leading-[0.92] tracking-[-0.02em]">
          {brief.name}
        </span>
        <span className="preloader-frame-count text-xs tracking-[0.2em] tabular-nums" data-preloader-count="">
          0%
        </span>
      </div>
    );
  if (siteStyle === "signal")
    return (
      <div className="preloader preloader-signal" aria-hidden="true">
        <span className="font-mono text-xs tracking-[0.2em] uppercase">
          Status <span className="text-accent">{"//"}</span> Initializing
        </span>
        <span
          className="font-display text-[clamp(4rem,16vw,14rem)] leading-none tabular-nums"
          data-preloader-count="3"
        >
          000%
        </span>
        <span className="font-mono text-xs tracking-[0.2em] uppercase opacity-60">
          {brief.name}
        </span>
        <i className="preloader-bar" />
      </div>
    );
  return (
    <div className="preloader" aria-hidden="true">
      <span className="font-display text-sm tracking-[0.3em] uppercase">
        {brief.name} <span data-preloader-count="">0%</span>
      </span>
    </div>
  );
}

/** Links to /projects and /blog, but only to pages that have something on them. */
function PageLinks() {
  return (
    <>
      {getProjects().length > 0 && <Link href="/projects">All projects</Link>}
      {getPosts().length > 0 && <Link href="/blog">Blog</Link>}
    </>
  );
}

export function Menu({ sections }: { sections: Entry[] }) {
  if (siteStyle === "frame")
    return (
      <header className="chapters chrome chrome-frame">
        <a href={sections[0] ? href(sections[0]) : "#"} className="chrome-name">
          {brief.name}
        </a>
        <details className="chrome-menu">
          <summary>
            Menu
            <span className="chrome-menu-dots" aria-hidden="true">
              <i />
              <i />
              <i />
              <i />
            </span>
          </summary>
          <nav aria-label="Chapters">
            {sections.map((entry) => (
              <a key={entry.slug} href={href(entry)} data-nav={entry.slug}>
                {entry.label}
              </a>
            ))}
            <PageLinks />
          </nav>
        </details>
      </header>
    );
  if (siteStyle === "editorial")
    return (
      <header className="chapters chrome chrome-editorial">
        <a href={sections[0] ? href(sections[0]) : "#"} className="chrome-name font-display">
          {brief.name}
        </a>
        <nav className="chrome-links" aria-label="Chapters">
          {sections.map((entry, i) => (
            <a key={entry.slug} href={href(entry)} data-nav={entry.slug}>
              <span className="chrome-index">{pad(i + 1)}</span>
              {entry.label}
            </a>
          ))}
        </nav>
        <nav className="chrome-pages" aria-label="Pages">
          <PageLinks />
        </nav>
      </header>
    );
  if (siteStyle === "signal")
    return (
      <header className="chapters chrome chrome-signal">
        <a href={sections[0] ? href(sections[0]) : "#"} className="chrome-name font-display">
          {brief.name}
        </a>
        <span className="chrome-status">
          <i className="chrome-dot" aria-hidden="true" />
          {status || "Online"}
        </span>
        {clocks.length > 0 && (
          <span className="chrome-clocks">
            {clocks.map((clock) => (
              <LocalTime key={clock.zone + clock.city} city={clock.city} zone={clock.zone} />
            ))}
          </span>
        )}
        <nav className="chrome-links" aria-label="Chapters">
          {sections.map((entry) => (
            <a key={entry.slug} href={href(entry)} data-nav={entry.slug}>
              {entry.label}
            </a>
          ))}
          <PageLinks />
        </nav>
        <span className="chrome-progress tabular-nums" aria-hidden="true">
          [<span data-scroll-progress="">000</span>]
        </span>
      </header>
    );
  return (
    <nav
      className="chapters chapters-pill text-[0.65rem] tracking-[0.2em] uppercase"
      aria-label="Chapters"
    >
      {sections.map((entry) => (
        <a key={entry.slug} href={href(entry)} data-nav={entry.slug}>
          {entry.label}
        </a>
      ))}
      {getProjects().length + getPosts().length > 0 && (
        <span aria-hidden="true" className="opacity-30">
          |
        </span>
      )}
      <PageLinks />
    </nav>
  );
}
