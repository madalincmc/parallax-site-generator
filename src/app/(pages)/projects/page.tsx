import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { getProjects } from "@/lib/content";
import { brief } from "@/site/brief";
import { TerminalBar } from "../window";

export const metadata: Metadata = {
  title: `Projects | ${brief.name}`,
  description: "Side projects, newest first. Most of them started from a problem I ran into myself.",
};

export default function ProjectsPage() {
  const projects = getProjects();
  return (
    <>
      <TerminalBar path="~/portfolio/projects" command="ls --newest-first" />
      <h1 className="font-display mt-10 text-[clamp(3rem,8vw,6rem)] leading-none font-bold tracking-tight">Projects</h1>
      <p className="text-muted mt-4 max-w-xl leading-relaxed">
        Projects I&rsquo;ve built outside work. Most start from a problem I ran into myself, not from a technology I wanted
        to try.
      </p>
      <ul className="mt-12 border-b border-white/10">
        {projects.map((project) => (
          <li key={project.slug} className="border-t border-white/10">
            <Link
              href={`/projects/${project.slug}`}
              className="group grid gap-2 py-6 md:grid-cols-[8rem_1fr_13rem] md:gap-8"
            >
              <p className="text-accent font-mono text-xs tracking-widest uppercase md:pt-2">{project.category}</p>
              <div>
                <h2 className="font-display text-2xl font-bold tracking-tight underline-offset-4 group-hover:underline">
                  {project.title}
                </h2>
                <p className="text-muted mt-2 max-w-2xl text-sm leading-relaxed">{project.description}</p>
              </div>
              {project.cover && (
                <Image
                  src={project.cover.path}
                  width={project.cover.width}
                  height={project.cover.height}
                  alt=""
                  sizes="(min-width: 768px) 208px, 100vw"
                  className="h-auto w-full rounded border border-white/10 md:mt-1"
                />
              )}
            </Link>
          </li>
        ))}
      </ul>
    </>
  );
}
