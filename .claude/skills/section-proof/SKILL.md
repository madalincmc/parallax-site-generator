---
name: section-proof
description: Build a numbers and quotes section for a scroll-driven three.js site, with large figures tied to the 3D and testimonials layered in depth. Use when a site needs statistics, reviews or social proof.
argument-hint: [slug=proof] <the numbers and quotes>
allowed-tools: Read, Write, Edit, Glob, Grep, Bash(node scripts/check.mjs:*), PowerShell(node scripts/check.mjs:*)
---

Build this section: **$ARGUMENTS**

Read `.claude/skills/site/contract.md`, then `src/site/brief.ts`, the style guide it names in
`.claude/skills/site/styles/`, and the map at the top of `src/site/world.ts`. Follow them throughout.
Where the style guide's table describes this section, its treatment replaces the defaults below. If
the section exists, revise it.

Default slug `proof`, length about 3. Never invent facts for a real business: follow the contract's
`[placeholder]` rule. For a fictional brand, make the numbers specific and a little surprising, since
"10x" and "99%" read as filler where "0.002 mm" or "412 parts" read as true.

**Numbers.** One to three, each very large with a small unit and label. Make them feel earned by tying
them to the 3D, so each number's beat shows what it measures, such as a gauge filling, a ring of
instanced parts appearing, or a glow line tracing a distance. Static numbers rising with `Words`
work, and so does `Count`, which counts up as its beat arrives and keeps the final value in the
markup, so it survives without JavaScript.

**Quotes.** Two to four short ones, in real `blockquote`s with a name and role, specific about one
thing. Place them at different `Depth` speeds and positions so they slide past each other, and give
them separate beats if they'd overlap at the same moment.

**The 3D stays quiet here.** Pull the camera back to give the world a moment of scale, use small slow
motion, and don't let anything compete with the numbers.

Finish by running `node scripts/check.mjs --section <slug>` as the contract describes. Report the slug,
its frame time, and anything you couldn't achieve.
