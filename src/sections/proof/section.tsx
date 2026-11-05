import { Beat, Depth, Section, Words } from "@/stage/dom";

const FIGURE = "font-display text-[clamp(7rem,20vw,20rem)] leading-[0.8] tracking-tight";
const LABEL = "text-muted text-xs tracking-widest uppercase";

export default function Proof() {
  return (
    <Section slug="proof" length={4} label="Writing">
      <Beat from={0} to={0.3} className="justify-end md:items-end md:justify-center">
        <div className="md:max-w-[min(40vw,34rem)]">
          <h2 className="font-display text-[clamp(2.5rem,4.6vw,5rem)] leading-none font-normal tracking-tight">
            <Words text="Notes & writing" />
          </h2>
          <div className="mt-6 flex items-end gap-6">
            <p className={FIGURE}>3</p>
            <p className={`${LABEL} pb-2`}>Subjects I write about</p>
          </div>
          <ul className="mt-6 grid gap-2 text-sm">
            <li>Leading engineering teams</li>
            <li>Building test automation</li>
            <li>Shipping side projects</li>
          </ul>
        </div>
      </Beat>

      <Beat from={0.36} to={0.64} className="justify-end md:items-end">
        <div className="md:text-right">
          <p className={FIGURE}>4</p>
          <p className={`${LABEL} mt-4`}>Kinds of thing built outside work</p>
          <Depth speed={-0.05}>
            <p className="font-display mt-4 text-[clamp(1.5rem,2.6vw,2.75rem)] leading-tight">
              Testers&rsquo; tools, developers&rsquo; tools, apps, websites.
            </p>
          </Depth>
        </div>
      </Beat>

      <Beat from={0.7} to={1} className="justify-end md:justify-center">
        <div className="grid gap-8 md:max-w-[min(36vw,30rem)]">
          <div>
            <p className={LABEL}>Latest post</p>
            <h3 className="font-display mt-3 text-[clamp(1.75rem,3vw,3rem)] leading-tight font-normal tracking-tight">
              [placeholder: latest post title]
            </h3>
          </div>
          <Depth speed={0.06}>
            <blockquote className="border-accent border-l-2 pl-4 text-sm leading-relaxed">
              <p>[placeholder: a quote from someone you&rsquo;ve worked with]</p>
              <footer className="text-muted mt-2">[placeholder: their name and role]</footer>
            </blockquote>
          </Depth>
        </div>
      </Beat>
    </Section>
  );
}
