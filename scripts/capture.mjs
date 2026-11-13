// Records a site's scroll-through for the README: a looping WebP, an MP4 and stills.
//
//   node scripts/capture.mjs <url> <name> [--seconds 14] [--from 0] [--to 1] [--stills 0,0.35,0.7]
//
// It drives the site's own clock (window.__stage), so every run gives the same smooth scroll, frame by
// frame, whatever the speed of this machine. Output goes to docs/media/.
import { spawn } from "node:child_process";
import { existsSync, mkdirSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { parseArgs } from "node:util";
import ffmpegPath from "ffmpeg-static";
import puppeteer from "puppeteer-core";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const OUT = join(ROOT, "docs/media");
const VIEW = { width: 1280, height: 720, deviceScaleFactor: 1 };
const FPS = 20;
const HOLD = 0.8; // seconds held still at the start and the end

const CHROME = [
  process.env.CHROME_PATH,
  "C:/Program Files/Google/Chrome/Application/chrome.exe",
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  "/usr/bin/google-chrome",
].find((path) => path && existsSync(path));

const { values, positionals } = parseArgs({
  allowPositionals: true,
  options: {
    seconds: { type: "string", default: "14" },
    from: { type: "string", default: "0" },
    to: { type: "string", default: "1" },
    stills: { type: "string", default: "0" },
  },
});
const [url, name] = positionals;
if (!url || !name) {
  console.error("Usage: node scripts/capture.mjs <url> <name> [--seconds 14] [--from 0] [--to 1] [--stills 0,0.5]");
  process.exit(1);
}

const ease = (x) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
const ffmpeg = (args) =>
  new Promise((done, reject) => {
    const child = spawn(ffmpegPath, ["-y", "-loglevel", "error", ...args], { stdio: "inherit" });
    child.on("close", (code) => (code === 0 ? done() : reject(new Error(`ffmpeg exited with ${code}`))));
  });

const frames = join(tmpdir(), `capture-${name}`);
rmSync(frames, { recursive: true, force: true });
mkdirSync(frames, { recursive: true });
mkdirSync(OUT, { recursive: true });

const browser = await puppeteer.launch({
  executablePath: CHROME,
  headless: true,
  args: ["--ignore-gpu-blocklist", "--enable-gpu", "--use-angle=d3d11", "--enable-unsafe-swiftshader", "--hide-scrollbars"],
});
try {
  const page = await browser.newPage();
  await page.setViewport(VIEW);
  await page.goto(url, { waitUntil: "load" });
  await page.waitForFunction(() => document.documentElement.classList.contains("ready") && window.__stage, { timeout: 30000 });
  await new Promise((r) => setTimeout(r, 1500)); // the preloader's fade, and fonts settling
  const max = await page.evaluate(() => document.documentElement.scrollHeight - innerHeight);
  const from = Number(values.from) * max;
  const to = Number(values.to) * max;

  const at = async (y) => {
    await page.evaluate((v) => window.__stage.clock.jump(v), y);
    await page.evaluate(() => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r))));
  };

  for (const [i, share] of values.stills.split(",").map(Number).entries()) {
    await at(share * max);
    await new Promise((r) => setTimeout(r, 400));
    await page.screenshot({ path: join(frames, `still-${i}.png`) });
    await ffmpeg(["-i", join(frames, `still-${i}.png`), "-quality", "88", join(OUT, `${name}-${i + 1}.webp`)]);
  }

  const moving = Math.round(Number(values.seconds) * FPS);
  const held = Math.round(HOLD * FPS);
  const total = moving + held * 2;
  for (let f = 0; f < total; f++) {
    const k = ease(Math.min(1, Math.max(0, (f - held) / moving)));
    await at(from + (to - from) * k);
    await page.screenshot({ path: join(frames, `f${String(f).padStart(4, "0")}.jpg`), type: "jpeg", quality: 92 });
  }
} finally {
  await browser.close();
}

const input = ["-framerate", String(FPS), "-i", join(frames, "f%04d.jpg")];
await ffmpeg([...input, "-vf", "scale=800:-2:flags=lanczos", "-c:v", "libwebp_anim", "-loop", "0", "-quality", "62", "-compression_level", "6", join(OUT, `${name}.webp`)]);
await ffmpeg([...input, "-c:v", "libx264", "-pix_fmt", "yuv420p", "-crf", "24", "-preset", "slow", "-movflags", "+faststart", join(OUT, `${name}.mp4`)]);
rmSync(frames, { recursive: true, force: true });
console.log(`${name}: docs/media/${name}.webp, .mp4 and stills`);
