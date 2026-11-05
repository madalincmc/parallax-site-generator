# The section contract

Every section skill follows this. Claude is the only AI here, and everything on screen comes from
code: no image or video models, API keys, downloads or external assets. The check fails on any
request off the site.

## How the site works

There is one fixed canvas, one scene and one camera behind the whole page. Each section adds an
**act** to that scene, and page content scrolls over it. While a section is pinned, its act drives the
camera. In the one screen of scrolling between two sections, the engine eases the camera, the thread
and the mood from the last pose of one act to the first pose of the next. There are no cuts, so
continuity depends on acts leaving and arriving in compatible places.

Read `src/site/brief.ts` first, then the comment at the top of `src/site/world.ts`, which assigns
each act its place in the world. Never start a new visual idea: advance `brief.story`. If the skill's
arguments carry instructions from the user's setup answers, they take priority over this file's
suggestions.

## Files

A section called `<slug>` is two files, registered in two lists:

- `src/sections/<slug>/section.tsx`: the page content, a server component
- `src/sections/<slug>/act.ts`: its part of the 3D world
- `src/site/sections.tsx`: page order, and the label shown in the chapter index
- `src/site/acts.ts`: `<slug>: () => import("@/sections/<slug>/act")`

Only edit `src/site/` and `src/sections/`. `src/stage/` is shared by every section. The starter
`src/sections/hero` and `src/sections/closer` are working examples of this contract.

## Page content

```tsx
import { Beat, Depth, Section, Words } from "@/stage/dom";

export default function Example() {
  return (
    <Section slug="example" length={3} label="Example">
      <Beat from={0} to={0.4} className="items-center justify-center text-center">
        <h2 className="font-display text-[clamp(2rem,6vw,5rem)]"><Words text="Short heading" /></h2>
        <Depth speed={-0.15}><p className="text-muted max-w-md">Supporting line.</p></Depth>
      </Beat>
    </Section>
  );
}
```

- `Section`: `length` is its height in screens, so it stays pinned for `length - 1` screens of
  scrolling. Allow about 1 screen per beat. `flow` turns pinning off, for content taller than a
  screen. `tone="light"` and `tone="dark"` switch text to `--ink-on-light` and `--ink-on-dark`; set a
  matching `mood` on the act.
- `Beat from to`: shows content across that slice of progress. Use `from={0}` for content already
  there on arrival, and `to={1}` for content still there on leaving. Pinned beats fill the screen as
  a flex column, so `className` places them. Keep gaps between beats short, because a stretch with no
  text feels broken unless the 3D is clearly the point.
- `Depth speed`: literal parallax. It moves `speed` screen-heights over the section, and negative
  moves it the other way.
- `Words text`: words that rise in as the beat arrives.
- **CSS variables:** the section sets `--p` (0..1) and each beat sets `--q` (0..1), usable anywhere
  inside, for example `style={{ transform: "translateX(calc(var(--p) * -60%))" }}`. Scroll-linked
  motion goes through these. Don't add a scroll listener, GSAP or a second animation loop: there is
  one clock.
- **Vary the composition.** Never use the same layout for two beats in a row, across sections too.
  "Heading and paragraph, centered vertically on one side" is the default to avoid. Each beat picks
  one, and the camera frames the subject around it:
  - **Corners:** heading high on one side, detail low on the other, subject between them
  - **Caption:** macro shot, with one line along the bottom edge
  - **Crown:** centered line on top, subject low and cropped by the screen
  - **Statement:** type 8vw or larger is the subject, and the 3D steps back to a corner
  - **Gap:** huge words or digits to each side, with the subject between them
  - **Spec:** large figures in a row with small labels
  - **Diagonal:** two pieces of text in opposite corners, with the subject in the middle
- The chapter menu sits in the band above the beats' top padding, so keep pinned text out of it.
- Mark oversized type that bleeds off screen on purpose with `data-bleed` on a wrapper. The check
  otherwise fails text that runs off the screen.
- Use the tokens `text-ink`, `text-muted`, `text-accent`, `bg-bg` and `font-display`. Don't invent
  colors in sections.
- Every section needs a real `h1` or `h2`. Avoid client components unless a section can't work
  without one.
- **Plain fallback:** with no JavaScript or with reduced motion, the same markup becomes a normal
  document with the beats stacked. Never rely on the 3D to carry information, and never hide text in
  plain CSS outside `.motion`.

**Copy:** write as a real brand would: specific, short, and with one idea per beat. If `brief.kind` is
`"fictional"`, invented numbers and quotes are fine. If it's `"real"`, never invent facts, numbers,
prices or testimonials; use only what the user or their site provided, write
`[placeholder: what goes here]` for the rest, and list them in your report.

## The act

```ts
import * as THREE from "three";
import { segment, track } from "@/stage/kit";
import type { ActFactory } from "@/stage/types";

const act: ActFactory = (world) => {
  const group = new THREE.Group(); // only drawn while this act is on screen
  return {
    group,
    camera(p, aspect) {
      return { position: track([[0, [0, 1, 8]], [1, [3, 1, 5]]], p), target: [0, 1, 0], fov: 38 };
    },
    thread(p, aspect) { return { position: [0, 1, 0], rotation: [0, p * 3, 0], scale: 1 }; }, // optional
    mood(p) { return { background: "#07090f", fog: "#07090f", fogDensity: 0.03 }; },          // optional
    update({ p, weight, t, dt, pointer, aspect, isPhone }) {},
    dispose() {},                                                                             // optional
  };
};
export default act;
```

Rules:

- **Stay pure.** The look depends only on `p`, `t` and `pointer`. Scrolling backwards must undo
  everything, so never accumulate state across frames.
- **Fade with `weight`.** It's 1 while pinned and eases to 0 as the next act takes over. Anything
  visible must leave gracefully: pass it to `tick()`, use `fader`, or rely on distance and fog.
- **Hand over cleanly.** `camera(0)` and `camera(1)` are where the engine picks up and sets down, so
  keep them on the side of your region facing your neighbors. Check the straight line between your
  last pose and the next act's first pose doesn't pass through anything solid.
- **The thread can be reshaped.** `world.thread` is an `Object3D`, and acts may move its children,
  so an exploded view is the thread itself coming apart. Put any such pose in `update` from `p`, and
  make sure the next act can pick it up.
- **Keep the subject clear of text.** Decide which part of the screen each beat's text uses, and
  frame the subject in the other part. On `aspect < 1`, move the subject up and text to the bottom.
- **The canvas is behind the page.** 3D can't cover DOM text. To have type read as passing behind an
  object, frame the object in a gap between words.
- **Stay cheap.** This runs on laptops. Aim for under 40 draw calls and 400k triangles per act, use
  `instanced` for repeats and shaders for motion. Avoid full-screen post-processing, and shadows from
  more than one light. `isPhone` should cut counts by at least half.
- **Be deterministic.** Use `rng(seed)`, not `Math.random`. No `fetch`, loaders, workers, `eval`,
  `new Function` or `Date`.

`@/stage/kit` has `segment`, `track`, `remap`, `lerp`, `smooth`, `rng`, `noise2`, `fbm2`, `GLSL_NOISE`,
`studioEnvironment`, `canvasTexture`, `dust`, `glowLine`, `terrain`, `instanced` and `fader`. It's
short, so read it. Things it lacks belong inside your act.

## What makes it look expensive

Procedural work reads as cheap when it stops at primitives. Spend your effort here:

- **Real structure.** Model what the real thing has: bevels, thickness, seams, layered parts, an
  underside. Bevel hard edges, since a perfectly sharp edge has no highlight and looks fake.
- **Materials from light.** `MeshPhysicalMaterial` with `scene.environment` does most of the work.
  Add surface variation with `canvasTexture` for roughness or bump. Flat roughness looks like plastic.
- **Scale and depth.** Near, middle and far layers moving at different speeds are what parallax is.
  A foreground element sliding past the camera sells depth better than anything else.
- **Type as a design element.** Oversized headings and tight tracking, with small labels for contrast.
- **One restrained palette.** Mostly one dark or light field, with one saturated accent.

## Check it

```
node scripts/check.mjs --section <slug>
```

It builds the site and fails on broken builds, browser errors, off-site requests, frame budgets on
the integrated GPU, sideways scrolling, text running off screen or overlapping, and text lost with
reduced motion, without JavaScript or without WebGL. It prints frame times per section.

Then Read `checks/<slug>.png` (progress 0, 0.2, 0.4, 0.6, 0.8 and 1) and `checks/phone.png` (the
section at 0, 0.5 and 1). Critique honestly:

- Is all text readable over what's behind it, at every point?
- Does this look designed, or like primitives in a void?
- Is something clearly changing across the sheet, and does it reward scrolling?
- Does the phone version look intentional?

Fix what's wrong and rerun, up to 3 rounds. If text is hard to read, change the camera or move the
text before adding a dark box behind it. Never report success while the check is failing.
