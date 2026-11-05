import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { formatDate, getPosts, toHtml } from "@/lib/content";
import { brief } from "@/site/brief";
import { TerminalBar } from "../../window";

type Props = { params: Promise<{ slug: string }> };

// Only the files in content/blog become pages. Any other slug is a 404.
export const dynamicParams = false;

export function generateStaticParams() {
  return getPosts().map(({ slug }) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = getPosts().find((entry) => entry.slug === slug);
  return post ? { title: `${post.title} | ${brief.name}`, description: post.description } : {};
}

export default async function PostPage({ params }: Props) {
  const { slug } = await params;
  const post = getPosts().find((entry) => entry.slug === slug);
  if (!post) notFound();

  return (
    <article>
      <TerminalBar path="~/portfolio/blog" command={`cat ${slug}.md`} />
      <Link href="/blog" className="text-muted hover:text-ink mt-10 inline-block font-mono text-xs transition-colors">
        ← All posts
      </Link>
      <p className="text-accent mt-6 font-mono text-xs tracking-widest uppercase">
        {post.category} · {formatDate(post.date, "long")} · {post.minutes} min read
      </p>
      <h1 className="font-display mt-3 max-w-4xl text-[clamp(2.25rem,6vw,4.5rem)] leading-[1.05] font-bold tracking-tight">
        {post.title}
      </h1>
      <p className="text-muted mt-5 max-w-3xl text-lg leading-relaxed">{post.description}</p>
      {post.cover && (
        <Image
          src={post.cover.path}
          width={post.cover.width}
          height={post.cover.height}
          alt=""
          sizes="(min-width: 1024px) 960px, 100vw"
          loading="eager"
          fetchPriority="high"
          className="mt-10 h-auto w-full rounded-lg border border-white/10"
        />
      )}
      <div className="prose mt-12" dangerouslySetInnerHTML={{ __html: toHtml(post.body) }} />
    </article>
  );
}
