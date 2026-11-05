// The projects and posts behind /projects and /blog. Each is a Markdown file in content/, read at build
// time, so these pages ship as static HTML. A new site starts with content/ empty, and the lists stay empty.
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import matter from "gray-matter";
import { marked } from "marked";

const ROOT = join(process.cwd(), "content");

export type Picture = { path: string; alt?: string; width: number; height: number };
type Entry = {
  slug: string;
  title: string;
  description: string;
  category: string;
  date: Date;
  body: string;
  cover?: Picture;
};
export type Project = Entry & {
  technologies: string[];
  liveUrl?: string;
  liveLabel?: string;
  githubUrl?: string;
  firefoxUrl?: string;
  gallery: Picture[];
};
export type Post = Entry & { tags: string[]; minutes: number };

function read(folder: string) {
  const dir = join(ROOT, folder);
  if (!existsSync(dir)) return [];
  return readdirSync(dir)
    .filter((name) => name.endsWith(".md"))
    .map((name) => {
      const { data, content } = matter(readFileSync(join(dir, name), "utf8"));
      return {
        data,
        entry: {
          slug: name.replace(/\.md$/, ""),
          title: String(data.title),
          description: String(data.description),
          category: String(data.category),
          date: new Date(data.publishedAt),
          body: content,
          cover: data.coverImage,
        },
      };
    })
    .filter(({ data }) => !data.draft)
    .sort((a, b) => b.entry.date.getTime() - a.entry.date.getTime());
}

export function getProjects(): Project[] {
  return read("projects").map(({ data, entry }) => ({
    ...entry,
    technologies: data.technologies ?? [],
    liveUrl: data.liveUrl,
    liveLabel: data.liveLabel,
    githubUrl: data.githubUrl,
    firefoxUrl: data.firefoxUrl,
    gallery: data.gallery ?? [],
  }));
}

export function getPosts(): Post[] {
  return read("blog").map(({ data, entry }) => ({
    ...entry,
    tags: data.tags ?? [],
    minutes: Math.max(1, Math.round(entry.body.split(/\s+/).length / 260)),
  }));
}

/** Markdown to HTML. This only ever runs on the files in content/, never on anything a visitor sends. */
export function toHtml(markdown: string) {
  const html = marked.parse(markdown, { async: false });
  return html
    .replaceAll('<a href="http', '<a target="_blank" rel="noopener noreferrer" href="http')
    .replaceAll("<img ", '<img loading="lazy" ');
}

export const formatDate = (date: Date, month: "short" | "long" = "short") =>
  date.toLocaleDateString("en-US", { month, day: "numeric", year: "numeric", timeZone: "UTC" });
