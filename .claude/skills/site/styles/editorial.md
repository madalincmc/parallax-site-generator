# Style: Editorial

**A studio's journal, set on screen.** Type leads and the page reads like a well-made printed
publication: a paper ground, big serif headings, small mono labels, hairline rules, numbered sections,
and an index of work you can scan. There's one sculptural 3D object, the **specimen**, set in the
margin like a photograph of a single thing on a table. Calm, confident and spacious.

What it borrows, in spirit and never in content:

- From studio sites like Glinto: a pale paper ground; a serif, a grotesk and a mono working together;
  short declarative copy; process as numbered steps (01 Briefing, 02 Strategy...); services split
  into a few named disciplines.
- From agency work pages like The Contenders: work as an index, where each project has a title, a
  one-line tagline, industry and service tags, and a "View project" link; one strong accent color; the
  next page teased at the bottom ("Next up").

Never copy wording, layouts or names from those sites. Use them only as a bar for craft.

## Defaults for "auto" answers

- **Theme:** light. Dark editorial is allowed when the answers ask for it: then it's ink-black paper
  with warm white type, still type-led.
- **Palette:** paper, near-black ink, a mid-grey muted, and one accent used sparingly: links, the
  current menu item, an index number, one word in a heading. The wizard's Mist and signal red, Paper
  and cobalt, and Bone and vermilion suit it.
- **Fonts:** three families. A display serif for headings (Instrument Serif, Newsreader, Fraunces,
  Cormorant Garamond, Playfair Display), a neutral grotesk for body (Inter Tight, Geist, Inter, DM Sans)
  and a mono for labels (JetBrains Mono, Geist Mono, IBM Plex Mono), as `--font-code` in
  `src/site/fonts.ts`. Fonts without a variable version, such as Instrument Serif, need `weight`
  (and `style: ["normal", "italic"]` if you use italics) in their next/font call.
- **Look:** editorial or luxurious. **Motion:** calm. **Length:** short to standard.

## The page

- **Mostly flow.** The hero is pinned (2 to 2.5 screens). One `section-story` may be pinned as a case
  study. Everything else uses `Section flow`, and content arrives with `Reveal` as it scrolls into
  view. A flow section's length is its content: generous, but never padded with empty screens.
- **A visible grid.** Work on 12 columns with wide outer margins (`px-[clamp(1.25rem,5vw,5rem)]`).
  Set text in columns, not centered blocks: a heading across 8 columns, its paragraph in columns 7 to
  12, a label in column 1. Leave real white space; it's what makes it expensive.
- **The section head.** Every flow section opens the same way, and this repetition is the identity:
  a hairline rule across the page (`border-t border-ink/15`), then on one line a mono label with its
  number, like `(02) Work`, and on the right a short mono note (a count, a year, "Selected 2021–2025").
  Then the heading, large.
- **Type scale.** Headings in the serif at `clamp(2.75rem, 7vw, 7.5rem)`, line height about 0.95,
  tracking about -0.03em, weight 400 (serifs look best light at this size). Italic, or the accent
  color, for one word at most. Body in the grotesk at 1rem to 1.25rem, `max-w-[38ch]` to `[60ch]`.
  Labels in mono, uppercase, 0.7rem, tracking 0.08em, `text-muted`.
- **Chrome:** the engine draws a full-width bar: the name at the left, numbered chapter links, and the
  Projects and Blog pages at the right. The preloader is the name set huge, with a thin accent line
  filling along the bottom. Pinned text must still clear the bar, as the contract says.

## The specimen (the 3D)

- **One object, on paper.** The thread is a single sculptural object rendered as if photographed in a
  daylight studio. Ceramic, stone, glass, brushed metal, paper folds, a machined part, a botanical
  form: whatever belongs to the brief, modeled with real thickness and bevels. Set the scene background
  and fog to the page's `--bg`, so the canvas reads as the same paper the text sits on. Use soft,
  bright light (a large key light and a low fill) and no glow, particles or sci-fi effects.
- **It lives in the margin.** Text owns some columns and the specimen owns the rest. Each act decides
  where the specimen sits for its section: large and right of center in the hero; small, high and
  turned in a statement; out at the far edge (or off screen) through a dense work index; stepping
  through a pose per step in the process. It must never sit behind body text. On phones, it goes
  above or between blocks, small.
- **Motion is a slow turn.** Scroll turns it, tilts it and moves it between margins; the pointer
  sways it slightly. Camera moves are small: a gentle dolly or orbit, never a flight. Between
  sections, the engine glides it to its next place, and that glide is the page's parallax.
- **Cheap by design.** One object and its light. Most acts are a camera pose, a thread pose and
  nothing else, which is fine and expected.
- **`world.ts` map:** instead of a corridor, the map gives each act the specimen's place and pose,
  for example `hero: right third, large, front 3/4 view; statement: top right, small, top view`.

## Covers

Use `Plate` from `@/stage/plate` for anything that would be an image elsewhere: work covers, case
study headers, the closer's "next up". Give every project its own seed (its slug), and keep the site
to two or three `kind`s that suit it, so the covers read as one series. `glyph` with the project's
index number makes a strong cover for text-heavy work. Or draw bespoke SVG as `Plate` children when
a project deserves a specific picture: simple, flat, in the site's colors, like a printed diagram.
Covers are flat with square corners or a 2px radius, never cards with shadows.

## Motion vocabulary

- `Reveal` for every block in a flow section, with `order` staggering neighbors (heading 0,
  paragraph 1, link 2). Put `Words` inside headings so they rise word by word.
- Hover: covers zoom slightly (built into `Plate`), rows underline their title, and an arrow `→`
  nudges right. Use transitions of 0.4 to 0.9s with `cubic-bezier(0.32, 0.72, 0, 1)`.
- `Count` for figures in proof. `Marquee` at most once on the page, usually in the closer as a running
  "Let's talk" line or a list of clients.
- No pinned text scrubbing sideways, no flashes and no fast camera moves.

## Sections in this style

| Skill | In this style |
|---|---|
| `section-hero` | Pinned. The name or a claim set huge in the serif across the page (it may bleed), a mono meta line (role, place, years), the specimen to one side. Second beat: a one-paragraph introduction and a "View all work →" link. |
| `section-statement` | Flow. A manifesto paragraph of 2 to 4 sentences set at `clamp(1.75rem, 3.6vw, 3.25rem)` in the serif, with one or two phrases in the accent or italic. Not one huge line. |
| `section-work` | Flow. The work index: see that skill. Usually the heart of the page. |
| `section-process` | Flow. Steps as full-width rows: big number, name, two lines, separated by hairlines. |
| `section-features` | Flow. Services as a few disciplines, each a column or row: name in the serif, a mono list of what's included. |
| `section-proof` | Flow. Two to four large figures with `Count` in a row of hairline-ruled cells, one long quote set large in the serif, and client names as a quiet list or one `Marquee`. |
| `section-story` | Pinned, at most one: a case study told in 3 or 4 beats while the specimen changes. |
| `section-gallery` | Rare here. If used, flat `Plate`s in a sideways scrub, captioned like a catalogue. |
| `section-faq` | Flow. Questions in the serif between hairlines, answers in the grotesk. |
| `section-closer` | Flow or a short pin. A huge contact line in the serif ("Let's make something", or the email itself as the link), the specimen at rest, then a real footer: columns for contact, elsewhere (social links) and pages, and a small colophon line. |

## Review

Add these to the contract's list:

- **Does it read as one publication?** Same section head, same label style and the same rule
  weight everywhere.
- **Is there air?** If a screen feels full, remove something rather than shrinking it.
- **Is the specimen ever behind text?** Move it, at every width.
- **Is the accent rare?** If it's on more than a few things per screen, it has stopped being an accent.
