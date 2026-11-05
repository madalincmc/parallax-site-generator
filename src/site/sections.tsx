// The page, top to bottom. Its order is the site's order. Every slug needs a matching act in acts.ts.
import type { ComponentType } from "react";
import Closer from "@/sections/closer/section";
import Features from "@/sections/features/section";
import Hero from "@/sections/hero/section";
import Proof from "@/sections/proof/section";
import Statement from "@/sections/statement/section";
import Story from "@/sections/story/section";

export const sections: { slug: string; label: string; anchor?: string; Component: ComponentType }[] = [
  { slug: "hero", label: "Intro", Component: Hero },
  { slug: "story", label: "About", Component: Story },
  { slug: "statement", label: "Approach", Component: Statement },
  { slug: "features", label: "Projects", Component: Features },
  { slug: "proof", label: "Highlights", Component: Proof },
  { slug: "closer", label: "Contact", anchor: "contact", Component: Closer },
];
