"use client";

import { useEffect, useRef } from "react";
import { createClock } from "./clock";
import type { Engine } from "./engine";
import { acts, loadWorld } from "@/site/acts";

const PRELOADER_LIMIT_MS = 2500; // the page's text must never wait long for decoration

type StageApi = {
  clock: ReturnType<typeof createClock>;
  engine: () => Engine | null;
  failure: () => string | null;
};

declare global {
  interface Window {
    __stage?: StageApi;
  }
}

/** The fixed canvas behind the page, and the clock everything on the page moves by. */
export function Stage() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = document.documentElement;
    const clock = createClock();
    let engine: Engine | null = null;
    let failure: string | null = null;
    let cancelled = false;

    const ready = () => root.classList.add("ready");
    const limit = window.setTimeout(ready, PRELOADER_LIMIT_MS);
    const counter = document.querySelector<HTMLElement>("[data-preloader-count]");
    const onProgress = (share: number) => {
      if (counter) counter.textContent = `${Math.round(share * 100)}%`;
    };
    window.__stage = { clock, engine: () => engine, failure: () => failure };

    const saveData = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData;
    if (saveData) {
      ready();
    } else {
      // Loaded on its own so three.js never delays the page's first paint.
      Promise.all([import("./engine"), loadWorld()])
        .then(async ([{ createEngine }, createWorld]) => {
          if (cancelled || !ref.current) return;
          const created = await createEngine({ el: ref.current, clock, createWorld, acts, onProgress });
          if (cancelled) created.destroy();
          else engine = created;
        })
        .catch((error: Error) => {
          // No WebGL, or a failed chunk: the text sits on the page color and everything still works.
          failure = error.message;
          root.classList.add("no-stage");
        })
        .finally(() => {
          window.clearTimeout(limit);
          if (!cancelled) ready();
        });
    }

    return () => {
      cancelled = true;
      window.clearTimeout(limit);
      engine?.destroy();
      clock.destroy();
    };
  }, []);

  return <div ref={ref} aria-hidden="true" className="stage" />;
}
