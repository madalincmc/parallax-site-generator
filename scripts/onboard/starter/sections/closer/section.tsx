import { Beat, Section, Words } from "@/stage/dom";

export default function Closer() {
  return (
    <Section slug="closer" length={2}>
      <Beat from={0.2} to={1} className="items-center justify-center text-center">
        <h2 className="font-display text-[clamp(2.25rem,7vw,6rem)] leading-none font-semibold tracking-tight">
          <Words text="The end of the take." />
        </h2>
        <a href="#hero" className="bg-accent text-bg mt-8 rounded-full px-6 py-3 text-sm font-medium">
          Back to the start
        </a>
      </Beat>
    </Section>
  );
}
