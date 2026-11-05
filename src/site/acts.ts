// Loaded with three.js, after first paint, so nothing here slows the page's text down.
import type { ActLoader, WorldFactory } from "@/stage/types";

export const loadWorld = async (): Promise<WorldFactory> => (await import("./world")).default;

export const acts: Record<string, ActLoader> = {
  hero: () => import("@/sections/hero/act"),
  story: () => import("@/sections/story/act"),
  statement: () => import("@/sections/statement/act"),
  features: () => import("@/sections/features/act"),
  proof: () => import("@/sections/proof/act"),
  closer: () => import("@/sections/closer/act"),
};
