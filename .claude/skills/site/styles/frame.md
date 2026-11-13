# Style: Frame

**Every picture, from a glimpse to the full screen.** A site for photographs: a photographer's or an
architect's portfolio, a studio, a place, a collection. The page is a calm, warm ground where pictures
arrive small (a card, a tile, a word-sized frame inside a sentence) and grow until they fill the screen,
then settle back into a gallery. Between chapters, a bank of mist rolls over everything. Type is quiet
and large, and there's no chrome to speak of, so the photographs carry the page.

What it borrows, in spirit and never in content, from residence and portfolio sites like Still / Form:
a full-bleed hero photograph with a serif title that shrinks into a framed card; a sentence with a tiny
photo set inside it, like a word; small photos scattered around a heading at different depths; a giant
marquee with one small photo at its center, which grows to fill the screen ("Scroll to enter"); a pinned
run of full-screen pictures, numbered 01 to 07 with a progress line; split slides and carousels with
thumbnails; cloud transitions between chapters; and a footer set in a framed card. Never copy wording,
layouts or names.

## The photographs

**This style is built from the owner's own photographs,** imported to `public/images/work/` with a
`manifest.json` of their sizes and orientations. They're the one kind of asset this project allows on
the home page, because they are the work being shown.

1. **Look at every photograph first.** Read each file in `public/images/work/` (the Read tool shows
   images). Note what it shows, its light, its color and where its subject sits in the frame.
2. **Write `src/site/images.ts`** exporting `photos: Picture[]` in manifest order: `src`, `width` and
   `height` from the manifest, and an `alt` that says what's in the picture in one plain sentence
   ("A white villa with a long pool under a blue sky"), never "image of" or a file name.
3. **Plan the sequence of pictures** before the sections: the hero (the strongest, with calm space
   for the title), the reveal (a picture that rewards growing: a wide view whose small version is
   intriguing), the pinned run (5 to 8 that belong together, such as details or one project), and
   the carousels (sets of 4 to 8, such as rooms or a series). Use each photograph once if there are
   enough. Prefer pictures whose subject is centered for frames that grow from the center.
4. **If there are no photographs,** say so in your report, and use `Plate` covers in their place, set
   at the same sizes. The style still works, but tell the user it's meant for their photographs and how
   to add them: `node scripts/onboard/images.mjs <folder>`, then rerun `/site`.

Credits: if the manifest has a `credit` for a picture, show it in small type near the picture or in a
credits line in the footer.

## Defaults for "auto" answers

- **Theme:** light and warm. A dark version ("darkroom") is allowed if the answers ask for it.
- **Palette:** a warm paper ground (linen, bone or pale stone), a warm near-black ink, a muted
  taupe, and an accent that's barely there: an umber or clay, used for one underline or a dot.
  The photographs bring all the color. The wizard's Linen and umber, and Gallery white, suit it.
- **Fonts:** a condensed display serif for titles (Instrument Serif, Newsreader, Cormorant Garamond)
  and a tight grotesk for everything else (Inter Tight, Geist, DM Sans), with headings in the grotesk at
  large sizes and -0.045em tracking where the serif would be too soft. Small labels are uppercase at
  10 to 11px with 0.18em tracking. Fonts without a variable version, such as Instrument Serif, need
  `weight` (and `style: ["normal", "italic"]`) in their next/font call.
- **Look:** luxurious or editorial. **Motion:** calm or balanced. **Length:** standard.

## The page

- **Pinned for the big moves, flow for galleries.** Hero, statement, reveal and the numbered run are
  pinned; carousels, the work list and the footer flow.
- **Photographs first.** On most screens, a photograph is the largest thing. Text is short and sits on
  paper beside a photo, or over a full-screen one with `shade`. A heading is 2 to 7 words.
- **Rounded frames, generous margins.** Framed photos have a 12 to 16px radius and sit inside
  `p-3 md:p-5 lg:p-8` of the screen edge when not full bleed, like a print on a page.
- **Chrome:** the engine draws a transparent bar: the name at the left and "Menu ⠿" at the right,
  which opens the chapter list (a native `details`, so it needs no JavaScript), in white with
  difference blending so it reads over photographs and paper alike. The preloader is the name in the
  serif, with a thin frame that grows from a small card toward the full screen as the page loads.
- **Mist between chapters.** Two or three times on the page, end a pinned section with
  `<Mist from={0.8} to={1} />` and start the next one with `<Mist from={0} to={0.18} clear />`, so a
  cloud bank covers the change. Not between every section.

## The 3D

The photographs are the subject, so the 3D steps almost entirely back. **The canvas is the paper:**
every act's `mood` uses the page's `--bg` with no fog, the camera is still, and there's no thread.
`world.ts` needs only that, and its map says so: `// Frame: the canvas is the paper behind the
photographs; acts set the page color and nothing else.` If the brief has a strong object, a single
small one may appear in the hero or closer, but never compete with a photograph. Frame times will be
tiny, which is right.

## Building blocks

All from `@/stage/frames`, driven by the section's `--p`. Read `src/stage/frames.tsx` before using them.

| Block | Use it for |
|---|---|
| `Expand` | The signature move. A photo grows from a frame (`start`, in percent of the screen) to the full screen, or the reverse with `start` full and a card as `end`. Phones get a matching frame automatically, or pass `phone`. Place it directly in a pinned `Section`, before the `Beat`s over it. Use `shade` (0.2 to 0.35) when text sits over it full screen |
| `Sequence` | The pinned run: full-screen photos wiping up one over the next, with title, note, a big index, a progress line and dots. About 0.8 screens per photo |
| `Carousel` | Swipeable or clickable photos with prev/next, a counter and `thumbs`. Works without JavaScript. Use in flow sections, or in a Beat of a pinned split slide |
| `Scatter` | Small photos floating around a pinned heading at different depths. Desktop only |
| `InlinePhoto` | A word-sized photo inside a heading or sentence |
| `Mist` | The cloud bank between chapters |
| `Photo` | Any other photo at its own proportions, with optional `drift` |

`Marquee`, `Reveal`, `Words` and `Count` from `@/stage/dom` work here as everywhere. A common
pattern is a huge `Marquee` of a name in a Beat from 0 to 0.3, with an `Expand` starting small in its
middle, so the picture grows out of the type.

## Sections in this style

| Skill | In this style |
|---|---|
| `section-hero` | Pinned, length 3. The strongest photograph full bleed (`Expand` with `start` full, `priority`, `shade` 0.25) with the name or claim in the serif over it, a meta line (what, where, year) and a scroll cue. Between p 0.25 and 0.75 it shrinks into a framed card on one side, and the second beat's line arrives on the paper beside it. |
| `section-statement` | Pinned, length 2.5. One sentence of 8 to 14 words in the grotesk at `clamp(2rem, 4.6vw, 4.4rem)`, centered, with an `InlinePhoto` before its first word, and a `Scatter` of 4 to 6 small photos around it. |
| `section-gallery` | Pinned, length about 4: the reveal. A huge `Marquee` of the name or a title, a small photo in its middle that `Expand`s to full screen, then a title over it, and `Mist` at the end. |
| `section-story` | Pinned: the numbered run, a `Sequence` of 5 to 8 photos with a title and a short note each. Start it with `Mist clear`. Put a small visible `h2` label in a Beat at the top left. |
| `section-carousel` | Flow, or a short pin: sets of photos as carousels and split slides. See that skill. |
| `section-work` | Flow. Projects as large photos, one per row or two per row at different sizes, each with a title, a year and a one-line note, linking to the project. Use `Photo` with `drift` 6 to 10. |
| `section-features` | Flow. Services or offerings as a list with a small photo for each. |
| `section-proof` | Flow. Quiet: two or three figures and a quote, set beside a photograph. |
| `section-process` | Flow. Steps as rows, each with a small photo. |
| `section-faq` | Flow. As the FAQ skill describes, in the grotesk, with hairlines. |
| `section-closer` | Flow. A framed card (`rounded-2xl border border-ink/15`) with the serif tagline at `clamp(3rem, 10vw, 8rem)`, one call to action, columns of links (explore, follow) and a small colophon with photo credits. Optionally one last photo before it, shrinking into the card. |

## Review

Add these to the contract's list:

- **Does every photograph earn its size?** A blurry or busy picture should never go full screen.
- **Is text readable over every photo?** Check every frame of the sheets where text is over a picture.
- **Does each grow or shrink start and end somewhere deliberate,** aligned with the text beside it?
- **Phones:** do the frames look intentional at portrait size? Pass `phone` frames where they don't.
- **Weight:** the first screen loads only the hero photo at full size (the check's image budget).
