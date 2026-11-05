import Link from "next/link";
import { Beat, Section, Words } from "@/stage/dom";

const LINK = "underline-offset-4 hover:underline";

export default function Closer() {
  return (
    <>
      <Section slug="closer" length={3.5} label="Contact">
        <Beat from={0.36} to={1} className="items-center text-center">
          <h2 className="font-display text-[clamp(3.5rem,10vw,10rem)] leading-[0.92] font-bold tracking-tight">
            <Words text="Get in touch." />
          </h2>
          <p className="text-muted mt-4 max-w-lg text-sm leading-relaxed">
            For questions, feedback on a project, or a conversation about engineering, testing or AI, email or LinkedIn
          works best.
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-3">
            <a
              href="mailto:cotetiumadalin@gmail.com"
              className="bg-accent text-bg rounded-full px-7 py-3.5 text-sm font-semibold"
            >
              cotetiumadalin@gmail.com
            </a>
            <a
              href="https://www.linkedin.com/in/madalin-cotetiu-a8b1189b/"
              target="_blank"
              rel="noopener noreferrer"
              className={`${LINK} text-sm`}
            >
              LinkedIn
            </a>
            <a
              href="https://github.com/madalincmc"
              target="_blank"
              rel="noopener noreferrer"
              className={`${LINK} text-sm`}
            >
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
