import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { formatDate, getProjects, toHtml } from "@/lib/content";
import { brief } from "@/site/brief";
import { TerminalBar } from "../../window";

type Props = { params: Promise<{ slug: string }> };

// Only the files in content/projects become pages. Any other slug is a 404.
export const dynamicParams = false;

export function generateStaticParams() {
  return getProjects().map(({ slug }) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const project = getProjects().find((entry) => entry.slug === slug);
  return project ? { title: `${project.title} | ${brief.name}`, description: project.description } : {};
}

const LINK = "rounded-full border border-white/20 px-4 py-2 text-sm hover:border-white/60 transition-colors";

export default async function ProjectPage({ params }: Props) {
  const { slug } = await params;
  const projects = getProjects();
  const index = projects.findIndex((entry) => entry.slug === slug);
  if (index === -1) notFound();
  const project = projects[index];
  const next = projects[(index + 1) % projects.length];
  const links = [
    { href: project.liveUrl, label: project.liveLabel ?? "Live site" },
    { href: project.firefoxUrl, label: "Firefox Add-ons" },
    { href: project.githubUrl, label: "Source on GitHub" },
  ].filter((link) => link.href);

  return (
    <article>
      <TerminalBar path="~/portfolio/projects" command={`cat ${slug}.md`} />
      <Link href="/projects" className="text-muted hover:text-ink mt-10 inline-block font-mono text-xs transition-colors">
        ← All projects
      </Link>
      <p className="text-accent mt-6 font-mono text-xs tracking-widest uppercase">
        {project.category} · {formatDate(project.date)}
      </p>
      <h1 className="font-display mt-3 text-[clamp(2.5rem,7vw,5rem)] leading-[1.02] font-bold tracking-tight">
        {project.title}
      </h1>
      <p className="text-muted mt-5 max-w-3xl text-lg leading-relaxed">{project.description}</p>
      {links.length > 0 && (
        <div className="mt-6 flex flex-wrap gap-3">
          {links.map((link) => (
            <a key={link.href} href={link.href} target="_blank" rel="noopener noreferrer" className={LINK}>
              {link.label} <span aria-hidden>↗</span>
            </a>
          ))}
        </div>
      )}
      {project.cover && (
        <Image
          src={project.cover.path}
          width={project.cover.width}
          height={project.cover.height}
          alt=""
          sizes="(min-width: 1024px) 960px, 100vw"
          loading="eager"
          fetchPriority="high"
          className="mt-10 h-auto w-full rounded-lg border border-white/10"
        />
      )}
      <div className="prose mt-12" dangerouslySetInnerHTML={{ __html: toHtml(project.body) }} />
      {project.gallery.length > 0 && (
        <section aria-label="Screenshots" className="mt-14 grid gap-8 md:grid-cols-2">
          {project.gallery.map((picture) => (
            <figure key={picture.path}>
              <Image
                src={picture.path}
                width={picture.width}
                height={picture.height}
                alt={picture.alt ?? ""}
                sizes="(min-width: 768px) 472px, 100vw"
                className="h-auto w-full rounded-lg border border-white/10"
              />
              <figcaption className="text-muted mt-2 text-sm leading-snug">{picture.alt}</figcaption>
            </figure>
          ))}
        </section>
      )}
      {project.technologies.length > 0 && (
        <ul className="text-muted mt-12 flex max-w-[44rem] flex-wrap gap-2 font-mono text-xs" aria-label="Technologies">
          {project.technologies.map((technology) => (
            <li key={technology} className="rounded border border-white/10 px-2 py-1">
              {technology}
            </li>
          ))}
        </ul>
      )}
      {next.slug !== slug && (
        <Link href={`/projects/${next.slug}`} className="group mt-16 block border-t border-white/10 pt-6">
          <p className="text-muted font-mono text-xs tracking-widest uppercase">Next project</p>
          <p className="font-display mt-2 text-3xl font-bold tracking-tight underline-offset-4 group-hover:underline">
            {next.title} →
          </p>
        </Link>
      )}
    </article>
  );
}
