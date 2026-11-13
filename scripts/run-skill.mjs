// One-shot entry point:
//   npm run site -- "a site for a fictional mechanical watch, dark and precise"
//   npm run site -- --style editorial "a portfolio for a small ceramics studio"
// Runs the /site skill through the local Claude Code CLI, on your Claude Code login.
import { spawn } from "node:child_process";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { prepareNewSite } from "./onboard/prepare.mjs";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");

const ALLOWED_TOOLS = [
  "Skill",
  "Read",
  "Glob",
  "Grep",
  "Edit(src/site/**)", // also covers Write
  "Edit(src/sections/**)",
  // Windows sessions may reach for either shell.
  "Bash(node scripts/check.mjs:*)",
  "PowerShell(node scripts/check.mjs:*)",
];

const STYLES = ["film", "editorial", "signal"];
const args = process.argv.slice(2);
const flag = args.indexOf("--style");
const style = flag === -1 ? "" : args.splice(flag, 2)[1];
const brief = args.join(" ").trim();
if (!brief || (flag !== -1 && !STYLES.includes(style))) {
  console.error(`Usage: npm run site -- [--style ${STYLES.join("|")}] "what the site is for and how it should feel"`);
  process.exit(1);
}

// Claude Code prefers an API key when one is set, which would bill per token.
// Removing it keeps this running on the Claude Code login, with no extra charges.
const env = { ...process.env };
delete env.ANTHROPIC_API_KEY;
delete env.ANTHROPIC_AUTH_TOKEN;

const archived = prepareNewSite();
if (archived) console.log(`Saved the previous site to ${archived}`);

const claude = spawn("claude", ["-p", `/site ${style ? `style=${style} ` : ""}${brief}`, "--allowedTools", ALLOWED_TOOLS.join(",")], {
  cwd: ROOT,
  env,
  stdio: ["ignore", "inherit", "inherit"],
});

claude.on("error", (error) => {
  console.error(error.code === "ENOENT" ? "Claude Code CLI not found on PATH." : error.message);
  process.exit(1);
});
claude.on("close", (code) => process.exit(code ?? 1));
