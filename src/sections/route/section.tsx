import { Beat, Depth, Section, Words } from "@/stage/dom";

const NUMBER = "on-sky text-ink font-mono text-xs tracking-widest";
const TITLE = "on-sky font-display mt-3 text-[clamp(2.25rem,4.6vw,5rem)] leading-[1.02] font-bold tracking-tight";
const DETAIL = "on-sky text-ink/85 mt-4 text-sm leading-relaxed";

export default function Route() {
  return (
    <Section slug="route" length={7} label="Route">
      {/* Corners, top right: the flagged summits stand ahead below it. */}
      <Beat from={0} to={0.15} fade={0.025} className="items-end justify-start text-right">
        <h2 className="on-sky font-display text-[clamp(3rem,8.5vw,9rem)] leading-[0.95] font-bold tracking-tight">
          <Words text="The route so far." />
        </h2>
        <p className="on-sky text-ink/85 mt-3 max-w-md text-sm leading-relaxed">
          Four summits at Cognizant, from testing to engineering management.
        </p>
      </Beat>

      {/* Caption, low left: the balloon passes the first summit side-on above it. */}
      <Beat from={0.19} to={0.35} fade={0.025} className="justify-end">
        <Depth speed={0.05} className="md:max-w-[min(34vw,28rem)]">
          <p className={NUMBER}>01 · 2013</p>
          <h3 className={TITLE}>
            <Words text="QA Software Engineer" />
          </h3>
          <p className={DETAIL}>Test planning and test design. I started in testing, so I still consider how things break before how they work.</p>
        </Depth>
      </Beat>

      {/* Right side: the balloon seen from high behind on the left. */}
      <Beat from={0.39} to={0.55} fade={0.025} className="justify-end md:items-end md:justify-center md:text-right">
        <Depth speed={-0.05} className="md:max-w-[min(32vw,26rem)]">
          <p className={NUMBER}>02 · 2018</p>
          <h3 className={TITLE}>
            <Words text="QA Team Lead" />
          </h3>
          <p className={DETAIL}>Seven years leading QA teams: people management, priorities, and a team culture where people grow.</p>
        </Depth>
      </Beat>

      {/* A row along the bottom: title left, detail right, the balloon coming toward the camera above. */}
      <Beat from={0.59} to={0.75} fade={0.025} className="justify-end">
        <div className="flex flex-col gap-x-10 md:flex-row md:items-end md:justify-between">
          <div>
            <p className={NUMBER}>03 · 2020</p>
            <h3 className={TITLE}>
              <Words text="QA Community Lead" />
            </h3>
          </div>
          <p className={`${DETAIL} md:max-w-xs md:text-right`}>
            For three years I also led the QA community: knowledge sharing and professional growth across the organization.
          </p>
        </div>
      </Beat>

      {/* Right, centred: from close behind, the last summit ahead. */}
      <Beat from={0.79} to={0.95} fade={0.025} className="justify-end md:items-end md:justify-center md:text-right">
        <Depth speed={0.06} className="md:max-w-[min(32vw,26rem)]">
          <p className={NUMBER}>04 · 2026</p>
          <h3 className={TITLE}>
            <Words text="Engineering Manager" />
          </h3>
          <p className={DETAIL}>Since June 2026. I set priorities, remove blockers and help people grow.</p>
        </Depth>
      </Beat>
    </Section>
  );
}
