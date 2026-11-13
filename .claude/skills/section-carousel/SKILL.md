---
name: section-carousel
description: Build a photograph carousel section for a scroll-driven three.js site, with swipeable slides, previous and next buttons, a counter and thumbnails, as a gallery, split slides or an editorial set. Use when a portfolio or image-led site needs to show a series of photographs, rooms, products or a project's pictures.
argument-hint: [slug=carousel] <which photographs, and what they show>
allowed-tools: Read, Write, Edit, Glob, Grep, Bash(node scripts/check.mjs:*), PowerShell(node scripts/check.mjs:*)
---

Build this section: **$ARGUMENTS**

Read `.claude/skills/site/contract.md`, then `src/site/brief.ts`, the style guide it names in
`.claude/skills/site/styles/`, and the map at the top of `src/site/world.ts`. Follow them throughout.
If the section exists, revise it.

Default slug `carousel`. This is where a visitor slows down and looks, so the photographs are the point
and everything else is quiet.

**The photographs.** Use `photos` from `src/site/images.ts`. If it doesn't exist yet, Read the
photographs in `public/images/work/` and its `manifest.json`, and write it as the Frame style guide
describes. Choose a set of 4 to 8 that belong together: one project, one kind of room, one series.
Look at them, and order them as a sequence: wide, then closer, then a detail, or light to dark. Give
each a `title` of one to three words and a `note` (a year, a place, a material) only if it's true or
visible in the picture.

**`Carousel`** from `@/stage/frames` does the work: slides snap one at a time, with swipe, a scroll
wheel or trackpad, the arrow buttons, or `thumbs`. It works with no JavaScript as a native scrolling
row. Pick one structure:

- **Gallery (flow):** `Section flow`. A section head (a hairline, a label, a heading of 3 to 6 words
  and one line of context at the right), then the `Carousel` with `slide={78}` so the next photo
  peeks in, and `thumbs`. The strongest and most reliable choice.
- **Split slides (pinned, length 2 to 3):** a two-column frame inside the screen margins: a large
  photo `Carousel` (`slide={100}`) on one side, and a rounded paper card on the other with the
  heading, two lines and the counter. Put it all in one Beat from 0 to 0.95. On phones the photo goes
  on top.
- **Editorial set (flow):** one main photo and a column of text, then a `Carousel` of the rest with
  `slide={34}` and a smaller `ratio`, like contact prints.

Keep each slide's `ratio` the same within one carousel (3/2 for landscape sets, 4/5 for portraits),
and choose photographs that suit it. Text is short: this section is for looking.

**The act.** Still, like the rest of the Frame style: the page color and nothing else.

Finish by running `node scripts/check.mjs --section <slug>` as the contract describes. Look at the
sheet and the phone sheet for crops that cut a subject badly, and fix them by choosing another ratio or
photograph. Report the slug, the photographs used, and anything you couldn't achieve.
