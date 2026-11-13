# Parallax site

Type a brief, get a scroll-driven three.js website on Next.js. Claude Code writes the scenes, the copy
and the layout as code, with no image models, downloaded assets or extra costs.

```bash
npm install
npm run create
```

A setup page opens in your browser. It asks about your project, then which **style** you want, and,
if you have one, your existing site's public GitHub repo. You then choose your sections, theme,
colors, fonts and art direction, and press **Create site**. Answering uses none of your Claude usage.
When the site is built, the page gives you a link to it.

Prefer one line? `npm run site -- "a site for a fictional mechanical watch, dark and precise"`, or
`npm run site -- --style editorial "a portfolio for a small ceramics studio"`, or type
`/site <brief>` in Claude Code.

## Styles

The style is the biggest decision. It sets how the whole site is built: its layout, its menu and
preloader, its type system, how much of the page is pinned, and what the 3D does. Colors, fonts and
sections are chosen afterwards, and the wizard suggests the ones that suit the style.

| Style | In one line | The page | The 3D |
|---|---|---|---|
| **Film** | One continuous take | Pinned sections scrubbed like scenes in one shot. A small pill menu. | A world that fills the screen, with the camera travelling through it |
| **Editorial** | A studio's journal, set on screen | Type-led and calm: a paper ground, big serif headings, mono labels, hairline rules and numbered sections. Mostly flowing content that rises in as you scroll, and an index of work with generated covers. A full-width bar menu. | One sculptural object, the *specimen*, set in the margin and turning as chapters change |
| **Signal** | A control room for a brand | Dark with one electric accent. A loader counting from 000%, `STATUS //` readouts, live local clocks, a scroll counter, marquees of client names, bordered cells, case-study cards, an FAQ and a giant wordmark footer. | One dramatic *artifact* lit at night, which the page scans, turns and opens |

Film is how the sites made so far were built (Madalin's balloon flight, Zsolt's gym and Ionuț's
football pitch). Editorial takes its cues from studio and agency sites such as
[Glinto](https://glinto.co.kr/en) and [The Contenders](https://thecontenders.co/work), and Signal
from [Aller Studio](https://www.allerstudio.com/). They borrow the craft, not the content.

**[STYLES.md](STYLES.md)** compares the three side by side, with a wireframe of each, how to choose
one, the building blocks and how to add a style.

Each style has a guide in `.claude/skills/site/styles/` (`film.md`, `editorial.md` and `signal.md`).
`/site` and every section skill read it before building anything. The site records its style in
`src/site/brief.ts` as `style`. Sites made before styles existed have none, and are treated as Film.

## What it costs

Answering the setup page is free. Generating draws on your Claude Code usage, with no additional cost. The
one 7-section Film site measured so far took about 24 minutes and 5.4 million tokens, so expect it to
vary. Editorial and Signal pages carry lighter 3D, but have yet to be measured.

## Your existing site

If you add a public GitHub repo, the new site can use its colors, fonts and wording. Your repo isn't
changed, and its code is never checked out, installed or run: the setup page only reads selected text
files. Images aren't used, since everything on screen is generated.

Each new site saves the previous one to `.archive/`. To go back, copy its `site` and `sections` folders over
the ones in `src/`.

## How it works

The page has **one fixed canvas, one scene and one camera**. Each section adds an act to that scene,
and the engine eases the camera, a shared object and the mood between acts as you scroll, so sections
read as one continuous piece. This holds in every style. What changes is how much of the screen the 3D
owns.

| Skill | Builds |
|---|---|
| `/site` | The whole site: picks the style, plans the story and world, calls the skills below, then fixes the seams |
| `/section-hero` | The opening and first reveal |
| `/section-story` | A long pinned sequence, the main event |
| `/section-statement` | One huge line of type (or, in Editorial, a manifesto paragraph) |
| `/section-features` | Cards, a list or numbered cells for concrete details or services |
| `/section-work` | An index of projects or case studies with tags and generated covers (Editorial, Signal) |
| `/section-process` | How the work happens, as numbered steps |
| `/section-gallery` | A sideways run of procedural plates |
| `/section-proof` | Numbers, quotes and client names |
| `/section-faq` | Questions as an accordion that works without JavaScript (Editorial, Signal) |
| `/section-closer` | The final image, call to action and footer |

Each section skill also works alone, for example `/section-statement slug=claim: "Nothing is wasted"`.
It builds the section in the site's current style.

### Building blocks

Sections are written with the blocks in `src/stage/`:

- `Section`, `Beat`, `Depth` and `Words`: pinned sections, timed beats, parallax layers and rising words.
- `Reveal`: content in a flowing section that rises in as it scrolls into view, and sinks back if you
  scroll up.
- `Count`: a number that counts up as it arrives.
- `Marquee`: an endless row, such as client names.
- `LocalTime`: the time now in a city.
- `Plate` (`src/stage/plate.tsx`): generated SVG cover art in the site's colors (`ridges`, `orbits`,
  `horizon`, `halftone`, `spectrum`, `stack` or `glyph`). It stands in for the images another site
  would use. The same seed always draws the same plate.

The menu and preloader for each style live in `src/stage/chrome.tsx`. All of these blocks fall back to
a plain readable page with no JavaScript or with reduced motion.

## Checks

`npm run check` builds the site and fails on browser errors, off-site requests, frame budgets on the
integrated GPU, sideways scrolling, text running off screen, overlapping or running under the menu, or
text lost with reduced motion, without JavaScript or without WebGL. It writes contact sheets to
`checks/`.

## Limitations

- Everything on screen is procedural, so sites that depend on photographs need a different idea. In
  Editorial and Signal, generated plates stand in for project images on the home page.
- Claude reviews stills, not playback. A person still has to scroll through it.
- It generates one site per copy of this project.
