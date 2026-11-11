import Link from "next/link";
import { Beat, Section, Words } from "@/stage/dom";

const PANEL = "bg-bg/80 border border-white/10 backdrop-blur-xl p-6 md:p-8";
const LABEL = "text-accent font-mono text-xs tracking-widest uppercase";
const DETAIL = "text-muted mt-3 text-sm leading-relaxed";

function Project({ name, href, children }: { name: string; href: string; children: string }) {
  return (
    <li className="border-t border-white/10 pt-3">
      <Link href={href} className="font-display text-base font-bold tracking-tight underline-offset-4 hover:underline">
        {name} <span aria-hidden>→</span>
      </Link>
      <p className="text-muted mt-1 text-sm leading-snug">{children}</p>
    </li>
  );
}

export default function Destinations() {
  return (
    <Section slug="destinations" length={4.5} label="Projects">
      {/* Card on the left: the first two summits stand off the right wing. */}
      <Beat from={0} to={0.3} className="justify-end md:justify-center">
        <div className={`${PANEL} md:max-w-[min(38vw,32rem)]`}>
          <p className={LABEL}>Destinations · 01 / 03</p>
          <h2 className="font-display mt-3 text-[clamp(2.25rem,3.4vw,3.75rem)] leading-[0.98] font-bold tracking-tight">
            <Words text="Test automation tools" />
          </h2>
          <p className={DETAIL}>Built for the discipline I started in.</p>
          <ul className="mt-5 grid gap-3">
            <Project name="Web Element Selector Generator" href="/projects/web-element-selector-generator">
              A Chrome and Firefox extension that generates CSS, XPath and Playwright locators, with ready-to-use test code.
            </Project>
            <Project name="QA Automation Playground" href="/projects/qa-automation-playground">
              A practice site for UI test automation, with deliberately faulty test users, flaky AJAX, iframes and shadow DOM.
            </Project>
          </ul>
        </div>
      </Beat>

      {/* Card low on the right: the next two summits off the left wing. */}
      <Beat from={0.34} to={0.63} className="justify-end md:items-end md:justify-start">
        <div className={`${PANEL} md:max-w-md`}>
          <p className={LABEL}>Destinations · 02 / 03</p>
          <h3 className="font-display mt-3 text-[clamp(2rem,3.4vw,3.5rem)] leading-none font-bold tracking-tight">
            <Words text="Built with Claude" />
          </h3>
          <p className={DETAIL}>I use AI in my own projects to learn where it helps and where it doesn&rsquo;t.</p>
          <ul className="mt-5 grid gap-3">
            <Project name="Video Generator" href="/projects/video-generator">
              Type a prompt, get an MP4 or a live website animation. Claude Code writes the three.js scene and checks its own
              frames.
            </Project>
            <Project name="Claude LinkedIn Studio" href="/projects/claude-linkedin-studio">
              Write, refine and publish LinkedIn posts from Claude, in your own voice.
            </Project>
          </ul>
        </div>
      </Beat>

      {/* Wide card along the bottom: the last two summits dead ahead, above it. */}
      <Beat from={0.67} to={0.95} className="justify-end">
        <div className={`${PANEL} grid gap-6 md:grid-cols-[1fr_1.4fr]`}>
          <div>
            <p className={LABEL}>Destinations · 03 / 03</p>
            <h3 className="font-display mt-3 text-[clamp(2rem,4vw,4.5rem)] leading-none font-bold tracking-tight">
              <Words text="Applications and websites" />
            </h3>
            <Link href="/projects" className="text-accent mt-4 inline-block text-sm underline-offset-4 hover:underline">
              All projects →
            </Link>
          </div>
          <ul className="grid content-end gap-3">
            <Project name="SnapBudget" href="/projects/snapbudget">
              An expense tracker that turns receipt photos into categorized expenses, with budgets, recurring bills and shared
              household totals.
            </Project>
            <Project name="Hardwick" href="/projects/hardwick">
              A portfolio website for a custom furniture workshop in Baia Mare, with content managed in Sanity.
            </Project>
          </ul>
        </div>
      </Beat>
    </Section>
  );
}
