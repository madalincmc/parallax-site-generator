// next/font downloads these at build time and serves them from this site, so nothing loads from
// another origin at runtime. Keep the two CSS variable names; globals.css depends on them.
// The same three families as Madalin's earlier site. --font-code is the mono of tickets and departure boards.
import { Archivo, Geist_Mono, Space_Grotesk } from "next/font/google";

const body = Archivo({ subsets: ["latin"], variable: "--font-body" });
const heading = Space_Grotesk({ subsets: ["latin"], variable: "--font-heading" });
const code = Geist_Mono({ subsets: ["latin"], variable: "--font-code" });

export const fontClasses = `${body.variable} ${heading.variable} ${code.variable}`;
