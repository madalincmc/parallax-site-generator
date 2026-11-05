// Builds the site, opens it in a headless browser and checks it is fit for a real page.
//
//   node scripts/check.mjs                      everything, sheets for every section
//   node scripts/check.mjs --section <slug>     everything, but a sheet for one section
//   node scripts/check.mjs --skip-build         reuse the last build
//
// Sheets are written to checks/. Exits non-zero if any check fails. Output stays short, since
// every line costs Claude's usage.
import { spawn } from "node:child_process";
import { existsSync, mkdirSync, rmSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { createServer } from "node:net";
import { fileURLToPath } from "node:url";
import { parseArgs } from "node:util";
import ffmpegPath from "ffmpeg-static";
import puppeteer from "puppeteer-core";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const OUT = join(ROOT, "checks");
const NEXT = join(ROOT, "node_modules/next/dist/bin/next");

const BUDGET = {
  transferKb: 600, // everything the page downloads, compressed
  medianMs: 14, // on the integrated GPU at 1920x1080
  p95Ms: 24,
};
const DESKTOP = { width: 1920, height: 1080, deviceScaleFactor: 1 };
const SHEET = { width: 1280, height: 720, deviceScaleFactor: 1 };
const PHONE = { width: 390, height: 844, deviceScaleFactor: 2, isMobile: true, hasTouch: true };
const SECTION_POINTS = [0, 0.2, 0.4, 0.6, 0.8, 1];

const CHROME_CANDIDATES = [
  process.env.CHROME_PATH,
  "C:/Program Files/Google/Chrome/Application/chrome.exe",
  "C:/Program Files (x86)/Google/Chrome/Application/chrome.exe",
  "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe",
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  "/usr/bin/google-chrome",
  "/usr/bin/chromium",
];

const sleep = (ms) => new Promise((done) => setTimeout(done, ms));

function run(args) {
  return new Promise((done, reject) => {
    const child = spawn(process.execPath, args, {
      cwd: ROOT,
      env: { ...process.env, NEXT_TELEMETRY_DISABLED: "1" },
      stdio: ["ignore", "pipe", "pipe"],
    });
    let output = "";
    child.stdout.on("data", (d) => (output += d));
    child.stderr.on("data", (d) => (output += d));
    child.on("error", reject);
    child.on("close", (code) => (code === 0 ? done(output) : reject(new Error(output.slice(-3000)))));
  });
}

function freePort() {
  return new Promise((done, reject) => {
    const server = createServer();
    server.on("error", reject);
    server.listen(0, "127.0.0.1", () => {
      const { port } = server.address();
      server.close(() => done(port));
    });
  });
}

async function startServer() {
  const port = await freePort();
  const child = spawn(process.execPath, [NEXT, "start", "-p", String(port), "-H", "127.0.0.1"], {
    cwd: ROOT,
    env: { ...process.env, NEXT_TELEMETRY_DISABLED: "1" },
    stdio: "ignore",
  });
  const origin = `http://127.0.0.1:${port}`;
  for (let i = 0; i < 100; i++) {
    try {
      if ((await fetch(origin)).ok) return { child, origin };
    } catch {}
    await sleep(200);
  }
  child.kill();
  throw new Error("The production server did not start.");
}

function tile(frames, columns, width, out) {
  const rows = Math.ceil(frames.length / columns);
  return new Promise((done, reject) => {
    const ffmpeg = spawn(
      ffmpegPath,
      ["-y", "-loglevel", "error", "-f", "image2pipe", "-c:v", "png", "-i", "-", "-vf",
        `scale=${width}:-2,tile=${columns}x${rows}:color=black`, "-frames:v", "1", out],
      { stdio: ["pipe", "inherit", "inherit"] },
    );
    ffmpeg.on("error", reject);
    ffmpeg.on("close", (code) => (code === 0 ? done() : reject(new Error(`ffmpeg exited with code ${code}`))));
    ffmpeg.stdin.end(Buffer.concat(frames));
  });
}

async function openSite(browser, origin, { viewport, reducedMotion, noWebgl, noJs } = {}) {
  const page = await browser.newPage();
  const errors = [];
  const offsite = [];
  page.on("pageerror", (error) => errors.push(error.message.slice(0, 300)));
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text().slice(0, 300));
  });
  page.on("request", (request) => {
    const url = request.url();
    if (!url.startsWith(origin) && !/^(data|blob):/.test(url)) offsite.push(url.slice(0, 120));
  });
  if (viewport) await page.setViewport(viewport);
  if (reducedMotion) await page.emulateMediaFeatures([{ name: "prefers-reduced-motion", value: "reduce" }]);
  if (noJs) await page.setJavaScriptEnabled(false);
  if (noWebgl) {
    await page.evaluateOnNewDocument(() => {
      const real = HTMLCanvasElement.prototype.getContext;
      HTMLCanvasElement.prototype.getContext = function (type, ...rest) {
        return /webgl/.test(type) ? null : real.call(this, type, ...rest);
      };
    });
  }
  const cdp = await page.createCDPSession();
  await cdp.send("Network.enable");
  const transfer = { bytes: 0 };
  cdp.on("Network.loadingFinished", (event) => (transfer.bytes += event.encodedDataLength));
  await page.goto(origin, { waitUntil: "load" });
  if (!noJs) await page.waitForFunction(() => document.documentElement.classList.contains("ready"), { timeout: 15000 });
  if (!noJs) await sleep(900); // the preloader's fade
  return { page, errors, offsite, transfer };
}

// Jumps to a section's progress and waits for that position to be painted.
async function goTo(page, spanIndex, p, settle = 120) {
  await page.evaluate(
    (i, value) => {
      const span = window.__stage.clock.sections()[i];
      window.__stage.clock.jump(span.top + (span.end - span.top) * value);
    },
    spanIndex,
    p,
  );
  await page.evaluate(() => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r))));
  if (settle) await sleep(settle);
}

const SECTIONS = () =>
  window.__stage.clock.sections().map(({ slug, top, end }) => ({ slug, top, end }));

// With each beat at full strength, its text must fit the screen and not sit on another beat's.
const inspectBeats = () => {
  const text = "h1,h2,h3,h4,p,li,a,button,blockquote,dd,dt";
  const visible = [...document.querySelectorAll("[data-beat]")].filter((b) => {
    if (!b.closest(".section-stage")) return false;
    const r = b.getBoundingClientRect();
    return Number(b.style.opacity || 1) > 0.95 && r.bottom > 0 && r.top < innerHeight;
  });
  const out = [];
  const boxes = [];
  visible.forEach((beat, i) => {
    beat.querySelectorAll(text).forEach((el) => {
      if (el.closest("[data-bleed]") || !el.textContent.trim()) return;
      const range = document.createRange();
      range.selectNodeContents(el);
      const r = range.getBoundingClientRect();
      if (!r.width) return;
      const label = el.textContent.trim().slice(0, 40);
      if (r.left < -1 || r.right > innerWidth + 1 || r.top < -1 || r.bottom > innerHeight + 1)
        out.push(`"${label}" runs off the screen`);
      boxes.push({ i, r, label });
    });
  });
  const chapters = document.querySelector(".chapters");
  const menu = chapters && getComputedStyle(chapters).display !== "none" ? chapters.getBoundingClientRect() : null;
  if (menu)
    for (const { r, label } of boxes)
      if (r.left < menu.right && menu.left < r.right && r.top < menu.bottom && menu.top < r.bottom)
        out.push(`"${label}" runs under the chapter menu`);
  for (const a of boxes)
    for (const b of boxes)
      if (a.i < b.i && a.r.left < b.r.right && b.r.left < a.r.right && a.r.top < b.r.bottom && b.r.top < a.r.bottom)
        out.push(`"${a.label}" overlaps "${b.label}"`);
  return out;
};

async function main() {
  const { values } = parseArgs({
    options: { section: { type: "string" }, "skip-build": { type: "boolean", default: false } },
  });
  const executablePath = CHROME_CANDIDATES.find((path) => path && existsSync(path));
  if (!executablePath) throw new Error("No Chrome or Edge found. Set CHROME_PATH to a browser executable.");

  if (!values["skip-build"]) {
    try {
      await run([NEXT, "build"]);
    } catch (error) {
      console.error(`BUILD FAILED:\n${error.message}`);
      process.exit(1);
    }
  }
  rmSync(OUT, { recursive: true, force: true });
  mkdirSync(OUT, { recursive: true });

  const { child, origin } = await startServer();
  const launch = (gpu) =>
    puppeteer.launch({
      executablePath,
      headless: true,
      args: ["--ignore-gpu-blocklist", "--enable-gpu", "--use-angle=d3d11", gpu, "--enable-unsafe-swiftshader"],
    });
  const browser = await launch("--force_low_power_gpu");

  const failures = [];
  const warnings = [];
  const expect = (ok, message) => {
    if (!ok) failures.push(message);
  };
  const dedupe = (list) => [...new Set(list)];

  try {
    // --- Desktop: budgets, on the integrated GPU.
    const desktop = await openSite(browser, origin, { viewport: DESKTOP });
    const { page } = desktop;
    const engineError = await page.evaluate(() => window.__stage.failure());
    expect(!engineError, `The stage failed to start: ${engineError}`);
    const sections = await page.evaluate(SECTIONS);
    expect(sections.length > 0, "No sections on the page.");
    if (values.section && !sections.some((s) => s.slug === values.section))
      throw new Error(`No section "${values.section}". Sections: ${sections.map((s) => s.slug).join(", ")}`);

    const bench = await page.evaluate(() => window.__stage.engine()?.bench(40));
    if (bench) {
      const software = /swiftshader|llvmpipe/i.test(bench.gpu);
      console.log(`GPU: ${bench.gpu}`);
      for (const r of bench.results) {
        console.log(`  ${r.slug.padEnd(16)} ${r.median.toFixed(1).padStart(5)} ms median ${r.p95.toFixed(1).padStart(5)} ms p95  ${r.calls} calls  ${r.triangles} tris`);
        if (software) continue;
        expect(r.median <= BUDGET.medianMs, `${r.slug}: median frame ${r.median.toFixed(1)} ms (budget ${BUDGET.medianMs}).`);
        expect(r.p95 <= BUDGET.p95Ms, `${r.slug}: p95 frame ${r.p95.toFixed(1)} ms (budget ${BUDGET.p95Ms}).`);
      }
      if (software) console.log("Frame budgets skipped: no hardware GPU available to this browser.");
    }
    const transferKb = desktop.transfer.bytes / 1024;
    console.log(`Transfer: ${transferKb.toFixed(0)} KB (budget ${BUDGET.transferKb})`);
    expect(transferKb <= BUDGET.transferKb, `Page downloads ${transferKb.toFixed(0)} KB.`);

    // --- Camera continuity: the world must never cut under the viewer's thumb.
    const jumps = await page.evaluate(() => {
      const engine = window.__stage.engine();
      if (!engine) return [];
      const { clock } = window.__stage;
      const height = document.documentElement.scrollHeight - innerHeight;
      const step = innerHeight / 10;
      const found = [];
      let previous = engine.cameraAt(0);
      for (let y = step; y <= height; y += step) {
        const pose = engine.cameraAt(y);
        const moved = Math.hypot(...pose.position.map((v, i) => v - previous.position[i]));
        const range = Math.hypot(...pose.position.map((v, i) => v - pose.target[i]));
        if (moved > Math.max(range, 1) * 0.5) found.push(clock.sections()[clock.frameAt(y).a].slug);
        previous = pose;
      }
      return [...new Set(found)];
    });
    for (const slug of jumps) warnings.push(`${slug}: the camera jumps sharply on a small scroll.`);

    // --- Sheets, at the size a person reads them.
    await page.setViewport(SHEET);
    await sleep(300);
    const wanted = values.section ? sections.filter((s) => s.slug === values.section) : sections;
    for (const section of wanted) {
      const index = sections.findIndex((s) => s.slug === section.slug);
      const sectionFrames = [];
      for (const p of SECTION_POINTS) {
        await goTo(page, index, p);
        sectionFrames.push(Buffer.from(await page.screenshot({ type: "png" })));
        for (const problem of await page.evaluate(inspectBeats)) failures.push(`${section.slug} (desktop, p=${p}): ${problem}`);
      }
      await tile(sectionFrames, 3, 640, join(OUT, `${section.slug}.png`));
    }
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - innerWidth);
    expect(overflow <= 1, `The page scrolls sideways by ${overflow}px on desktop.`);
    if (!values.section) {
      await page.evaluate(() => window.__stage.clock.jump(0));
      const pageHeight = await page.evaluate(() => document.documentElement.scrollHeight - innerHeight);
      const overview = [];
      for (let i = 0; i < 16; i++) {
        await page.evaluate((y) => window.__stage.clock.jump(y), (pageHeight * i) / 15);
        await sleep(140);
        overview.push(Buffer.from(await page.screenshot({ type: "png" })));
      }
      await tile(overview, 4, 480, join(OUT, "overview.png"));
    }
    expect(desktop.errors.length === 0, `Browser errors: ${dedupe(desktop.errors).slice(0, 5).join(" | ")}`);
    expect(desktop.offsite.length === 0, `Requests off the site: ${dedupe(desktop.offsite).slice(0, 5).join(", ")}`);
    await page.close();

    // --- Phone.
    const phone = await openSite(browser, origin, { viewport: PHONE });
    const phoneFrames = [];
    for (let i = 0; i < sections.length; i++) {
      if (values.section && sections[i].slug !== values.section) continue;
      for (const p of [0, 0.5, 1]) {
        await goTo(phone.page, i, p);
        phoneFrames.push(Buffer.from(await phone.page.screenshot({ type: "png" })));
        for (const problem of await phone.page.evaluate(inspectBeats)) failures.push(`${sections[i].slug} (phone, p=${p}): ${problem}`);
      }
    }
    await tile(phoneFrames, 6, 240, join(OUT, "phone.png"));
    const phoneOverflow = await phone.page.evaluate(() => document.documentElement.scrollWidth - innerWidth);
    expect(phoneOverflow <= 1, `The page scrolls sideways by ${phoneOverflow}px on a phone.`);
    expect(phone.errors.length === 0, `Browser errors on a phone: ${dedupe(phone.errors).slice(0, 5).join(" | ")}`);
    await phone.page.close();

    // --- The page must survive without its effects.
    const readable = () =>
      [...document.querySelectorAll("[data-section]")].flatMap((section) => {
        const headings = [...section.querySelectorAll("h1,h2,h3")];
        if (!headings.length) return [`${section.dataset.section}: has no heading`];
        return headings
          .filter((h) => {
            for (let el = h; el; el = el.parentElement) {
              const style = getComputedStyle(el);
              if (style.opacity === "0" || style.visibility === "hidden" || style.display === "none") return true;
            }
            return false;
          })
          .map((h) => `${section.dataset.section}: "${h.textContent.trim().slice(0, 40)}" is hidden`);
      });

    const reduced = await openSite(browser, origin, { viewport: DESKTOP, reducedMotion: true });
    await sleep(300);
    for (const problem of await reduced.page.evaluate(readable)) failures.push(`Reduced motion: ${problem}`);
    expect(reduced.errors.length === 0, `Browser errors with reduced motion: ${dedupe(reduced.errors).slice(0, 3).join(" | ")}`);
    const pinned = await reduced.page.evaluate(() => document.documentElement.classList.contains("motion"));
    expect(!pinned, "Reduced motion still gets the scroll-driven page.");
    await reduced.page.close();

    const noJs = await openSite(browser, origin, { viewport: DESKTOP, noJs: true });
    for (const problem of await noJs.page.evaluate(readable)) failures.push(`No JavaScript: ${problem}`);
    await noJs.page.close();

    const noWebgl = await openSite(browser, origin, { viewport: DESKTOP, noWebgl: true });
    const startedAnyway = await noWebgl.page.evaluate(() => window.__stage.failure());
    expect(Boolean(startedAnyway), "With WebGL unavailable, the stage should report failure and step aside.");
    for (let i = 0; i < sections.length; i++) {
      let seen = false;
      for (const p of SECTION_POINTS) {
        await goTo(noWebgl.page, i, p, 0);
        seen ||= await noWebgl.page.evaluate(
          (slug) => {
            const beats = [...document.querySelectorAll(`[data-section="${slug}"] [data-beat]`)];
            return !beats.length || beats.some((b) => Number(b.style.opacity || 1) > 0);
          },
          sections[i].slug,
        );
      }
      expect(seen, `Without WebGL, ${sections[i].slug} never shows its text.`);
    }
    const realErrors = noWebgl.errors.filter((e) => !/webgl|context/i.test(e));
    expect(realErrors.length === 0, `Browser errors without WebGL: ${dedupe(realErrors).slice(0, 3).join(" | ")}`);
    await noWebgl.page.close();
  } finally {
    await browser.close();
    child.kill();
  }

  console.log(`Sheets: ${OUT}`);
  for (const warning of dedupe(warnings)) console.log(`WARNING: ${warning}`);
  if (failures.length) {
    console.error(`\nFAILED:\n${dedupe(failures).slice(0, 25).map((f) => `- ${f}`).join("\n")}`);
    process.exit(1);
  }
  console.log("\nAll checks passed.");
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
