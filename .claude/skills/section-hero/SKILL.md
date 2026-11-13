---
name: section-hero
description: Build the opening section of a scroll-driven three.js site, with the first look at the hero object or world and the first scroll reveal. Use for a hero or opening section, on its own or when called by the site skill.
argument-hint: [slug=hero] <what it should open with>
allowed-tools: Read, Write, Edit, Glob, Grep, Bash(node scripts/check.mjs:*), PowerShell(node scripts/check.mjs:*)
---

Build this section: **$ARGUMENTS**

Read `.claude/skills/site/contract.md`, then `src/site/brief.ts`, the style guide it names in
`.claude/skills/site/styles/`, and the map at the top of `src/site/world.ts`. Follow them throughout.
Where the style guide's table describes this section, its treatment replaces the defaults below. If
the section exists, revise it.

Default slug `hero`, length about 2.5 to 3.5. This decides whether anyone keeps scrolling.

**First screen.** Before any scrolling, the visitor must get the name or a claim, a striking first
image of the thread, and a cue to scroll. It must look finished on arrival, with the heading in an
`h1` inside a `Beat from={0}`.

**First scroll.** The first screen of scrolling must pay off immediately with something large: the
camera pushes in, the object turns to reveal what it really is, or the type parts around it. Hold back
something for later sections, such as the object's insides or the world's full scale.

Ways to do it:

- An oversized wordmark toward the edges of the screen, with the object framed in a gap in the type.
- A small claim that gives way to a second line at about p 0.5, so the section has two beats.
- A scroll cue: a small label at the bottom, gone by p 0.15.

Add `dust` or fine foreground elements so the first frame has depth, and let the pointer visibly move
something, since it's the first sign this page is alive.

Finish by running `node scripts/check.mjs --section <slug>` as the contract describes. Report the slug,
its frame time, and anything you couldn't achieve.
