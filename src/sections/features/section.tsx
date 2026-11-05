import Link from "next/link";
import { Beat, Section, Words } from "@/stage/dom";

const PANEL = "bg-bg/80 border border-white/10 backdrop-blur-xl p-6 md:p-8";
const LABEL = "text-accent font-mono text-xs tracking-widest uppercase";
const DETAIL = "text-muted mt-3 text-sm leading-relaxed";

function Project({ name, href, children }: { name: string; href: string; children: string }) {
  return (
    <li className="border-t border-white/10 pt-3">
      <Link
        href={href}
        className="font-display text-base font-bold tracking-tight underline-offset-4 hover:underline"
      >
        {name} <span aria-hidden>→</span>
      </Link>
      <p className="text-muted mt-1 text-sm leading-snug">{children}</p>
    </li>
  );
}

export default function Features() {
  return (
    <Section slug="features" length={4.5} label="Projects">
      <Beat from={0} to={0.3} className="justify-end md:justify-center">
        <div className={`${PANEL} md:max-w-[min(38vw,32rem)]`}>
          <h2 className="font-display text-[clamp(2.5rem,4.6vw,5rem)] leading-[0.98] font-bold tracking-tight">
            <Words text="Tools for testers" />
          </h2>
          <p className={DETAIL}>For the job I started in.</p>
          <ul className="mt-5 grid gap-3">
            <Project
              name="Web Element Selector Generator"
              href="/projects/web-element-selector-generator"
            >
              Chrome and Firefox extension. CSS, XPath and Playwright locators, plus test code ready to paste.
            </Project>
            <Project name="QA Automation Playground" href="/projects/qa-automation-playground">
              A practice shop with test users that misbehave on purpose, flaky AJAX, iframes and shadow DOM.
            </Project>
          </ul>
        </div>
      </Beat>

      <Beat from={0.34} to={0.63} className="justify-end md:items-end md:justify-start">
        <div className={`${PANEL} md:max-w-md`}>
          <p className={LABEL}>Curious about AI</p>
          <h3 className="font-display mt-3 text-[clamp(2rem,3.4vw,3.5rem)] leading-none font-bold tracking-tight">
            <Words text="Built with Claude" />
          </h3>
          <p className={DETAIL}>I use AI in my own projects to see where it actually helps and where it doesn&rsquo;t.</p>
          <ul className="mt-5 grid gap-3">
            <Project name="Video Generator" href="/projects/video-generator">
              Type a prompt, get an MP4 or a live website animation. Claude Code writes the three.js scene and checks its
              own frames.
            </Project>
            <Project name="Claude LinkedIn Studio" href="/projects/claude-linkedin-studio">
              Write, polish and publish LinkedIn posts from Claude, in your own voice.
            </Project>
          </ul>
        </div>
      </Beat>

      <Beat from={0.67} to={0.95} className="justify-end">
        <div className={`${PANEL} grid gap-6 md:grid-cols-[1fr_1.4fr]`}>
          <div>
            <p className={LABEL}>Live</p>
            <h3 className="font-display mt-3 text-[clamp(2rem,4vw,4.5rem)] leading-none font-bold tracking-tight">
              <Words text="An app and a website" />
            </h3>
            <Link href="/projects" className="text-accent mt-4 inline-block text-sm underline-offset-4 hover:underline">
              All projects →
            </Link>
          </div>
          <ul className="grid content-end gap-3">
            <Project name="SnapBudget" href="/projects/snapbudget">
              Photograph a receipt and OCR turns it into a categorized expense, with budgets, recurring bills and shared
              household totals.
            </Project>
            <Project name="Hardwick" href="/projects/hardwick">
              A portfolio site for a custom furniture workshop in Baia Mare, with all its content managed in Sanity.
            </Project>
          </ul>
        </div>
      </Beat>
    </Section>
  );
}
