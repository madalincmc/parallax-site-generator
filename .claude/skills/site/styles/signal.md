# Style: Signal

**A control room for a brand.** A near-black ground, one electric accent, and an interface that
feels live: a loader counting from 000%, `STATUS //` readouts, local clocks, a scroll counter in the
corner, marquees of client names, bordered cells, crop marks and bracketed indices. At its center
sits one dramatic 3D **artifact**, lit like a product shot at night, which the page scans, turns and
opens. Precise, confident and a little theatrical.

What it borrows, in spirit and never in content, from studio sites like Aller: the counting loader
with a status line; local times of the studio's cities in the header; a split-line hero claim set
huge; client names looping in a marquee; industries or problems as short cards; case studies as tall
covers with a client, tags and one outcome line; numbered services; a four-step process; an FAQ; a
closing call to action; and a footer with the name set as a giant wordmark. Never copy their wording,
layouts or names.

## Defaults for "auto" answers

- **Theme:** dark. If the answers force light, keep the system: a cool light grey ground, black type,
  and the accent used as solid chips with black text on them (a bright accent can't be text on light).
- **Palette:** `--bg` near-black (not pure #000), `--ink` cool off-white, `--muted` mid-grey, and one
  acid or electric accent (lime, phosphor green, signal orange, electric blue). The wizard's Carbon and
  acid, and Ink and phosphor, suit it. The accent marks live things: the status dot, the current menu
  item, the hot cell, a cursor-like underline.
- **Fonts:** a technical display face set in uppercase (Rajdhani, Chakra Petch, Space Grotesk,
  Oxanium, Barlow Condensed), a neutral body (Inter, Inter Tight) and a mono for readouts (JetBrains
  Mono, Geist Mono, IBM Plex Mono) as `--font-code`. Fonts without a variable version, such as
  Rajdhani, need `weight` in their next/font call.
- **Look:** technical or brutalist. **Motion:** balanced or bold. **Length:** standard.

## The page

- **Mixed.** The hero is pinned (2.5 to 3.5 screens), with the artifact as its whole point. One or two
  more pins carry the drama: a `section-story` where the artifact is scanned or opened, or a statement.
  Everything else uses `Section flow` with `Reveal`.
- **Visible structure.** Hairline grid lines (`border-ink/10`), cells with 1px borders, `+` crop marks
  at the corners of key blocks, and labels in brackets: `[01]`, `[ SERVICES ]`, `// 2025`. Corners stay
  square. It should feel engineered, not decorated: every line aligns to something.
- **Readouts.** Small mono uppercase text at 0.65 to 0.75rem with 0.15em tracking, in `text-muted`,
  with the accent for live values. Use `//` as a separator. Readouts carry real information: the
  section number, a count of items, a year, a place. Never fake telemetry for a real project. If you
  write coordinates or versions, they must be true or plainly part of the fiction.
- **Type scale.** Display in uppercase, tight (line height 0.9, tracking -0.01em to -0.02em), at
  `clamp(3rem, 9vw, 9rem)` for heroes and closers, and split across lines on purpose. Body is short:
  two sentences per block, at most.
- **Chrome:** the engine draws a full-width bar: the name, a status dot with `brief.status`, a
  `LocalTime` for each of `brief.clocks`, chapter links and a `[042]` scroll counter. Set
  `brief.status` (for example "Available for new work", or `[placeholder: availability]` for a real
  project) and `brief.clocks` (for example `[{ city: "Cluj", zone: "Europe/Bucharest" }]`) in
  `src/site/brief.ts`. For a real project, add clocks only for places the user gave. The preloader
  is `STATUS // INITIALIZING` above a huge 000% counter.

## The artifact (the 3D)

- **One strong object, at night.** A faceted rock, a monolith, a crystal, a machine core, a sealed
  device, a meteorite cut open: whatever belongs to the brief, with real form and detail. Make it
  heavy and physical (`MeshPhysicalMaterial`, dark with sharp rim light in the accent's hue and a cold
  key light), against a near-black field with a little fog.
- **The scan.** Its signature move is a scan: a plane sweeping through the artifact, driven by `p`,
  that reveals a second version of it, wireframe, points or a cutaway in the accent color. Add the
  second version as a copy with a shader that clips along the scan plane. Use it in the hero and in
  one story, not everywhere.
- **Center, then aside.** It's the centerpiece in the hero and closer, framed by type. In flow sections
  it moves to an edge, small and turning, or drops out of frame as a reading break. Between sections it
  can return as a brief divider moment: a turn, a scan pass, a close pass by the camera.
- **HUD labels.** Point at parts of it with DOM readouts in `Beat`s (a thin line and a mono label, such
  as `CORE // 04`), framed where the part sits on screen. Keep them on the side away from body text.
- **Sparse atmosphere.** A few slow `dust` specks or a faint floor grid at most. No bloom or
  full-screen effects.
- **`world.ts` map:** a corridor or a ring of stations around the artifact. Give each act a camera
  station and the artifact's pose and state (whole, scanned, opened, reassembled).

## Covers

Use `Plate` from `@/stage/plate` for case-study covers, with the project's slug as the seed. `halftone`,
`spectrum`, `horizon` and `ridges` suit this style. Set them tall (ratio 3/4 or 4/5), with 1px borders,
a bracketed index in a corner and the client's name over the bottom edge in the display face.

## Motion vocabulary

- `Reveal` for flow blocks, with `order` staggered. Put `Words` in headings.
- `Count` for every figure, in bordered cells, with tabular numbers.
- `Marquee` for client names (typeset as wordmarks in the display face, or in mono), and once more for
  a running line in the closer. Run the two in opposite directions.
- Hover: cells fill with the accent at low opacity, or the border turns accent. Arrows `↗` on links.
  Snappy transitions of 0.2 to 0.35s.
- A bigger camera move is allowed at section changes, since this style can afford one sudden moment
  per section. Keep the rest controlled.

## Sections in this style

| Skill | In this style |
|---|---|
| `section-hero` | Pinned. A split-line uppercase claim of 2 to 4 short lines set huge around the artifact, which fills the center. Readouts in the corners (what, where, since when). A scroll cue: `SCROLL // 01`. Second beat: the scan passes through the artifact and a one-line introduction arrives. |
| `section-proof` | Flow. Clients in a `Marquee`, then 2 to 4 figures in a bordered row of cells with `Count`, each with a mono label. Quotes in bordered cards with a name and role. |
| `section-work` | Flow. Case-study cards: see that skill. |
| `section-features` | Flow. Services as numbered cells `[01]` to `[04]` in a bordered grid: a name in the display face, two lines, and a mono list. One cell can be larger. |
| `section-process` | Flow or a short pin. A horizontal track of 3 to 5 steps with an accent line that fills with `--p`, with numbers and names. |
| `section-story` | Pinned. The artifact is scanned, opened or rebuilt in 3 to 5 beats, with HUD labels on the parts. |
| `section-statement` | Pinned, short. One line in uppercase, wider than the screen, scrubbing sideways, with the artifact passing through the gap. |
| `section-gallery` | Bordered `Plate`s or in-world plates in a sideways scrub, each with a bracketed index. |
| `section-faq` | Flow. Bordered rows with a `+` that turns to `×`, and the question in the display face. |
| `section-closer` | Pinned, short, then flow. The artifact at rest in the center and a call to action as a large accent block or button. Then the footer: contact, links, `LocalTime`s and the name as a giant wordmark across the full width (`data-bleed`), cropped by the bottom of the page. |

## Review

Add these to the contract's list:

- **Does the interface feel live?** Clock, status dot, scroll counter, counts and marquees all working.
- **Does every line align?** Grid lines, cells and margins share one grid.
- **Is the accent rationed?** It marks what's live or current, plus one call to action, and nothing else.
- **Is anything fake?** Readouts, numbers and clocks must be true, part of a fiction, or placeholders.
