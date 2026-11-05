import { Beat, Depth, Section, Words } from "@/stage/dom";

export default function Statement() {
  return (
    <Section slug="statement" length={2.5} tone="light" label="On the side">
      <Beat from={0} to={0.95} className="justify-end">
        {/* The ghost word and the running line only exist where scrolling moves them. */}
        <Depth speed={0.3} className="absolute top-[30svh] left-[4vw] hidden [.motion_&]:block">
          <div aria-hidden data-bleed className="font-display text-[clamp(8rem,30vw,32rem)] leading-none whitespace-nowrap opacity-[0.05]">
            on the side
          </div>
        </Depth>
        <Depth speed={-0.1} className="absolute inset-x-0 top-[9svh] hidden [.motion_&]:block">
          <div
            aria-hidden
            data-bleed
            className="font-display w-max pl-[5vw] text-[clamp(4rem,16vw,16rem)] leading-none font-bold tracking-tight whitespace-nowrap"
            style={{ transform: "translateX(calc(var(--p) * -78%))" }}
          >
            It usually starts with a problem I ran into.
          </div>
        </Depth>
        <h2 className="font-display max-w-md self-end text-right text-[clamp(1.5rem,2.4vw,2.5rem)] leading-tight font-bold tracking-tight [.motion_&]:text-[clamp(1.25rem,1.8vw,1.75rem)]">
          <Words text="It usually starts with a problem I ran into." />
        </h2>
      </Beat>
    </Section>
  );
}
