import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { formatDate, getPosts } from "@/lib/content";
import { brief } from "@/site/brief";
import { TerminalBar } from "../window";

export const metadata: Metadata = {
  title: `Blog | ${brief.name}`,
  description: "Notes on engineering, testing and building products.",
};

export default function BlogPage() {
  const posts = getPosts();
  return (
    <>
      <TerminalBar path="~/portfolio/blog" command="ls --newest-first" />
      <h1 className="font-display mt-10 text-[clamp(3rem,8vw,6rem)] leading-none font-bold tracking-tight">Blog</h1>
      <p className="text-muted mt-4 max-w-xl leading-relaxed">Notes on engineering, testing and building products.</p>
      <ul className="mt-12 border-b border-white/10">
        {posts.map((post) => (
          <li key={post.slug} className="border-t border-white/10">
            <Link href={`/blog/${post.slug}`} className="group grid gap-2 py-6 md:grid-cols-[8rem_1fr_13rem] md:gap-8">
              <time dateTime={post.date.toISOString()} className="text-muted font-mono text-xs md:pt-2">
                {formatDate(post.date)}
              </time>
              <div>
                <h2 className="font-display text-2xl font-bold tracking-tight underline-offset-4 group-hover:underline">
                  {post.title}
                </h2>
                <p className="text-muted mt-2 max-w-2xl text-sm leading-relaxed">{post.description}</p>
                <p className="text-accent mt-3 font-mono text-xs tracking-widest uppercase">
                  {post.category} · {post.minutes} min read
                </p>
              </div>
              {post.cover && (
                <Image
                  src={post.cover.path}
                  width={post.cover.width}
                  height={post.cover.height}
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
