import { Beat, Depth, Section, Words } from "@/stage/dom";

const NUMBER = "text-accent font-mono text-xs tracking-widest";
const TITLE = "font-display mt-3 text-[clamp(2.25rem,4.6vw,5rem)] leading-[1.02] font-bold tracking-tight";
const DETAIL = "text-muted mt-4 text-sm leading-relaxed";

export default function Story() {
  return (
    <Section slug="story" length={7} label="About">
      <Beat from={0} to={0.17} fade={0.025} className="items-end justify-end text-right">
        <h2 className="font-display text-[clamp(3rem,8.5vw,9rem)] leading-[0.95] font-bold tracking-tight">
          <Words text="What I do." />
        </h2>
        <p className="text-muted mt-3 text-sm leading-relaxed">I work across four areas: engineering leadership, testing, building products and sharing what I learn.</p>
      </Beat>

      <Beat from={0.2} to={0.385} fade={0.025}className="justify-end md:justify-center">
        <Depth speed={0.05} className="md:max-w-[min(32vw,26rem)]">
          <p className={NUMBER}>01</p>
          <h3 className={TITLE}>
            <Words text="Leading engineering teams" />
          </h3>
          <p className={DETAIL}>As an engineering manager, I set priorities, remove blockers and help people grow.</p>
        </Depth>
      </Beat>

      <Beat from={0.4} to={0.585} fade={0.025}className="justify-end md:items-end md:text-right">
        <Depth speed={-0.05} className="md:max-w-[min(32vw,26rem)]">
          <p className={NUMBER}>02</p>
          <h3 className={TITLE}>
            <Words text="A background in testing" />
          </h3>
          <p className={DETAIL}>I started in testing, so I still consider how things break before how they work.</p>
        </Depth>
      </Beat>

      <Beat from={0.6} to={0.785} fade={0.025}className="justify-end">
        <div className="flex flex-col gap-x-10 md:flex-row md:items-end md:justify-between">
          <div>
            <p className={NUMBER}>03</p>
            <h3 className={TITLE}>
              <Words text="Building side projects" />
            </h3>
          </div>
          <p className={`${DETAIL} md:max-w-xs md:text-right`}>Each one starts from a problem I&rsquo;ve run into, not from a technology I wanted to try.</p>
        </div>
      </Beat>

      <Beat from={0.8} to={0.97} fade={0.025}className="justify-end md:items-end md:justify-center md:text-right">
        <Depth speed={0.06} className="md:max-w-[min(32vw,26rem)]">
          <p className={NUMBER}>04</p>
          <h3 className={TITLE}>
            <Words text="Sharing what I learn" />
          </h3>
          <p className={DETAIL}>Notes on engineering and building products, on my blog and on LinkedIn.</p>
        </Depth>
      </Beat>
    </Section>
  );
}
