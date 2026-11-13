---
name: section-process
description: Build a process section for a scroll-driven three.js site, showing how the work happens as numbered steps from brief to launch. Use when a studio, service or portfolio site needs to explain its way of working, phases or method.
argument-hint: [slug=process] <the steps>
allowed-tools: Read, Write, Edit, Glob, Grep, Bash(node scripts/check.mjs:*), PowerShell(node scripts/check.mjs:*)
---

Build this section: **$ARGUMENTS**

Read `.claude/skills/site/contract.md`, then `src/site/brief.ts`, the style guide it names in
`.claude/skills/site/styles/`, and the map at the top of `src/site/world.ts`. Follow them throughout.
If the section exists, revise it.

Default slug `process`. It answers "what is it like to work with you?", so make it specific to this
project and not a generic agency process.

**The steps.** 3 to 5, numbered `01` to `05`. Each has a name of one or two words, two short lines of
what happens, and one concrete detail: what the client gets (a written brief, a prototype, a launch
checklist), how long it takes, or who is involved. For a real project, use only steps the user
described or that their material supports, and leave `[placeholder: ...]` for durations and deliverables
you don't know. Avoid "Discover, Define, Design, Deliver" unless the user's own words say so.

Pick the structure from the style guide:

- **Editorial: rows.** `Section flow`. Full-width rows between hairlines, each a `Reveal`: the number
  set large in the display serif in the first columns, the name, the two lines in a narrow column,
  and the detail in mono at the right.
- **Signal: the track.** A horizontal track of steps joined by a line that fills in the accent as you
  scroll. As a short pin (length about 1 screen per 2 steps), give the fill `transform: scaleX(var(--p))`
  and show steps as `Beat`s. As `flow`, put each step in a `Reveal` and fill the line with `--q`. On
  phones the track turns vertical.
- **Film: a pinned story.** One beat per step, with the thread changing at each one, as
  `section-story` describes.

**The act.** Give each step a visible change in the 3D when the section is pinned. In a flow section,
keep it to one slow move across the whole section, such as the specimen turning a quarter at a time,
or the artifact rotating to show a new face.

Finish by running `node scripts/check.mjs --section <slug>` as the contract describes. Report the slug,
its frame time, the placeholders you left, and anything you couldn't achieve.
