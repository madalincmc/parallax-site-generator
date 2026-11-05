---
name: section-story
description: Build a long pinned scroll-scrubbed story section for a three.js site, where the shared object or world changes across several text beats. Use for an exploded view, a transformation, a journey or a how-it-works sequence.
argument-hint: [slug=story] <what changes, across which beats>
allowed-tools: Read, Write, Edit, Glob, Grep, Bash(node scripts/check.mjs:*), PowerShell(node scripts/check.mjs:*)
---

Build this section: **$ARGUMENTS**

Read `.claude/skills/site/contract.md`, then `src/site/brief.ts` and the map at the top of
`src/site/world.ts`, and follow the contract throughout. If the section exists, revise it.

Default slug `story`, length about 1 screen per beat plus 1, usually 4 to 6. This is the page's main
event, and where the reference sites spend the most scroll.

**Write the beats first,** as a comment at the top of `act.ts`: for each, its range of `p`, what the 3D
does and what the text says, 3 to 5 in total. Every beat needs a visible change in the 3D, and the
text explains the change happening rather than running parallel to it.

**Choreograph with `segment` and `track`.** Give each moving part its own slice of `p` and overlap the
slices slightly, so motion hands over rather than stopping and starting. Good moves:

- **Exploded view:** parts separate along an axis, with an offset for each part. Label parts with
  beats placed near where they settle.
- **Transformation:** material or form changes, such as a uniform cross-fading, a surface opening up,
  or points assembling into a shape with `mix(start, end, uProgress)` in a vertex shader.
- **Journey:** the camera follows a curve while `glowLine.tick(reveal)` traces the route ahead.
- **Scale shift:** push from the whole object into a detail until it fills the screen, then reveal the
  detail as a world of its own.

**Vary the frame.** Move the camera substantially between beats: at least one close detail, one wide,
and one unusual angle. Alternate text between left, right and bottom, keeping the subject in the
opposite part of the screen. Close-ups need geometry that holds up, so add detail where you'll look.

Finish by running `node scripts/check.mjs --section <slug>` as the contract describes. Report the slug,
its frame time, and anything you couldn't achieve.
