// next/font downloads these at build time and serves them from this site, so nothing loads from
// another origin at runtime. Keep the two CSS variable names; globals.css depends on them.
import { Archivo, Space_Grotesk } from "next/font/google";

const body = Archivo({ subsets: ["latin"], variable: "--font-body" });
const heading = Space_Grotesk({ subsets: ["latin"], variable: "--font-heading" });

export const fontClasses = `${body.variable} ${heading.variable}`;
