import { Beat, Depth, Section, Words } from "@/stage/dom";

const NUMBER = "text-accent font-mono text-xs tracking-widest";
const TITLE = "font-display mt-3 text-[clamp(2.25rem,4.6vw,5rem)] leading-[1.02] font-bold tracking-tight";
const DETAIL = "text-muted mt-4 text-sm leading-relaxed";

export default function Story() {
  return (
    <Section slug="story" length={7} label="Inside">
      <Beat from={0} to={0.17} fade={0.025} className="items-end justify-end text-right">
        <h2 className="font-display text-[clamp(3rem,8.5vw,9rem)] leading-[0.95] font-bold tracking-tight">
          <Words text="Under the prompt." />
        </h2>
        <p className="text-muted mt-3 text-sm leading-relaxed">Four things run in this window.</p>
      </Beat>

      <Beat from={0.2} to={0.385} fade={0.025}className="justify-end md:justify-center">
        <Depth speed={0.05} className="md:max-w-[min(32vw,26rem)]">
          <p className={NUMBER}>01</p>
          <h3 className={TITLE}>
            <Words text="Leading engineering teams" />
          </h3>
          <p className={DETAIL}>My day job: setting priorities, removing blockers and helping people grow.</p>
        </Depth>
      </Beat>

      <Beat from={0.4} to={0.585} fade={0.025}className="justify-end md:items-end md:text-right">
        <Depth speed={-0.05} className="md:max-w-[min(32vw,26rem)]">
          <p className={NUMBER}>02</p>
          <h3 className={TITLE}>
            <Words text="Thinking like a tester" />
          </h3>
          <p className={DETAIL}>I started in testing, so I still think about how things break before I think about how they work.</p>
        </Depth>
      </Beat>

      <Beat from={0.6} to={0.785} fade={0.025}className="justify-end">
        <div className="flex flex-col gap-x-10 md:flex-row md:items-end md:justify-between">
          <div>
            <p className={NUMBER}>03</p>
            <h3 className={TITLE}>
              <Words text="Shipping side projects" />
            </h3>
          </div>
          <p className={`${DETAIL} md:max-w-xs md:text-right`}>They start from problems I&rsquo;ve run into, not from a technology I wanted to try.</p>
        </div>
      </Beat>

      <Beat from={0.8} to={0.97} fade={0.025}className="justify-end md:items-end md:justify-center md:text-right">
        <Depth speed={0.06} className="md:max-w-[min(32vw,26rem)]">
          <p className={NUMBER}>04</p>
          <h3 className={TITLE}>
            <Words text="Writing it down" />
          </h3>
          <p className={DETAIL}>What I learn along the way, on my blog and on LinkedIn.</p>
        </Depth>
      </Beat>
    </Section>
  );
}
