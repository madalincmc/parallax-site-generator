# Site styles

> Four ways to build a scroll-driven site from one brief: same engine, same rules, very different pages.

Every site this project generates has one **style**: Film, Editorial, Signal or Frame. The style is decided before anything else, because
it sets how the whole site is built: its layout, its menu and preloader, its type system, how much of
the page is pinned, and what job the 3D does. Colors, fonts and sections come afterwards, and the setup
wizard puts the ones that suit the style first.

| | **Film** | **Editorial** | **Signal** | **Frame** |
|---|---|---|---|---|
| **In one line** | One continuous take | A studio's journal, set on screen | A control room for a brand | Every picture, from a glimpse to the full screen |
| **Feels** | Cinematic, immersive | Calm, confident, spacious | Precise, live, a little theatrical | Quiet, warm, made for looking |
| **Ground** | The 3D world itself | Paper | Near-black | Warm linen |
| **Accent** | Saturated, used in the world | Rare: links, one word, an index number | Electric: whatever is live or current | Barely there: the photographs bring the color |
| **Type** | A characterful display face and a plain body | Serif headings, grotesk body, mono labels | Uppercase technical display, neutral body, mono readouts | A condensed serif and a tight grotesk |
| **The 3D** | A world the camera travels through | A *specimen*: one sculptural object in the margin | An *artifact*: one dramatic object at the center, scanned and opened | Just the paper: *your photographs* are the subject |
| **Pinned** | Almost everything | The hero, and at most one case study | The hero, plus one or two dramatic moments | The big moves: hero, reveal, the numbered run |
| **Flowing** | Only long lists | Almost everything, rising in as it scrolls | Most content sections | Carousels, work and the footer |
| **Menu** | A small pill of chapters | A full-width bar with numbered chapters | A HUD bar: status, clocks, chapters, `[042]` | A transparent bar with "Menu ⠿", blended over photos |
| **Preloader** | Name and percentage | The name set huge, with an accent line filling | `STATUS // INITIALIZING` over a giant `000%` | The name, inside a frame growing toward the full screen |
| **Covers** | Plates in the 3D world | Flat generated `Plate`s, as a series | Tall, bordered `Plate`s with bracketed indices | The owner's own photographs |
| **Usual order** | hero, story, statement, features, proof, closer | hero, statement, work, process, proof, closer | hero, proof, work, process, faq, closer | hero, statement, gallery, story, carousel, closer |
| **Default motion** | Balanced | Calm | Balanced or bold | Calm or balanced |
| **Best for** | Products, places, journeys, one-idea stories | Studios, practices, people, publications | Technical, bold or nocturnal brands | Photographers, architects, places, collections |

---

## Film

**One continuous take.** A 3D world fills the screen behind the page, and the camera travels through it
as you scroll. Sections pin and scrub like scenes in a single shot, and one *thread* (an object or a
journey) carries from the first frame to the last.

```
┌──────────────────────────────────────────────────────────────┐
│                                      ( Start  Route  Contact )│  ← pill menu
│                                                              │
│   MADALIN                    ╭───╮                           │
│                              │ ◉ │   ← the thread, in the     │
│                              ╰─┬─╯     world, never behind    │
│                                ▼       text                  │
│                          COTETIU                             │
│  ░░▒▒▓▓ mountains, mist, a whole sky that changes ▓▓▒▒░░     │
└──────────────────────────────────────────────────────────────┘
        scroll ↓  the camera moves; the page doesn't cut
```

- **The page:** pinned sections, about one screen of scrolling per beat. The canvas is always visible,
  and text is framed away from the subject.
- **The 3D:** either *one object* that stays on screen and transforms, or *one journey* through a
  single landscape.
- **Made with it:** Madalin's hot air balloon flight across a day, Zsolt's gym, Ionuț's football pitch.

Guide: [`.claude/skills/site/styles/film.md`](.claude/skills/site/styles/film.md)

---

## Editorial

**A studio's journal, set on screen.** Type leads, and the page reads like a well-made printed
publication: a paper ground, big serif headings, small mono labels, hairline rules, numbered sections
and an index of work you can scan in seconds. One sculptural object, the **specimen**, sits in the
margin like a photograph of a single thing on a table.

```
┌──────────────────────────────────────────────────────────────┐
│ Studio Name    01 Intro  02 Work  03 Process   Projects  Blog│  ← bar menu
├──────────────────────────────────────────────────────────────┤
│ (02) WORK                                 SELECTED 2019–2025 │  ← section head
│ ──────────────────────────────────────────────────────────── │
│ Selected work,                                       ◖◗      │
│ quietly made.                                    specimen    │
│ ──────────────────────────────────────────────────────────── │
│ 01  Northwind        Cut checks from 2 days to 40 min   2024 │
│     [≋≋≋ plate ≋≋≋]  FINTECH · QA · PLATFORM          View → │
│ ──────────────────────────────────────────────────────────── │
│ 02  Halden           ...                                2023 │
└──────────────────────────────────────────────────────────────┘
```

- **The page:** mostly flowing. Blocks rise in with `Reveal`, and headings rise word by word. Every
  section opens with the same head: a hairline rule, then `(02) Label` on the left and a mono note on
  the right. Headings are serif at up to 7.5rem with tight tracking. There's a 12-column grid and real
  white space.
- **The 3D:** the canvas takes the page's paper color, so the specimen reads as an object on the page.
  Ceramic, stone, glass, brushed metal or paper, lit like a daylight studio. It moves between margins
  as sections change, and never sits behind text.
- **Covers:** flat generated `Plate`s, two or three kinds per site, so they read as a series.
- **Borrowed from:** [Glinto](https://glinto.co.kr/en): the paper ground, the serif, grotesk and mono
  trio, and numbered process steps. [The Contenders](https://thecontenders.co/work): the indexed work
  list with industry and service tags, and one strong accent. Only the craft is borrowed, never the
  content.

Guide: [`.claude/skills/site/styles/editorial.md`](.claude/skills/site/styles/editorial.md)

---

## Signal

**A control room for a brand.** A near-black ground and one electric accent, with an interface that
feels live: a loader counting from 000%, `STATUS //` readouts, local clocks, a scroll counter, marquees
of client names, bordered cells and bracketed indices. At its center is one dramatic **artifact**, lit
like a product shot at night, which the page scans, turns and opens.

```
┌──────────────────────────────────────────────────────────────┐
│ STUDIO  ● AVAILABLE FOR Q1  CLUJ 17:07  NYC 10:07  WORK [042]│  ← HUD bar
├──────────────────────────────────────────────────────────────┤
│ [01] // INDEX                                      + ─────── │
│                                                              │
│  NOT MADE FOR            ◆◆◆◆                               │
│  THE MOMENT.           ◆◆▓▓◆◆   ← the artifact; a scan plane │
│                          ◆◆◆◆     reveals its wireframe      │
│                                                              │
│ SCROLL // 01                                   v2.0 // 2025  │
├──────────────────────────────────────────────────────────────┤
│ ‹ NORTHWIND   HALDEN   ORYZO   KESTREL   LUMEN   NORTHW… ›   │  ← marquee
├─────────────┬─────────────┬─────────────┬────────────────────┤
│ 128         │ 4.9/5       │ €12,000     │  ← Count cells      │
└─────────────┴─────────────┴─────────────┴────────────────────┘
```

- **The page:** a pinned hero built around the artifact, one or two more pinned moments, and flowing
  content between them. The structure is visible: hairline grids, 1px cells, `+` crop marks, `[01]`
  indices and `//` separators. Every readout carries real information.
- **The 3D:** one heavy, physical object against a black field, with a cold key light and a rim in the
  accent's hue. Its signature move is a **scan**, a plane that sweeps through it and reveals a
  wireframe, point or cutaway version. HUD labels in the page point at its parts.
- **Live chrome:** set `status` and `clocks` in `src/site/brief.ts`, and the bar shows them, with the
  clocks kept current.
- **Borrowed from:** [Aller Studio](https://www.allerstudio.com/): the counting loader and status line,
  local times, the split-line hero, client marquees, case-study cards, a numbered process, an FAQ and a
  giant wordmark footer. Only the craft is borrowed, never the content.

Guide: [`.claude/skills/site/styles/signal.md`](.claude/skills/site/styles/signal.md)

---

## Frame

**Every picture, from a glimpse to the full screen.** A style for photographs. Pictures arrive small (a
card, a floating tile, a word-sized frame inside a sentence) and grow until they fill the screen, then
settle back into galleries and carousels. Between chapters, a bank of mist rolls over everything. Type is
quiet, the chrome almost invisible, and the 3D steps back to become the paper.

```
┌──────────────────────────────────────────────────────────────┐
│ ANA VOSS                                            MENU ⠿  │  ← blended over photos
│                                                              │
│  ‹ ANA VOSS   SELECTED WORK   ANA ┌──────┐ SS   SELECTED  ›  │  ← a huge marquee…
│                                   │ ▣▣▣▣ │                   │
│                                   └──────┘  ← …and a small   │
│                                     ↓  photo at its center   │
│ ┌──────────────────────────────────────────────────────────┐ │
│ │                                                          │ │  ← that grows until it
│ │         the full photograph, edge to edge                │ │     fills the screen
│ │ Villa Mar, 2024                                     01   │ │
│ └──────────────────────────────────────────────────────────┘ │
│ ░░▒▒▓▓██ mist rolls up to change chapter ██▓▓▒▒░░            │
└──────────────────────────────────────────────────────────────┘
```

- **The photographs:** the owner's own, imported by the setup page (or
  `node scripts/onboard/images.mjs <folder>`) into `public/images/work/`. They're resized, re-encoded
  as WebP and stripped of camera data, with a manifest of their sizes. Claude looks at every one, writes
  its alt text, and plans which picture goes where before building anything.
- **The moves:** `Expand` (a photo growing from any frame to the full screen, or shrinking back),
  `Sequence` (a numbered run of full-screen photos wiping over each other), `Carousel` (swipe, arrows,
  counter and thumbnails, working without JavaScript), `Scatter`, `InlinePhoto` and `Mist`. All of
  them are driven by the scroll clock through CSS, with no animation library.
- **Without photographs,** it falls back to generated covers, and says so.
- **Borrowed from:** residence and portfolio sites like [Still / Form](https://stillform.homes/): the
  hero shrinking into a card, the photo inside a sentence, the marquee that opens into a full-screen
  picture, the numbered run, the carousels and the cloud transitions. Only the craft is borrowed, never
  the content.

Guide: [`.claude/skills/site/styles/frame.md`](.claude/skills/site/styles/frame.md)

---

## Choosing a style

```
Is the 3D the point: a product to take apart, a place to travel through?
 ├─ yes ──────────────────────────────────────────────────────────▶  Film
 └─ no: the work and the words are the point
       ├─ the work is photographs ────────────────────────────────▶  Frame
       ├─ calm, crafted, made to be read ─────────────────────────▶  Editorial
       └─ bold, technical, should feel switched on ───────────────▶  Signal
```

In the wizard, pick it on step 2. From the command line:

```bash
npm run site -- --style editorial "a portfolio for a small ceramics studio"
npm run site -- --style signal "an independent AI lab in Cluj, precise and a little dramatic"
npm run site -- --style frame --images ~/Pictures/portfolio "an architectural photographer in Cluj"
npm run site -- "a site for a fictional mechanical watch"   # Claude picks; usually Film
```

Without a style, `/site` chooses one from the brief and says why in its report. A site whose brief has
no `style` (every site made before styles existed) is Film.

## The building blocks

Every style is made from the same parts in `src/stage/`. They're server components that render real
text, so all of them fall back to a plain readable page with no JavaScript or with reduced motion.

| Block | What it does | Used most in |
|---|---|---|
| `Section`, `Beat` | A section and its timed beats; pinned or `flow` | All |
| `Depth` | A layer of literal parallax | Film |
| `Words` | Words rising one after another | All |
| `Reveal` | Flow content rising in as it scrolls into view, and sinking back if you scroll up | Editorial, Signal |
| `Count` | A number counting up as it arrives, with the final value in the markup | Signal, proof sections |
| `Marquee` | An endless row; a wrapped list without motion | Signal |
| `LocalTime` | The time now in a city | Signal |
| `Plate` | Generated SVG cover art in the site's colors | Editorial, Signal |
| `Expand` | A photo growing from a small frame to the full screen, or back | Frame |
| `Sequence` | A pinned, numbered run of full-screen photos | Frame |
| `Carousel` | Photos to swipe or click through, with thumbnails | Frame |
| `Scatter` · `InlinePhoto` | Floating photo tiles, and a photo inside a sentence | Frame |
| `Mist` | A cloud bank drawn from SVG noise, between chapters | Frame |

`Plate` draws seven kinds of cover from a seed, and the same seed always gives the same plate:

| Kind | Draws | Suggests |
|---|---|---|
| `ridges` | Stacked ridge lines lifted by noise | Landscape, signal, sound |
| `orbits` | Tilted orbits with one body on its path | Systems, scale, attention |
| `horizon` | A floor grid running to a rising disc | Arrival, a place, a goal |
| `halftone` | A dot screen swelling toward one point | Density, a crowd, a signal in noise |
| `spectrum` | Bars of different weights, one lit | Data, rhythm, comparison |
| `stack` | Isometric slabs, slightly off true | Building, layers, a product |
| `glyph` | One huge character over a hairline grid | An index, a chapter, a name |

## What never changes

Styles change the design rules, never the engine's invariants:

- One canvas, one scene, one camera, one `requestAnimationFrame`.
- The look depends only on scroll, time and the pointer, so scrolling back undoes everything.
- The page works with no JavaScript, with reduced motion and without WebGL.
- No API keys, image models or downloaded assets. Every cover, object and world is code. The one
  exception is the owner's own photographs, for Frame.
- No invented facts for a real project. Readouts, numbers and clocks must be true or placeholders.
- `npm run check` holds every style to the same frame, weight and readability budgets.

## Adding a style

1. Write a guide in `.claude/skills/site/styles/<id>.md`, covering the identity, defaults for "auto"
   answers, the page, the 3D's role, covers, motion, a table of how each section skill is built in this
   style, and a review list. The existing guides show the shape.
2. Add the id to `SITE_STYLES` in `src/stage/style.ts`.
3. Add its menu and preloader to `src/stage/chrome.tsx`, with the fixed menu carrying the class
   `chapters` so the check can test for text under it, and its CSS to `src/app/globals.css`.
4. Add it to `STYLES` in `scripts/onboard/options.mjs` with a tagline and its usual section order,
   give it a preview in `scripts/onboard/page.html`, and tag suitable palettes and fonts with `suits`.
5. Add it to `STYLES` in `scripts/run-skill.mjs`, and to the style choice in `.claude/skills/site/SKILL.md`.
