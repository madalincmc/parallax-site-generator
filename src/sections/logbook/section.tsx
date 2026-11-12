import Link from "next/link";
import { formatDate, getPosts, getProjects } from "@/lib/content";
import { Beat, Depth, Section, Words } from "@/stage/dom";

const LABEL = "font-mono text-xs tracking-widest uppercase";
const FIGURE = "on-sky font-display text-[clamp(3.5rem,9vw,9rem)] leading-[0.85] font-bold tracking-tight";

export default function Logbook() {
  const latest = getPosts()[0];
  const figures = [
    { value: "10+", unit: "years", label: "in QA engineering" },
    { value: "7+", unit: "years", label: "leading teams" },
    { value: String(getProjects().length), unit: "side projects", label: "built and shipped" },
  ];
  return (
    <Section slug="logbook" length={3} label="Logbook">
      {/* Spec: three figures in a row low on the left, the balloon a small shape against the sunset. */}
      <Beat from={0.06} to={0.46} className="justify-end">
        <h2 className={`${LABEL} on-sky text-ink`}>Logbook</h2>
        <ul className="mt-5 grid max-w-3xl grid-cols-3 gap-4 md:gap-10">
          {figures.map((f) => (
            <li key={f.label} className="border-t border-white/25 pt-4">
              <p className={FIGURE}>
                <Words text={f.value} />
              </p>
              <p className={`${LABEL} on-sky text-ink mt-3`}>{f.unit}</p>
              <p className="on-sky text-ink/85 mt-1 text-sm leading-snug">{f.label}</p>
            </li>
          ))}
        </ul>
      </Beat>

      {/* A card on the right for the latest post, with the credentials under it. */}
      <Beat from={0.54} to={0.95} className="justify-end md:items-end md:justify-center">
        <Depth speed={0.04} className="bg-bg/80 border border-white/10 p-6 backdrop-blur-xl md:max-w-[min(38vw,32rem)] md:p-8">
          <p className={`${LABEL} text-accent`}>Latest post</p>
          <h3 className="font-display mt-3 text-[clamp(1.75rem,3vw,3rem)] leading-tight font-bold tracking-tight">
            <Link href={`/blog/${latest.slug}`} className="underline-offset-4 hover:underline">
              {latest.title}
            </Link>
          </h3>
          <p className="text-muted mt-4 text-sm leading-relaxed">{latest.description}</p>
          <p className={`${LABEL} text-muted mt-4`}>
            {formatDate(latest.date)} · {latest.minutes} min read
          </p>
          <Link href="/blog" className="text-accent mt-4 inline-block text-sm underline-offset-4 hover:underline">
            All posts →
          </Link>
          <p className="text-muted mt-6 border-t border-white/10 pt-4 text-xs leading-relaxed">
            Microsoft Certified: Azure Fundamentals · AI For Everyone, DeepLearning.AI · Technical University of Cluj-Napoca
          </p>
        </Depth>
      </Beat>
    </Section>
  );
}
