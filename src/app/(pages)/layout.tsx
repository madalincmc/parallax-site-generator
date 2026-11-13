/* eslint-disable @next/next/no-html-link-for-pages -- see the comment on PagesLayout */
import Link from "next/link";
import { brief } from "@/site/brief";

const NAV = "hover:text-ink transition-colors";

// Plain pages with no canvas and no three.js. Going back to the home page is a full load on purpose,
// so the stage always starts from a clean page.
export default function PagesLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-svh flex-col">
      <header className="bg-bg/90 sticky top-0 z-40 border-b border-ink/10 backdrop-blur-xl">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-5 py-4 md:px-8">
          <a href="/" className="font-display text-base font-bold tracking-tight">
            {brief.name}
          </a>
          <nav className="text-muted flex gap-5 font-mono text-xs tracking-wide uppercase" aria-label="Main">
            <Link href="/projects" className={NAV}>
              Projects
            </Link>
            <Link href="/blog" className={NAV}>
              Blog
            </Link>
            <a href="/#contact" className={NAV}>
              Contact
            </a>
          </nav>
        </div>
      </header>
      <main className="mx-auto w-full max-w-5xl flex-1 px-5 py-12 md:px-8 md:py-20">{children}</main>
      <footer className="border-t border-ink/10">
        <div className="text-muted mx-auto flex max-w-5xl flex-wrap justify-between gap-x-6 gap-y-2 px-5 py-6 text-xs md:px-8">
          <p>{brief.name}</p>
          <a href="/" className={NAV}>
            Back to home
          </a>
        </div>
      </footer>
    </div>
  );
}
