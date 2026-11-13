---
name: section-gallery
description: Build a sideways scroll-scrubbed gallery of procedural 3D or shader plates over the shared world. Use when a scroll-driven three.js site has variants, places, works or models to show.
argument-hint: [slug=gallery] <what the plates show>
allowed-tools: Read, Write, Edit, Glob, Grep, Bash(node scripts/check.mjs:*), PowerShell(node scripts/check.mjs:*)
---

Build this section: **$ARGUMENTS**

Read `.claude/skills/site/contract.md`, then `src/site/brief.ts`, the style guide it names in
`.claude/skills/site/styles/`, and the map at the top of `src/site/world.ts`. Follow them throughout.
Where the style guide's table describes this section, its treatment replaces the defaults below. If
the section exists, revise it.

Default slug `gallery`, length about 1 screen per 2 plates, usually 3 to 5. Sites like Oryzo use
photographs for this. You can't, so never fake a photo with noise or leave a gradient placeholder.
Plates must be things 3D renders well:

- **Variants of the thread:** the same object in different materials or colors, each on its own
  plinth, passed by a camera dollying sideways. This is the most reliable option.
- **Generative art plates:** planes in the 3D world, each with a distinct shader that belongs to the
  story, such as flow fields, topographic contours or caustics.
- **Dioramas:** small procedural scenes, each sitting in its own lit area.

**Prefer plates in the world.** Build them in the scene along one axis and move the camera past them,
which gives real parallax and foreground overlap that flat DOM sliding can't. Put captions in `Beat`s
timed to each plate. Stagger plates in depth and height a little, so they aren't a flat row.

Keep shaders cheap, since they run over large areas of the screen, and only make what's near the camera
visible. Give each plate a short name and one fact, like a museum label: small label, large name, and
an index such as `03 / 05`.

Finish by running `node scripts/check.mjs --section <slug>` as the contract describes. Report the slug,
its frame time, and anything you couldn't achieve.
