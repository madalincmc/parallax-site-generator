// The page, top to bottom. Its order is the site's order. Every slug needs a matching act in acts.ts.
import type { ComponentType } from "react";
import Closer from "@/sections/closer/section";
import Hero from "@/sections/hero/section";

export const sections: { slug: string; label: string; anchor?: string; Component: ComponentType }[] = [
  { slug: "hero", label: "Start", Component: Hero },
  { slug: "closer", label: "End", Component: Closer },
];
