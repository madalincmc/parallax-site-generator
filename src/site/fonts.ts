// next/font downloads these at build time and serves them from this site, so nothing loads from
// another origin at runtime. Keep the two CSS variable names; globals.css depends on them.
import { Instrument_Serif, JetBrains_Mono } from "next/font/google";

const body = JetBrains_Mono({ subsets: ["latin"], variable: "--font-body" });
const heading = Instrument_Serif({ subsets: ["latin"], weight: "400", variable: "--font-heading" });

export const fontClasses = `${body.variable} ${heading.variable}`;
