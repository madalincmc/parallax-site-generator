// Brings the owner's own photographs into a Frame site:
//
//   node scripts/onboard/images.mjs <folder> [--credits credits.json]
//
// Every JPEG, PNG, WebP or AVIF in <folder> is resized to at most 2400px on its long edge, re-encoded as
// WebP with its metadata (camera, GPS) stripped, and written to public/images/work/ with a manifest.json
// of sizes and orientations, which /site and the section skills read before placing anything. The
// originals are only read, never changed. Next.js then serves each image at the size the screen needs.
import {
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  rmSync,
  statSync,
  writeFileSync,
} from "node:fs";
import { basename, extname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";
import { ROOT } from "./prepare.mjs";

export const WORK = join(ROOT, "public/images/work");
const EXTENSIONS = new Set([".jpg", ".jpeg", ".png", ".webp", ".avif"]);
const MAX_IMAGES = 40;
const MAX_FILE_BYTES = 40 * 1024 * 1024;
const LONG_EDGE = 2400;

const slugify = (name) =>
  name
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^\w]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 48) || "image";

/** Imports a folder of photographs. Returns the manifest. Throws with a readable message. */
export async function importImages(folder, { credits = {} } = {}) {
  const source = resolve(folder);
  if (!existsSync(source) || !statSync(source).isDirectory())
    throw new Error(`No folder at ${source}.`);
  const files = readdirSync(source)
    .filter((name) => EXTENSIONS.has(extname(name).toLowerCase()))
    .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
  if (!files.length) throw new Error("That folder has no JPEG, PNG, WebP or AVIF images.");
  if (files.length > MAX_IMAGES)
    throw new Error(`That folder has ${files.length} images. Choose at most ${MAX_IMAGES}.`);

  rmSync(WORK, { recursive: true, force: true });
  mkdirSync(WORK, { recursive: true });
  const images = [];
  for (const [i, name] of files.entries()) {
    const path = join(source, name);
    if (statSync(path).size > MAX_FILE_BYTES) throw new Error(`${name} is larger than 40 MB.`);
    const stem = basename(name, extname(name)).replace(/^\d+[-_ .]*/, ""); // the order number is added below
    const file = `${String(i + 1).padStart(2, "0")}-${slugify(stem)}.webp`;
    const { width, height } = await sharp(path)
      .rotate() // honour the camera's orientation before the metadata goes
      .resize({ width: LONG_EDGE, height: LONG_EDGE, fit: "inside", withoutEnlargement: true })
      .webp({ quality: 78, effort: 5 })
      .toFile(join(WORK, file));
    const ratio = width / height;
    images.push({
      src: `/images/work/${file}`,
      width,
      height,
      orientation: ratio > 1.15 ? "landscape" : ratio < 0.87 ? "portrait" : "square",
      original: name,
      ...(credits[name] ? { credit: credits[name] } : {}),
    });
  }
  const manifest = {
    note: "The owner's own photographs, for the Frame style. Look at each one before placing it.",
    images,
  };
  writeFileSync(join(WORK, "manifest.json"), `${JSON.stringify(manifest, null, 2)}\n`);
  return manifest;
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const [folder, flag, creditsFile] = process.argv.slice(2);
  if (!folder) {
    console.error("Usage: node scripts/onboard/images.mjs <folder> [--credits credits.json]");
    process.exit(1);
  }
  const credits =
    flag === "--credits" && creditsFile ? JSON.parse(readFileSync(creditsFile, "utf8")) : {};
  importImages(folder, { credits })
    .then(({ images }) => console.log(`Imported ${images.length} images into public/images/work/`))
    .catch((error) => {
      console.error(error.message);
      process.exit(1);
    });
}
