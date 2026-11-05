---
name: section-statement
description: Build a short section around one huge line of type with 3D moving through or past it, for a scroll-driven three.js site. Use for a change of pace, a bold claim or a breather between long sections.
argument-hint: [slug=statement] <the line, and what moves through it>
allowed-tools: Read, Write, Edit, Glob, Grep, Bash(node scripts/check.mjs:*), PowerShell(node scripts/check.mjs:*)
---

Build this section: **$ARGUMENTS**

Read `.claude/skills/site/contract.md`, then `src/site/brief.ts` and the map at the top of
`src/site/world.ts`, and follow the contract throughout. If the section exists, revise it.

Default slug `statement`, length about 2 to 2.5. It should be one idea, read in one second. It gives
rhythm to the page, so don't add a list or a paragraph.

**The type.** A single line of at most about 6 words at `clamp(4rem, 16vw, 16rem)`, with tight tracking
and line height. A common pattern is letting it run wider than the screen and scrubbing it sideways
with `style={{ transform: "translateX(calc(var(--p) * -40%))" }}`. Wrap it in `data-bleed` when it
does, and repeat the claim as a short normal-width `h2` in a corner, so it can still be read whole.

**The 3D.** The thread crosses the screen in sync with the type, sits in a gap between the words, or
rushes past close to the camera. Use a fast, close move here, since the long sections around it are
slower. Consider a mood flip, with a light or saturated `mood` and `tone="light"`, because a sudden
change of field is the strongest punctuation available.

Layer at least two `Depth` speeds, such as a large ghost word behind moving slower than the main line.

Finish by running `node scripts/check.mjs --section <slug>` as the contract describes. Report the slug,
its frame time, and anything you couldn't achieve.
