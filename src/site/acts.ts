// Loaded with three.js, after first paint, so nothing here slows the page's text down.
import type { ActLoader, WorldFactory } from "@/stage/types";

export const loadWorld = async (): Promise<WorldFactory> => (await import("./world")).default;

export const acts: Record<string, ActLoader> = {
  hero: () => import("@/sections/hero/act"),
  route: () => import("@/sections/route/act"),
  statement: () => import("@/sections/statement/act"),
  destinations: () => import("@/sections/destinations/act"),
  logbook: () => import("@/sections/logbook/act"),
  closer: () => import("@/sections/closer/act"),
};
