---
name: section-features
description: Build a features section with depth-layered cards or a sticky index over the shared three.js world. Use when a scroll-driven site needs to explain concrete capabilities, specifications or product details.
argument-hint: [slug=features] <the things to explain>
allowed-tools: Read, Write, Edit, Glob, Grep, Bash(node scripts/check.mjs:*), PowerShell(node scripts/check.mjs:*)
---

Build this section: **$ARGUMENTS**

Read `.claude/skills/site/contract.md`, then `src/site/brief.ts` and the map at the top of
`src/site/world.ts`, and follow the contract throughout. If the section exists, revise it.

Default slug `features`. This is where the visitor reads, so legibility comes first and 3D supports.

Pick one structure:

- **Stacked cards (pinned):** 3 to 5 cards, length about 1 screen each. Each has its own `Beat` and
  arrives over the last. The act changes to illustrate the current card, for example by turning the
  thread to the part being discussed. This is usually the strongest choice.
- **Sticky index (flow):** `Section flow`, as in Shopify Editions: a sticky column of category names at
  the left using Tailwind `sticky top-24`, with long content at the right. Use this for
  6 or more items. In a flow section, `--p` still runs 0..1 over its height.
- **Offset grid (flow):** cards in 2 columns, each column in a `Depth` of a different speed, so they
  slide against each other.

**Cards must be readable over anything:** a solid or heavily blurred panel using
`bg-bg/80 backdrop-blur-xl border border-white/10`, or on a light section the equivalent in light.
Use `backdrop-blur` on only a few elements, since it's costly over a full-screen canvas.

**Make cards specific:** a small label, a short title, one or two lines, and a concrete detail like a
number or a small spec. Avoid three equal cards with an icon, a title and a sentence each. Make one
much larger, or vary the layout, so it doesn't read as a template.

Keep the 3D slow and calm here, with a light act: the camera drifting past the thread at a distance,
or one part highlighted at a time.

Finish by running `node scripts/check.mjs --section <slug>` as the contract describes. Report the slug,
its frame time, and anything you couldn't achieve.
