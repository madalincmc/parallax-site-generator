import { Beat, Depth, Section, Words } from "@/stage/dom";

export default function Hero() {
  return (
    <Section slug="hero" length={3} label="Departure">
      {/* Gap: the name split to opposite corners, the plane flying between the two words. */}
      <Beat from={0} to={0.36} className="justify-stretch">
        <h1 className="on-sky font-display flex flex-1 flex-col justify-between pt-3 text-[clamp(4.25rem,11vw,12rem)] leading-[0.9] font-bold tracking-tight">
          <span className="self-start">
            <Words text="Madalin" />
          </span>
          <span className="self-end">
            <Words text="Cotetiu" />
          </span>
        </h1>
        <div
          className="on-sky font-mono text-xs tracking-wide uppercase [.motion_&]:absolute [.motion_&]:bottom-[clamp(9.5rem,18svh,11rem)] md:[.motion_&]:bottom-[clamp(5rem,11svh,7rem)]"
          style={{ opacity: "calc(1 - var(--p, 0) * 7)" }}
        >
          <p>Engineering Manager · Cognizant</p>
          <p className="text-muted mt-1">Baia Mare, Romania</p>
          <p className="text-accent mt-1">Scroll to depart ↓</p>
        </div>
      </Beat>

      {/* Caption: one line low on the left as the camera swings round behind the plane. */}
      <Beat from={0.42} to={0.95} className="justify-end">
        <Depth speed={-0.08}>
          <h2 className="on-sky font-display max-w-5xl text-[clamp(2.25rem,5vw,5.5rem)] leading-[1.02] font-bold tracking-tight">
            <Words text="I lead teams and build things on the side." />
          </h2>
          <p className="on-sky text-ink/85 mt-3 text-sm leading-relaxed">Engineering manager with a background in testing.</p>
        </Depth>
      </Beat>
    </Section>
  );
}
