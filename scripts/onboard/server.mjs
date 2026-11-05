// The setup wizard: `npm run create`. A small local page that asks what the site should be, then runs
// /site with those answers and reports progress. Answering uses no Claude usage; generating does.
import { execFile, spawn } from "node:child_process";
import { randomBytes } from "node:crypto";
import { readFileSync, writeFileSync } from "node:fs";
import { createServer } from "node:http";
import { createServer as createNetServer } from "node:net";
import { createRequire } from "node:module";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import * as options from "./options.mjs";
import { prepareNewSite, ROOT } from "./prepare.mjs";
import { readRepo } from "./repo.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const NEXT = join(ROOT, "node_modules/next/dist/bin/next");
const CONFIG_FILE = "site.config.json";
const TOKEN = randomBytes(24).toString("hex");
const MAX_BODY = 200_000;
const require = createRequire(import.meta.url);
const FONT_DATA = require("next/dist/compiled/@next/font/dist/google/font-data.json");

// The same list as run-skill.mjs, so the wizard can do nothing the command line couldn't.
const ALLOWED_TOOLS = [
  "Skill",
  "Read",
  "Glob",
  "Grep",
  "Edit(src/site/**)",
  "Edit(src/sections/**)",
  "Bash(node scripts/check.mjs:*)",
  "PowerShell(node scripts/check.mjs:*)",
];

// Tests can swap Claude for a stand-in. Real runs never set these.
const CLAUDE_BIN = process.env.ONBOARD_CLAUDE_BIN ?? "claude";
const CLAUDE_PREFIX = process.env.ONBOARD_CLAUDE_ARGS ? [process.env.ONBOARD_CLAUDE_ARGS] : [];

const ids = (list) => new Set(list.map((item) => item.id));
const text = (value, max) => (typeof value === "string" ? value.trim().slice(0, max) : "");
const isColor = (value) => typeof value === "string" && /^#[0-9a-f]{6}$/i.test(value);
const pick = (value, list, fallback) => (ids(list).has(value) ? value : fallback);

/** Rebuilds the answers field by field, so only known values ever reach the config file. */
function validate(answers) {
  const name = text(answers.name, 80);
  const about = text(answers.about, 2000);
  if (!name || !about) throw new Error("The project needs a name and a description.");

  const catalog = new Map(options.SECTIONS.map((section) => [section.skill, section]));
  const counts = new Map();
  const sections = (Array.isArray(answers.sections) ? answers.sections : []).flatMap((skill) => {
    const section = catalog.get(skill);
    if (!section) return [];
    const used = (counts.get(skill) ?? 0) + 1;
    if (used > (section.repeat ?? 1)) return [];
    counts.set(skill, used);
    return [{ skill, slug: used === 1 ? section.slug : `${section.slug}-${used}` }];
  });
  if (sections[0]?.skill !== "section-hero" || sections.at(-1)?.skill !== "section-closer")
    throw new Error("The site has to start with the opening and end with the ending.");
  if (sections.length < 3) throw new Error("Choose at least one section between the opening and the ending.");

  const palette = answers.palette?.mode === "custom"
    ? { mode: "custom", bg: answers.palette.bg, ink: answers.palette.ink, muted: answers.palette.muted, accent: answers.palette.accent }
    : options.PALETTES.find((item) => item.id === answers.palette?.id)
      ? { mode: "preset", ...options.PALETTES.find((item) => item.id === answers.palette.id) }
      : { mode: answers.palette?.mode === "repo" ? "repo" : "auto" };
  if (palette.mode === "custom" && ![palette.bg, palette.ink, palette.muted, palette.accent].every(isColor))
    throw new Error("Custom colors must be 6-digit hex values.");

  const preset = options.FONTS.find((item) => item.id === answers.fonts?.id);
  const fonts = answers.fonts?.mode === "custom"
    ? { mode: "custom", heading: text(answers.fonts.heading, 60), body: text(answers.fonts.body, 60) }
    : preset
      ? { mode: "preset", heading: preset.heading, body: preset.body }
      : { mode: answers.fonts?.mode === "repo" ? "repo" : "auto" };
  if (fonts.mode === "custom")
    for (const font of [fonts.heading, fonts.body])
      if (!FONT_DATA[font]) throw new Error(`"${font}" isn't a Google font. Check the spelling, including capitals.`);

  const reference = answers.reference?.digest && /^\.reference\/[\w.-]+\/digest\.md$/.test(answers.reference.digest)
    ? {
        repo: text(answers.reference.repo, 200),
        digest: answers.reference.digest,
        use: {
          colors: palette.mode === "repo",
          fonts: fonts.mode === "repo",
          wording: Boolean(answers.reference.useWording),
        },
      }
    : null;
  if ((palette.mode === "repo" || fonts.mode === "repo") && !reference) throw new Error("Read your repo first to use its colors or fonts.");

  return {
    name,
    about,
    audience: text(answers.audience, 500),
    action: text(answers.action, 200),
    kind: answers.kind === "fictional" ? "fictional" : "real",
    facts: text(answers.facts, 4000),
    subject: text(answers.subject, 1000),
    thread: pick(answers.thread, options.THREADS, "auto"),
    sections,
    theme: pick(answers.theme, options.THEMES, "auto"),
    palette,
    fonts,
    style: pick(answers.style, options.STYLES, "auto"),
    motion: pick(answers.motion, options.MOTIONS, "balanced"),
    length: pick(answers.length, options.LENGTHS, "standard"),
    avoid: text(answers.avoid, 1000),
    notes: text(answers.notes, 2000),
    reference,
  };
}

// --- The run

const run = {
  state: "idle", // idle, running, building, ready, failed, cancelled
  steps: [],
  current: "",
  startedAt: null,
  finishedAt: null,
  report: "",
  error: "",
  url: "",
  archived: null,
  tokens: 0,
  limit: null,
};
let child = null;
let preview = null;

const stepsFor = (config) => [
  { id: "plan", name: "Plan the story and world", state: "active" },
  ...config.sections.map((section) => ({
    id: section.slug,
    skill: section.skill,
    name: options.SECTIONS.find((item) => item.skill === section.skill).name,
    state: "waiting",
  })),
  { id: "review", name: "Review the whole site and fix the joins", state: "waiting" },
  { id: "preview", name: "Start your preview", state: "waiting" },
];

function activate(id) {
  const index = run.steps.findIndex((step) => step.id === id);
  if (index === -1 || run.steps[index].state === "active") return;
  run.steps.forEach((step, i) => {
    if (i < index) step.state = "done";
    if (i === index) step.state = "active";
  });
}

const friendly = (name, input) => {
  const path = String(input?.file_path ?? "").replace(/\\/g, "/");
  const file = path.split("/").slice(-2).join("/");
  const command = String(input?.command ?? "");
  if (/check\.mjs/.test(command)) return "Building the site and checking it in a browser";
  if (name === "Read" && /checks\/.+\.png$/.test(path)) return `Looking at ${path.split("/").pop()}`;
  if (name === "Read") return `Reading ${file}`;
  if (name === "Write" || name === "Edit") return `Writing ${file}`;
  return "";
};

function onEvent(event) {
  if (event.type === "rate_limit_event" && event.rate_limit_info?.rateLimitType === "five_hour") {
    const windows = event.rate_limit_info.unifiedWindows?.five_hour;
    if (typeof windows?.utilization === "number") run.limit = Math.round(windows.utilization * 100);
  }
  if (event.type === "assistant") {
    const usage = event.message?.usage;
    if (usage) run.seen.set(event.message.id, (usage.input_tokens ?? 0) + (usage.output_tokens ?? 0) + (usage.cache_creation_input_tokens ?? 0) + (usage.cache_read_input_tokens ?? 0));
    run.tokens = [...run.seen.values()].reduce((sum, value) => sum + value, 0);
    for (const block of event.message?.content ?? []) {
      if (block.type !== "tool_use") continue;
      if (block.name === "Skill") {
        const args = String(block.input?.args ?? "");
        const skill = String(block.input?.skill ?? "");
        const slug = /slug=([\w-]+)/.exec(args)?.[1];
        const next = run.steps.find((step) => step.state === "waiting" && step.skill === skill);
        const named = run.steps.find((step) => step.id === slug);
        if (named || next) activate((named ?? next).id);
        run.sectionsStarted = true;
      } else if (/check\.mjs/.test(String(block.input?.command ?? "")) && !/--section/.test(String(block.input?.command)) && run.sectionsStarted) {
        activate("review");
      }
      const line = friendly(block.name, block.input);
      if (line) run.current = line;
    }
  }
  if (event.type === "result") {
    run.report = String(event.result ?? "");
    run.resultError = Boolean(event.is_error);
  }
}

function stopChild() {
  if (!child) return;
  if (process.platform === "win32") execFile("taskkill", ["/pid", String(child.pid), "/T", "/F"], { windowsHide: true }, () => {});
  else child.kill("SIGTERM");
}

const freePort = (preferred) =>
  new Promise((done) => {
    const probe = createNetServer();
    probe.once("error", () => {
      const fallback = createNetServer();
      fallback.listen(0, "127.0.0.1", () => {
        const { port } = fallback.address();
        fallback.close(() => done(port));
      });
    });
    probe.listen(preferred, () => probe.close(() => done(preferred)));
  });

function finish(state, error = "") {
  run.state = state;
  run.error = error;
  run.finishedAt = Date.now();
  run.current = "";
  child = null;
}

async function startPreview() {
  run.state = "building";
  activate("preview");
  run.current = "Building the final site";
  const built = await new Promise((done) => {
    const build = spawn(process.execPath, [NEXT, "build"], { cwd: ROOT, env: { ...process.env, NEXT_TELEMETRY_DISABLED: "1" }, stdio: ["ignore", "pipe", "pipe"], windowsHide: true });
    let output = "";
    build.stdout.on("data", (data) => (output += data));
    build.stderr.on("data", (data) => (output += data));
    build.on("close", (code) => done({ code, output }));
  });
  if (built.code !== 0) return finish("failed", `The site was written, but it didn't build:\n${built.output.slice(-1500)}`);

  const port = await freePort(3100);
  preview?.kill();
  preview = spawn(process.execPath, [NEXT, "start", "-p", String(port)], { cwd: ROOT, env: { ...process.env, NEXT_TELEMETRY_DISABLED: "1" }, stdio: "ignore", windowsHide: true });
  const url = `http://localhost:${port}`;
  for (let i = 0; i < 100; i++) {
    try {
      if ((await fetch(url)).ok) break;
    } catch {}
    await new Promise((done) => setTimeout(done, 200));
  }
  run.url = url;
  run.steps.forEach((step) => (step.state = "done"));
  finish("ready");
}

function startRun(config) {
  run.archived = prepareNewSite();
  writeFileSync(join(ROOT, CONFIG_FILE), `${JSON.stringify(config, null, 2)}\n`);
  Object.assign(run, {
    state: "running", steps: stepsFor(config), current: "Starting Claude", startedAt: Date.now(), finishedAt: null,
    report: "", error: "", url: "", tokens: 0, seen: new Map(), sectionsStarted: false, resultError: false,
  });

  // Claude Code prefers an API key when one is set, which would bill per token.
  // Removing it keeps this running on the Claude Code login, with no extra charges.
  const env = { ...process.env };
  delete env.ANTHROPIC_API_KEY;
  delete env.ANTHROPIC_AUTH_TOKEN;

  const args = [...CLAUDE_PREFIX, "-p", `/site --config ${CONFIG_FILE}`, "--output-format", "stream-json", "--verbose", "--allowedTools", ALLOWED_TOOLS.join(",")];
  child = spawn(CLAUDE_BIN, args, { cwd: ROOT, env, stdio: ["ignore", "pipe", "pipe"], windowsHide: true });

  let buffer = "";
  let stderr = "";
  child.stdout.on("data", (data) => {
    buffer += data;
    const lines = buffer.split("\n");
    buffer = lines.pop();
    for (const line of lines) {
      try {
        onEvent(JSON.parse(line));
      } catch {}
    }
  });
  child.stderr.on("data", (data) => (stderr = (stderr + data).slice(-1500)));
  child.on("error", (error) => {
    finish("failed", error.code === "ENOENT" ? "Claude Code wasn't found. Install it, sign in, and try again." : error.message);
  });
  child.on("close", (code) => {
    if (run.state !== "running") return;
    if (code === 0 && !run.resultError) startPreview().catch((error) => finish("failed", error.message));
    else finish("failed", run.report || stderr || `Claude stopped with exit code ${code}.`);
  });
}

// --- The page's API

const claudeInstalled = await new Promise((done) => {
  execFile(CLAUDE_BIN, [...CLAUDE_PREFIX, "--version"], { windowsHide: true, timeout: 20_000 }, (error) => done(!error));
});

const send = (res, status, body, type = "application/json") => {
  res.writeHead(status, { "Content-Type": type, "Cache-Control": "no-store" });
  res.end(type === "application/json" ? JSON.stringify(body) : body);
};

const readBody = (req) =>
  new Promise((done, reject) => {
    let body = "";
    req.on("data", (data) => {
      body += data;
      if (body.length > MAX_BODY) {
        reject(new Error("Too much text."));
        req.destroy();
      }
    });
    req.on("end", () => {
      try {
        done(JSON.parse(body || "{}"));
      } catch {
        reject(new Error("Unreadable request."));
      }
    });
  });

const server = createServer(async (req, res) => {
  const { port } = server.address();
  // Only this page may use this server: running it starts Claude and replaces the current site.
  const local = new Set([`127.0.0.1:${port}`, `localhost:${port}`]);
  if (!local.has(req.headers.host)) return send(res, 403, { error: "Forbidden." });
  if (req.method === "POST" && req.headers["x-token"] !== TOKEN) return send(res, 403, { error: "Forbidden." });

  const path = new URL(req.url, "http://localhost").pathname;
  try {
    if (req.method === "GET" && path === "/") {
      return send(res, 200, readFileSync(join(HERE, "page.html"), "utf8").replace("__TOKEN__", TOKEN), "text/html; charset=utf-8");
    }
    if (req.method === "GET" && path === "/options") {
      return send(res, 200, { ...options, claudeInstalled });
    }
    if (req.method === "GET" && path === "/status") {
      return send(res, 200, { ...run, seen: undefined, now: Date.now() });
    }
    if (req.method === "POST" && path === "/repo") {
      const { url } = await readBody(req);
      return send(res, 200, await readRepo(ROOT, url));
    }
    if (req.method === "POST" && path === "/create") {
      if (run.state === "running" || run.state === "building") return send(res, 409, { error: "A site is already being created." });
      const config = validate(await readBody(req));
      startRun(config);
      return send(res, 200, { ok: true });
    }
    if (req.method === "POST" && path === "/cancel") {
      if (run.state === "running") {
        stopChild(); // first, because finish() forgets the process
        finish("cancelled");
      }
      return send(res, 200, { ok: true });
    }
    return send(res, 404, { error: "Not found." });
  } catch (error) {
    return send(res, 400, { error: error.message });
  }
});

server.listen(0, "127.0.0.1", () => {
  const url = `http://localhost:${server.address().port}`;
  console.log(`\nSetup is open at ${url}\nKeep this window open until you're finished. Press Ctrl+C to stop.\n`);
  if (process.env.ONBOARD_NO_BROWSER) return;
  if (process.platform === "win32") execFile("cmd", ["/c", "start", "", url], { windowsHide: true }, () => {});
  else execFile(process.platform === "darwin" ? "open" : "xdg-open", [url], () => {});
});

process.on("SIGINT", () => {
  stopChild();
  preview?.kill();
  process.exit(0);
});
