import { Beat, Section, Words } from "@/stage/dom";

const PANEL = "bg-bg/80 border border-white/10 backdrop-blur-xl p-6 md:p-8";
const LABEL = "text-accent text-xs tracking-widest uppercase";
const PROJECT = "border-t border-white/10 pt-3 text-sm";

export default function Features() {
  return (
    <Section slug="features" length={4.5} label="Projects">
      <Beat from={0} to={0.3}className="justify-end md:justify-center">
        <div className={`${PANEL} md:max-w-[min(38vw,32rem)]`}>
          <h2 className="font-display text-[clamp(2.75rem,5.5vw,6rem)] leading-[0.98] font-normal tracking-tight">
            <Words text="Tools for testers" />
          </h2>
          <p className="text-muted mt-4 text-sm leading-relaxed">
            The first shelf of things I built outside work.
          </p>
          <p className={`${PROJECT} mt-6`}>[placeholder: a tool for testers, and one line on what it does]</p>
        </div>
      </Beat>

      <Beat from={0.34} to={0.63}className="justify-end md:items-end md:justify-start">
        <div className={`${PANEL} md:max-w-sm`}>
          <p className={LABEL}>Second shelf</p>
          <h3 className="font-display mt-3 text-[clamp(2rem,3.4vw,3.5rem)] leading-none font-normal tracking-tight">
            <Words text="Tools for developers" />
          </h3>
          <p className={`${PROJECT} mt-6`}>[placeholder: a tool for developers, and one line on what it does]</p>
        </div>
      </Beat>

      <Beat from={0.67} to={1}className="justify-end">
        <div className={`${PANEL} grid gap-6 md:grid-cols-[1fr_1fr]`}>
          <div>
            <p className={LABEL}>Everything else</p>
            <h3 className="font-display mt-3 text-[clamp(2rem,4vw,4.5rem)] leading-none font-normal tracking-tight">
              <Words text="A few apps and websites" />
            </h3>
          </div>
          <ul className="grid content-end gap-3">
            <li className={PROJECT}>[placeholder: an app, and one line on what it does]</li>
            <li className={PROJECT}>[placeholder: a website, and one line on what it does]</li>
          </ul>
        </div>
      </Beat>
    </Section>
  );
}
