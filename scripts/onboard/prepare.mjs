// Gets the project ready for a new site. The current site goes to .archive/ first, then src/site and
// src/sections go back to the starter. Leftover sections would otherwise still be type-checked against
// the new world, and fail the build.
import { cpSync, existsSync, mkdirSync, readFileSync, rmSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

export const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const STARTER = join(ROOT, "scripts/onboard/starter");

function currentName() {
  try {
    const brief = readFileSync(join(ROOT, "src/site/brief.ts"), "utf8");
    return /name:\s*"([^"]+)"/.exec(brief)?.[1] ?? "site";
  } catch {
    return "site";
  }
}

export function prepareNewSite() {
  const name = currentName();
  let archived = null;
  if (name !== "Starter" && existsSync(join(ROOT, "src/site"))) {
    const stamp = new Date().toISOString().slice(0, 19).replace(/[T:]/g, "-");
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
    archived = `.archive/${slug}-${stamp}`;
    mkdirSync(join(ROOT, archived), { recursive: true });
    cpSync(join(ROOT, "src/site"), join(ROOT, archived, "site"), { recursive: true });
    cpSync(join(ROOT, "src/sections"), join(ROOT, archived, "sections"), { recursive: true });
    if (existsSync(join(ROOT, "content"))) cpSync(join(ROOT, "content"), join(ROOT, archived, "content"), { recursive: true });
    const images = join(ROOT, "public/images");
    if (existsSync(images)) cpSync(images, join(ROOT, archived, "images"), { recursive: true });
  }
  for (const part of ["site", "sections"]) {
    rmSync(join(ROOT, "src", part), { recursive: true, force: true });
    cpSync(join(STARTER, part), join(ROOT, "src", part), { recursive: true });
  }
  rmSync(join(ROOT, "content"), { recursive: true, force: true });
  rmSync(join(ROOT, "public/images"), { recursive: true, force: true });
  return archived;
}
