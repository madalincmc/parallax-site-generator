import { Beat, Depth, Section, Words } from "@/stage/dom";

export default function Hero() {
  return (
    <Section slug="hero" length={3.5} label="Start">
      <Beat from={0} to={0.36} className="justify-stretch">
        <h1 className="font-display flex flex-1 flex-col pt-3 justify-between text-[clamp(4.25rem,11vw,12rem)] leading-[0.9] font-bold tracking-tight">
          <span className="self-start">
            <Words text="Madalin" />
          </span>
          <span className="self-end">
            <Words text="Cotetiu" />
          </span>
        </h1>
        <div
          className="text-muted font-mono text-xs tracking-wide uppercase [.motion_&]:absolute [.motion_&]:bottom-[clamp(9.5rem,18svh,11rem)] md:[.motion_&]:bottom-[clamp(5rem,11svh,7rem)]"
          style={{ opacity: "calc(1 - var(--p, 0) * 7)" }}
        >
          <p>Engineering manager</p>
          <p className="text-accent mt-1">Scroll</p>
        </div>
      </Beat>
      <Beat from={0.4} to={1} className="justify-end">
        <Depth speed={-0.08}>
          <h2 className="font-display max-w-5xl text-[clamp(2.25rem,5vw,5.5rem)] leading-[1.02] font-bold tracking-tight">
            <Words text="I lead teams and build things on the side." />
          </h2>
          <p className="text-muted mt-3 text-sm leading-relaxed">Engineering manager with a background in testing.</p>
        </Depth>
      </Beat>
    </Section>
  );
}
