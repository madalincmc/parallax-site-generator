---
name: section-closer
description: Build the final section of a scroll-driven three.js site, with the final camera pull-back, payoff image, call to action and footer. Use for an ending, a call to action or a footer.
argument-hint: [slug=closer] <the call to action, and footer links>
allowed-tools: Read, Write, Edit, Glob, Grep, Bash(node scripts/check.mjs:*), PowerShell(node scripts/check.mjs:*)
---

Build this section: **$ARGUMENTS**

Read `.claude/skills/site/contract.md`, then `src/site/brief.ts` and the map at the top of
`src/site/world.ts`, and follow the contract throughout. If the section exists, revise it.

Default slug `closer`, length about 2.5 to 3. This is the payoff, so it must feel like an arrival.

**The final image.** Bring the thread to rest in its final form, and reveal something held back all
page: the complete object, the full landscape from above, or everything assembled. Pull the camera
right back or orbit slowly. Let `p` reach 1 with motion settling, and keep slow ambient motion from `t`
running, since visitors rest here.

**The text.** A short closing line that answers the hero's opening, not a generic "Get started", plus
one call to action, styled as the single most prominent interactive thing on the page, in `--accent`.
Links must be real `<a>`s with an `href`. Use `#` plus a section slug for in-page links. For anything
else, use `#` and flag it as a placeholder in your report.

**The footer.** Keep a small line of name, a few links and legal at the bottom, inside the last beat
with `to={1}` so it remains. Check it fits on a phone, since the beat fills the screen.

Finish by running `node scripts/check.mjs --section <slug>` as the contract describes. Report the slug,
its frame time, and anything you couldn't achieve.
