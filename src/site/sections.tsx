// The page, top to bottom. Its order is the site's order. Every slug needs a matching act in acts.ts.
import type { ComponentType } from "react";
import Closer from "@/sections/closer/section";
import Destinations from "@/sections/destinations/section";
import Hero from "@/sections/hero/section";
import Logbook from "@/sections/logbook/section";
import Route from "@/sections/route/section";
import Statement from "@/sections/statement/section";

export const sections: { slug: string; label: string; anchor?: string; Component: ComponentType }[] = [
  { slug: "hero", label: "Lift-off", Component: Hero },
  { slug: "route", label: "Route", Component: Route },
  { slug: "statement", label: "Approach", Component: Statement },
  { slug: "destinations", label: "Projects", Component: Destinations },
  { slug: "logbook", label: "Logbook", Component: Logbook },
  { slug: "closer", label: "Contact", anchor: "contact", Component: Closer },
];
