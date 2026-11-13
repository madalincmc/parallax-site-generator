// Which of the site styles this site uses. The style decides the page chrome (menu, preloader) and,
// through .claude/skills/site/styles/<style>.md, how every section is designed.
// Sites made before styles existed have no `brief.style`, and are Film.
import { brief } from "@/site/brief";

export const SITE_STYLES = ["film", "editorial", "signal"] as const;
export type SiteStyle = (typeof SITE_STYLES)[number];

type BriefExtras = {
  style?: string;
  /** Local clocks for the Signal style's top bar, e.g. [{ city: "Cluj", zone: "Europe/Bucharest" }]. */
  clocks?: { city: string; zone: string }[];
  /** A short status line for the Signal style's top bar, e.g. "Available for Q1". */
  status?: string;
};

const extras = brief as typeof brief & BriefExtras;

export const siteStyle: SiteStyle = (SITE_STYLES as readonly string[]).includes(extras.style ?? "")
  ? (extras.style as SiteStyle)
  : "film";

export const clocks = extras.clocks ?? [];
export const status = extras.status ?? "";
