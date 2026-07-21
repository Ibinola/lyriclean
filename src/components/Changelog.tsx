"use client";

import { useState } from "react";

interface Release {
  version: string;
  date: string;
  title: string;
  items: { label: string; detail: string }[];
}

const releases: Release[] = [
  {
    version: "v0.5",
    date: "2026-07-21",
    title: "Error Boundary, Toasts, Loading States",
    items: [
      {
        label: "Error handling",
        detail: "ErrorBoundary catches React crashes with 'Try again' fallback",
      },
      {
        label: "Toast notifications",
        detail: "Success/error/info toasts with auto-dismiss for copy, export, clean actions",
      },
      {
        label: "Loading states",
        detail: "Clean button and Export dropdown show spinners and disable during operations",
      },
    ],
  },
  {
    version: "v0.4",
    date: "2026-07-21",
    title: "Test Suite",
    items: [
      {
        label: "75 unit tests",
        detail: "vitest suite covering clean, spellcheck, duplicates, expansion, and parsing",
      },
    ],
  },
  {
    version: "v0.3",
    date: "2026-07-20",
    title: "Duplicate Detection & Smarter Cleaning",
    items: [
      {
        label: "Duplicate detection",
        detail: "Jaccard similarity ≥75% flags similar sections with remove/rename/keep",
      },
      {
        label: "Smarter filler detection",
        detail: "Ratio-based classifier replaces fragile regex patterns",
      },
      {
        label: "Better annotation handling",
        detail: "Voice annotations only stripped alongside x-numbers",
      },
    ],
  },
  {
    version: "v0.2",
    date: "2026-07-20",
    title: "Lyrics Lookup & Section Expansion",
    items: [
      { label: "Lyrics search", detail: "Modal with Genius API + cheerio scrape, LRCLIB REST API" },
      {
        label: "Cascading fetch",
        detail: "Genius → LRCLIB → African Gospel Lyrics fallback chain",
      },
      {
        label: "Smart spellcheck",
        detail: "Auto-corrects 80+ worship lyric typos with case preservation",
      },
      {
        label: "Section expansion",
        detail: "(Refrain) references auto-expand with actual section content",
      },
      { label: "Multi-language", detail: "Hungarian and Italian section label aliases" },
    ],
  },
  {
    version: "v0.1",
    date: "2026-07-19",
    title: "Core Pipeline & UI",
    items: [
      {
        label: "7-stage pipeline",
        detail: "ANSI → emoji → filler → sections → annotations → bullets → blanks",
      },
      { label: "Drag & drop", detail: "dnd-kit sortable slide reordering" },
      { label: "Export", detail: "EasyWorship XML, ProPresenter text, PowerPoint (pptxgenjs)" },
      { label: "Dark mode", detail: "No-flash inline script before React hydration" },
      { label: "Custom tour", detail: "Replaced react-joyride with responsive tooltip/modal" },
    ],
  },
];

export default function Changelog() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="text-xs text-muted-foreground underline underline-offset-2 transition-colors hover:text-foreground"
      >
        What&rsquo;s new
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center pt-[8vh] sm:pt-[12vh]"
          onClick={() => setOpen(false)}
        >
          <div className="fixed inset-0 bg-black/40" />
          <div
            className="relative z-10 mx-4 w-full max-w-lg rounded-xl border bg-card shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b px-5 py-3.5">
              <h2 className="flex items-center gap-2 text-sm font-semibold">
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M12 20h9" />
                  <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
                </svg>
                What&rsquo;s New
              </h2>
              <button
                onClick={() => setOpen(false)}
                className="text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                &#x2715;
              </button>
            </div>

            <div className="max-h-[65vh] overflow-y-auto p-5">
              {releases.map((release) => (
                <div key={release.version} className="mb-5 last:mb-0">
                  <div className="mb-2 flex items-baseline gap-2.5">
                    <span className="rounded-md border bg-muted px-2 py-0.5 text-[11px] font-semibold tabular-nums text-muted-foreground">
                      {release.version}
                    </span>
                    <span className="text-[11px] text-muted-foreground">{release.date}</span>
                    <span className="ml-auto text-xs font-medium text-foreground">
                      {release.title}
                    </span>
                  </div>
                  <ul className="space-y-1.5">
                    {release.items.map((item, i) => (
                      <li
                        key={i}
                        className="flex items-baseline gap-2 text-xs text-muted-foreground"
                      >
                        <span className="mt-[3px] h-1 w-1 shrink-0 rounded-full bg-muted-foreground/40" />
                        <span>
                          <span className="font-medium text-foreground">{item.label}:</span>{" "}
                          {item.detail}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}

              <a
                href="https://github.com/Ibinola/lyriclean/blob/main/SHIPPED.md"
                target="_blank"
                rel="noopener"
                className="mt-4 block text-center text-[11px] text-muted-foreground underline underline-offset-2 transition-colors hover:text-foreground"
              >
                View full shipping log on GitHub &#8599;
              </a>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
