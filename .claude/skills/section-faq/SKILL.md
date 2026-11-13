---
name: section-faq
description: Build a questions and answers section for a scroll-driven three.js site, as an accordion that opens one answer at a time and works without JavaScript. Use when a site needs an FAQ, common questions, or answers about pricing, timing or how to start.
argument-hint: [slug=faq] <the questions>
allowed-tools: Read, Write, Edit, Glob, Grep, Bash(node scripts/check.mjs:*), PowerShell(node scripts/check.mjs:*)
---

Build this section: **$ARGUMENTS**

Read `.claude/skills/site/contract.md`, then `src/site/brief.ts`, the style guide it names in
`.claude/skills/site/styles/`, and the map at the top of `src/site/world.ts`. Follow them throughout.
If the section exists, revise it.

Default slug `faq`, as `Section flow`. It removes the last doubts before the closer, so the questions
are the ones a visitor would really ask before getting in touch: how to start, how long it takes,
what it costs, what's included, who does the work, where they're based.

**The content.** 4 to 7 questions, each answered in 1 to 3 sentences in the brand's voice. For a real
project, answer only from the facts provided. If an answer isn't known, keep the question and write
`[placeholder: ...]` as its answer, and list it in your report. Never invent prices or durations.

**The markup.** A heading (`h2`), then one native `<details name="<slug>">` per question with the
question in its `<summary>`, which opens one at a time and needs no JavaScript or client component.
Hide the default marker (`list-none [&::-webkit-details-marker]:hidden`) and draw a `+` that turns 45°
when open, with `group-open:rotate-45` on a `group` details. Animate the answer with a short
transition, and keep it readable when it can't animate. Put the whole list in one `Reveal` per
question.

Pick the treatment from the style guide:

- **Editorial:** questions in the display serif at about `clamp(1.25rem, 2.4vw, 2rem)` between
  hairlines, with answers in the body face, indented to the question's text column. The section head
  sits to the left in a sticky column (`md:sticky md:top-24`), with the list in the right 8 columns.
- **Signal:** bordered rows, questions in the uppercase display face, a bracketed index `[01]` at the
  left, and the `+` in the accent. Open rows get an accent border on the left.

**The act.** Nearly still: the 3D sits at the far edge or drops out, since this is for reading.

Finish by running `node scripts/check.mjs --section <slug>` as the contract describes. Report the slug,
its frame time, the placeholders you left, and anything you couldn't achieve.
