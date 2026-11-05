import { Beat, Depth, Section, Words } from "@/stage/dom";

export default function Hero() {
  return (
    <Section slug="hero" length={2.4}>
      <Beat from={0} to={0.5} className="items-center justify-end text-center">
        <h1 className="font-display text-[clamp(3rem,11vw,10rem)] leading-[0.95] font-semibold tracking-tight">
          <Words text="One long take" />
        </h1>
        <p className="text-muted mt-4 max-w-md">Scroll, and the camera keeps moving.</p>
      </Beat>
      <Beat from={0.55} to={1} className="items-end justify-center text-right">
        <Depth speed={-0.12}>
          <h2 className="font-display max-w-lg text-[clamp(1.75rem,4vw,3.5rem)] leading-tight font-medium">
            <Words text="Every section shares one scene." />
          </h2>
        </Depth>
      </Beat>
    </Section>
  );
}
