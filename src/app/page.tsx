import { brief } from "@/site/brief";
import { sections } from "@/site/sections";
import { Stage } from "@/stage/Stage";

export default function Home() {
  return (
    <>
      <Stage />
      <div className="preloader" aria-hidden="true">
        <span className="font-display text-sm tracking-[0.3em] uppercase">
          {brief.name} <span data-preloader-count="">0%</span>
        </span>
      </div>
      <nav className="chapters text-[0.65rem] tracking-[0.2em] uppercase" aria-label="Chapters">
        {sections.map(({ slug, label }) => (
          <a key={slug} href={`#${slug}`} data-nav={slug}>
            {label}
          </a>
        ))}
      </nav>
      <main>
        {sections.map(({ slug, Component }) => (
          <Component key={slug} />
        ))}
      </main>
    </>
  );
}
