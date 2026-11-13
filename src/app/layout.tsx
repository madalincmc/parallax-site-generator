import type { Metadata, Viewport } from "next";
import { brief } from "@/site/brief";
import { fontClasses } from "@/site/fonts";
import { siteStyle } from "@/stage/style";
import "./globals.css";

export const metadata: Metadata = {
  title: brief.title,
  description: brief.description,
};

export const viewport: Viewport = {
  themeColor: brief.themeColor,
};

// Runs before first paint, so pinned layout never flashes in after the plain document.
const MOTION_SCRIPT = `document.documentElement.classList.add('js');if(!matchMedia('(prefers-reduced-motion: reduce)').matches)document.documentElement.classList.add('motion')`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang={brief.lang} className={fontClasses} data-style={siteStyle} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: MOTION_SCRIPT }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
