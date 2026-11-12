import Link from "next/link";
import { Beat, Section, Words } from "@/stage/dom";

const LINK = "underline-offset-4 hover:underline";

export default function Closer() {
  return (
    <>
      <Section slug="closer" length={3.5} label="Contact">
        {/* Caption: a short line low on the left while the balloon comes down through the last of the mist. */}
        <Beat from={0.08} to={0.34} className="justify-end">
          <p className="on-sky text-accent font-mono text-xs tracking-widest uppercase">Coming down</p>
          <p className="on-sky font-display mt-3 text-[clamp(2.25rem,5vw,5.5rem)] leading-[1.02] font-bold tracking-tight">Landing by lantern light.</p>
        </Beat>

        {/* Crown: the call to action over the night sky, the glowing balloons and the village below it. */}
        <Beat from={0.46} to={1} className="items-center text-center">
          <h2 className="on-sky font-display text-[clamp(3.5rem,10vw,10rem)] leading-[0.92] font-bold tracking-tight">
            <Words text="Get in touch." />
          </h2>
          <p className="on-sky text-ink/85 mt-4 max-w-lg text-sm leading-relaxed">
            For questions, feedback on a project, or a conversation about engineering, testing or AI, email or LinkedIn works
            best.
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-3">
            <a href="mailto:cotetiumadalin@gmail.com" className="bg-accent text-bg rounded-full px-7 py-3.5 text-sm font-semibold">
              cotetiumadalin@gmail.com
            </a>
            <a href="https://www.linkedin.com/in/madalin-cotetiu-a8b1189b/" target="_blank" rel="noopener noreferrer" className={`${LINK} on-sky text-sm`}>
              LinkedIn
            </a>
            <a href="https://github.com/madalincmc" target="_blank" rel="noopener noreferrer" className={`${LINK} on-sky text-sm`}>
              GitHub
            </a>
          </div>
          <footer className="text-muted mt-auto flex w-full flex-wrap justify-between gap-x-6 gap-y-1 text-xs">
            <p>Madalin Cotetiu</p>
            <nav className="flex gap-4" aria-label="Footer">
              <Link href="/projects" className={LINK}>
                Projects
              </Link>
              <Link href="/blog" className={LINK}>
                Blog
              </Link>
              <a href="#hero" className={LINK}>
                Back to the top
              </a>
            </nav>
          </footer>
        </Beat>
      </Section>
      {/* The contact links only appear partway through this section, so "Contact" links land here, at 70%. */}
      <div aria-hidden className="relative h-0">
        <span id="contact" className="absolute top-[-100svh] [.motion_&]:top-[-175svh]" />
      </div>
    </>
  );
}
