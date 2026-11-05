// Everything the setup wizard offers. The page renders these, and the server validates against them.

export const SECTIONS = [
  { skill: "section-hero", slug: "hero", name: "Opening", about: "The name, a striking first image and the first scroll reveal.", required: "first" },
  { skill: "section-story", slug: "story", name: "Story", about: "A long pinned sequence where the subject changes as you scroll. The main event.", repeat: 2, default: true },
  { skill: "section-statement", slug: "statement", name: "Statement", about: "One huge line of type with 3D moving through it. A change of pace.", default: true },
  { skill: "section-features", slug: "features", name: "Features", about: "Cards or a sticky list that explain concrete details.", default: true },
  { skill: "section-gallery", slug: "gallery", name: "Gallery", about: "A sideways run of 3D plates, for variants, places or works. Generated, not photographs." },
  { skill: "section-proof", slug: "proof", name: "Proof", about: "Large numbers and quotes. Real businesses get placeholders to fill in.", default: true },
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
  { id: "bone", name: "Bone and vermilion", bg: "#ece8df", ink: "#121316", muted: "#625e55", accent: "#bf3a26" },
  { id: "paper", name: "Paper and cobalt", bg: "#f5f4ef", ink: "#14161c", muted: "#62646b", accent: "#1f4fe0" },
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
];

export const STYLES = [
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
  { id: "object", name: "One object", about: "A hero object stays on screen and changes, as in the Halden site." },
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
