---
name: section-work
description: Build a work index for a scroll-driven three.js site, listing projects or case studies with tags, one-line outcomes and generated cover plates. Use when a studio, freelancer or portfolio site needs to show its projects, clients or case studies.
argument-hint: [slug=work] <the projects to show>
allowed-tools: Read, Write, Edit, Glob, Grep, Bash(node scripts/check.mjs:*), PowerShell(node scripts/check.mjs:*)
---

Build this section: **$ARGUMENTS**

Read `.claude/skills/site/contract.md`, then `src/site/brief.ts`, the style guide it names in
`.claude/skills/site/styles/`, and the map at the top of `src/site/world.ts`. Follow them throughout.
If the section exists, revise it.

Default slug `work`, as `Section flow`. This is where a visitor decides whether to hire, so it has to
scan in seconds and reward a closer look.

**The projects.** Use the real projects from the arguments, the setup answers, or `content/projects/`
if it has files (read their front matter for titles, summaries and tags). Link each one to
`/projects/<slug>` when that page exists, and otherwise to `#` with a placeholder in your report. For a
real project, never invent clients, results or dates: write `[placeholder: ...]`. Show 4 to 8, and end
with a link to `/projects` ("All projects →") when there are more.

**Each entry has:** an index number, a title, a one-line tagline about the outcome rather than the
task, 2 to 4 tags (industry and services, or stack), the year, and a cover. Covers are
`<Plate seed={slug} kind=... />` from `@/stage/plate`, never photographs and never empty boxes. Pick
two or three plate kinds that suit the site and use them across the whole index, so the covers read
as a series. Write the tagline as a result: "Cut release checks from two days to forty minutes", not
"Built a testing tool".

Pick the structure from the style guide:

- **Editorial: the index list.** Full-width rows between hairlines. On each row, the index, the title
  in the display serif at about `clamp(1.75rem, 4vw, 3.5rem)`, the tags in mono and the year at the
  right. The cover sits in a column of the row (about 4 of 12 columns), or opens below the title on
  hover with `grid-rows` transitions. On phones, the cover stacks above the title. Put a row of
  filter-like category labels under the section head as plain text, not working filters, unless
  you can make them work with no JavaScript (for example as anchor links to groups).
- **Editorial: the featured project.** Optionally, the first project gets a large cover across 8
  columns, with its tagline beside it, before the list starts.
- **Signal: case-study cards.** A grid of 2 or 3 columns of tall bordered cards. Each has its cover
  (ratio 3/4) with the bracketed index and client name over it, then tags as small chips, the outcome
  line, and a `View case ↗` link. Make the first card span two columns, so the grid isn't uniform.
- **Film:** the gallery skill usually does this job better. If this skill is used, rows over the 3D
  on a solid `bg-bg/85` panel.

**Motion.** Every row or card is a `Reveal`, with `order` staggering cards in the same row. Hover
zooms the cover (built into `Plate`), underlines the title and nudges the arrow. The whole row or card
is one `<a>`, so it's a single target.

**The act.** Calm: in Editorial, the specimen moves out to the far margin or off the frame, since the
index needs the page width. In Signal, the artifact pulls back and turns slowly at one side. Keep the
3D away from the covers and text.

Finish by running `node scripts/check.mjs --section <slug>` as the contract describes. Flow sections
aren't checked for overlaps, so look at the sheet carefully at desktop and phone widths. Report the
slug, its frame time, the placeholders you left, and anything you couldn't achieve.
