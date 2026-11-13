// Everything the setup wizard offers. The page renders these, and the server validates against them.

// The site styles. Each has a guide at .claude/skills/site/styles/<id>.md that /site and every section
// skill follow. `sections` is the running order the wizard starts from.
export const STYLES = [
  {
    id: "film",
    name: "Film",
    tagline: "One continuous take",
    about: "A 3D world fills the screen and the camera travels through it as you scroll. Sections pin and scrub like scenes in one shot.",
    sections: ["section-hero", "section-story", "section-statement", "section-features", "section-proof", "section-closer"],
  },
  {
    id: "editorial",
    name: "Editorial",
    tagline: "A studio's journal, set on screen",
    about: "Type-led and calm, on a paper ground. Big serif headings, numbered sections, an indexed list of work with generated covers, and one sculptural 3D object in the margin.",
    sections: ["section-hero", "section-statement", "section-work", "section-process", "section-proof", "section-closer"],
  },
  {
    id: "signal",
    name: "Signal",
    tagline: "A control room for a brand",
    about: "Dark, with one electric accent. System readouts, live clocks, running marquees, case-study cards and a huge wordmark, around one dramatic 3D artifact.",
    sections: ["section-hero", "section-proof", "section-work", "section-process", "section-faq", "section-closer"],
  },
];

// `styles` limits a section to some styles (all when absent). `aboutBy` rewords it for a style.
export const SECTIONS = [
  { skill: "section-hero", slug: "hero", name: "Opening", about: "The name, a striking first image and the first scroll reveal.", required: "first" },
  { skill: "section-story", slug: "story", name: "Story", about: "A long pinned sequence where the subject changes as you scroll. The main event.", repeat: 2,
    aboutBy: { editorial: "One pinned case study, told in a few beats while the object changes.", signal: "A pinned sequence where the artifact is scanned, opened or rebuilt." } },
  { skill: "section-statement", slug: "statement", name: "Statement", about: "One huge line of type with 3D moving through it. A change of pace.",
    aboutBy: { editorial: "A manifesto paragraph set large, with a few words picked out." } },
  { skill: "section-features", slug: "features", name: "Features", about: "Cards or a sticky list that explain concrete details.",
    aboutBy: { editorial: "Services or capabilities, as a numbered list by category.", signal: "Services or capabilities, as numbered cells in a bordered grid." } },
  { skill: "section-work", slug: "work", name: "Work", about: "An index of projects or case studies, with tags and generated covers.", styles: ["editorial", "signal"] },
  { skill: "section-process", slug: "process", name: "Process", about: "How you work, as numbered steps from brief to launch." },
  { skill: "section-gallery", slug: "gallery", name: "Gallery", about: "A sideways run of 3D plates, for variants, places or works. Generated, not photographs." },
  { skill: "section-proof", slug: "proof", name: "Proof", about: "Large numbers and quotes. Real businesses get placeholders to fill in.",
    aboutBy: { signal: "Client names in a running marquee, then large numbers. Real businesses get placeholders." } },
  { skill: "section-faq", slug: "faq", name: "Questions", about: "Common questions with short answers, opening one at a time.", styles: ["editorial", "signal"] },
  { skill: "section-closer", slug: "closer", name: "Ending", about: "The final image, the call to action and the footer.", required: "last" },
];

export const THEMES = [
  { id: "auto", name: "Let Claude choose", about: "Decided from your project." },
  { id: "dark", name: "Dark", about: "A dark page throughout." },
  { id: "light", name: "Light", about: "A light page throughout." },
  { id: "dark-flash", name: "Dark with one flash", about: "Dark, with one light section as punctuation." },
];

export const PALETTES = [
  { id: "graphite", name: "Graphite and ruby", bg: "#0a0b0d", ink: "#ece8df", muted: "#94928b", accent: "#e4475a" },
  { id: "midnight", name: "Midnight and cyan", bg: "#050a1f", ink: "#eaf2ff", muted: "#8b99bd", accent: "#37a6ff" },
  { id: "ember", name: "Cork and ember", bg: "#17120e", ink: "#f4ece0", muted: "#a8988a", accent: "#e8742c" },
  { id: "forest", name: "Forest and moss", bg: "#0b130f", ink: "#e9efe6", muted: "#8ba08f", accent: "#9bd36a" },
  { id: "violet", name: "Noir and violet", bg: "#0f0b1a", ink: "#efeaff", muted: "#9a92b0", accent: "#a97bff" },
  { id: "bone", name: "Bone and vermilion", bg: "#ece8df", ink: "#121316", muted: "#625e55", accent: "#bf3a26", suits: ["editorial"] },
  { id: "paper", name: "Paper and cobalt", bg: "#f5f4ef", ink: "#14161c", muted: "#62646b", accent: "#1f4fe0", suits: ["editorial"] },
  { id: "mist", name: "Mist and signal red", bg: "#edf2f9", ink: "#0f141b", muted: "#5b6573", accent: "#e01b24", suits: ["editorial"] },
  { id: "carbon", name: "Carbon and acid", bg: "#121212", ink: "#f2f4f5", muted: "#8f949a", accent: "#d5fe00", suits: ["signal"] },
  { id: "terminal", name: "Ink and phosphor", bg: "#0b0f0e", ink: "#e6efe9", muted: "#7f8f88", accent: "#2dc656", suits: ["signal"] },
];

// Every name here is in next/font's list. The server checks custom names against the same list.
export const FONTS = [
  { id: "didone", name: "Fashion serif", heading: "Bodoni Moda", body: "Instrument Sans" },
  { id: "grotesk", name: "Technical", heading: "Space Grotesk", body: "Archivo" },
  { id: "warm", name: "Warm editorial", heading: "Fraunces", body: "Inter" },
  { id: "classic", name: "Classic", heading: "Playfair Display", body: "Source Sans 3" },
  { id: "wide", name: "Expressive", heading: "Syne", body: "DM Sans" },
  { id: "round", name: "Bold and round", heading: "Unbounded", body: "Manrope" },
  { id: "plex", name: "Engineered", heading: "IBM Plex Serif", body: "IBM Plex Sans" },
  { id: "poster", name: "Poster", heading: "Anton", body: "Work Sans" },
  { id: "studio", name: "Studio serif", heading: "Instrument Serif", body: "Inter Tight", suits: ["editorial"] },
  { id: "journal", name: "Journal", heading: "Newsreader", body: "Geist", suits: ["editorial"] },
  { id: "hud", name: "Instrument", heading: "Rajdhani", body: "Inter", suits: ["signal"] },
  { id: "console", name: "Console", heading: "Chakra Petch", body: "Inter Tight", suits: ["signal"] },
];

// Art direction within a style: the adjective the whole site leans toward.
export const LOOKS = [
  { id: "auto", name: "Let Claude choose" },
  { id: "cinematic", name: "Cinematic" },
  { id: "editorial", name: "Editorial" },
  { id: "technical", name: "Technical" },
  { id: "luxurious", name: "Luxurious" },
  { id: "playful", name: "Playful" },
  { id: "brutalist", name: "Brutalist" },
];

export const THREADS = [
  { id: "auto", name: "Let Claude choose", about: "Decided from your project." },
  { id: "object", name: "One object", about: "A hero object stays on screen and changes as you scroll." },
  { id: "journey", name: "One journey", about: "The camera travels through one continuous landscape." },
];

export const MOTIONS = [
  { id: "calm", name: "Calm", about: "Slow, with room to read." },
  { id: "balanced", name: "Balanced", about: "Slow sections with a few fast moments." },
  { id: "bold", name: "Bold", about: "Big camera moves and sudden changes." },
];

export const LENGTHS = [
  { id: "short", name: "Short", about: "About 15 screens of scrolling." },
  { id: "standard", name: "Standard", about: "About 25 screens of scrolling." },
  { id: "long", name: "Long", about: "About 40 screens of scrolling." },
];

// From the one real run measured so far. Update this when more runs are measured.
export const MEASURED_RUN = { minutes: 24, tokens: "5.4 million", sections: 7 };
