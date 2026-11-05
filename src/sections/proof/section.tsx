import Link from "next/link";
import { formatDate, getPosts, getProjects } from "@/lib/content";
import { Beat, Depth, Section, Words } from "@/stage/dom";

const FIGURE = "font-display font-bold text-[clamp(7rem,20vw,20rem)] leading-[0.8] tracking-tight";
const STAT = "font-display font-bold text-[clamp(3rem,7vw,7rem)] leading-none tracking-tight";
const LABEL = "text-muted font-mono text-xs tracking-widest uppercase";

export default function Proof() {
  const latest = getPosts()[0];
  return (
    <Section slug="proof" length={4} label="Proof">
      <Beat from={0} to={0.3} className="justify-end md:items-end md:justify-center">
        <div className="md:max-w-[min(40vw,34rem)]">
          <p className={FIGURE}>{getProjects().length}</p>
          <h2 className="font-display mt-6 text-[clamp(2.25rem,4vw,4.5rem)] leading-none font-bold tracking-tight">
            <Words text="Side projects so far" />
          </h2>
          <p className="text-muted mt-4 text-sm leading-relaxed">
            They usually start from a problem I ran into myself, not from a technology I wanted to try.
          </p>
        </div>
      </Beat>

      <Beat from={0.36} to={0.64} className="justify-end md:items-end md:justify-center">
        <div className="md:max-w-[min(38vw,30rem)]">
          <p className={LABEL}>The tester in me, in numbers</p>
          <div className="mt-5 grid gap-5">
            <div>
              <p className={STAT}>8</p>
              <p className="mt-2 text-sm leading-snug">locator strategies per element in the selector extension</p>
            </div>
            <div>
              <p className={STAT}>~280</p>
              <p className="mt-2 text-sm leading-snug">test hooks in the QA playground, with some left out on purpose</p>
            </div>
            <div>
              <p className={STAT}>20%</p>
              <p className="mt-2 text-sm leading-snug">of its simulated AJAX requests fail, so your tests have to cope</p>
            </div>
          </div>
        </div>
      </Beat>

      <Beat from={0.7} to={1} className="justify-end md:justify-center">
        <Depth speed={0.04} className="md:max-w-[min(36vw,30rem)]">
          <p className={LABEL}>Latest post</p>
          <h3 className="font-display mt-3 text-[clamp(1.75rem,3vw,3rem)] leading-tight font-bold tracking-tight">
            <Link href={`/blog/${latest.slug}`} className="underline-offset-4 hover:underline">
              {latest.title}
            </Link>
          </h3>
          <p className="text-muted mt-4 text-sm leading-relaxed">{latest.description}</p>
          <p className={`${LABEL} mt-4`}>
            {formatDate(latest.date)} · {latest.minutes} min read
          </p>
          <Link href="/blog" className="text-accent mt-4 inline-block text-sm underline-offset-4 hover:underline">
            All posts →
          </Link>
        </Depth>
      </Beat>
    </Section>
  );
}
