# Parallax site

Type a brief, get a scroll-driven three.js website on Next.js. Claude Code writes the scenes, the copy
and the layout as code, with no image models, downloaded assets or extra costs.

```bash
npm install
npm run create
```

A setup page opens in your browser. It asks about your project and, if you have one, your existing
site's public GitHub repo. You then choose your sections, theme, colors, fonts and style, and press
**Create site**. Answering uses none of your Claude usage. When the site is built, the page gives you a
link to it.

Prefer one line? `npm run site -- "a site for a fictional mechanical watch, dark and precise"`, or type
`/site <brief>` in Claude Code.

## What it costs

Answering the setup page is free. Generating draws on your Claude Code usage, with no additional cost. The
one 7-section site measured so far took about 24 minutes and 5.4 million tokens, so expect it to vary.

## Your existing site

If you add a public GitHub repo, the new site can use its colors, fonts and wording. Your repo isn't
changed, and its code is never checked out, installed or run: the setup page only reads selected text
files. Images aren't used, since everything on screen is generated.

Each new site saves the previous one to `.archive/`. To go back, copy its `site` and `sections` folders over
the ones in `src/`.

## How it works

The page has **one fixed canvas, one scene and one camera**. Each section adds an act to that scene,
and the engine eases the camera, a shared object and the mood between acts as you scroll, so sections
read as one continuous take.

| Skill | Builds |
|---|---|
| `/site` | The whole site: plans the story and world, calls the skills below, then fixes the seams |
| `/section-hero` | The opening and first reveal |
| `/section-story` | A long pinned sequence, the main event |
| `/section-statement` | One huge line of type with 3D moving through it |
| `/section-features` | Cards or a sticky index for concrete details |
| `/section-gallery` | A sideways run of procedural plates |
| `/section-proof` | Numbers and quotes |
| `/section-closer` | The final image, call to action and footer |

Each section skill also works alone, for example `/section-statement slug=claim: "Nothing is wasted"`.

## Checks

`npm run check` builds the site and fails on browser errors, off-site requests, frame budgets on the
integrated GPU, sideways scrolling, text running off screen or overlapping, or text lost with reduced
motion, without JavaScript or without WebGL. It writes contact sheets to `checks/`.

## Limitations

- Everything on screen is procedural, so sites that depend on photographs need a different idea.
- Claude reviews stills, not playback. A person still has to scroll through it.
- It generates one site per copy of this project.
