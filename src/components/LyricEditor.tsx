"use client";

import { Card } from "@/components/ui/card";
import { useCallback, useState } from "react";
import SortableSections from "@/components/SortableSections";
import LyricsSearch from "@/components/LyricsSearch";
import type { DuplicateGroup } from "@/lib/detectDuplicates";

interface LyricEditorProps {
  input: string;
  output: string;
  slides: string[];
  duplicates: DuplicateGroup[];
  onInputChange: (val: string) => void;
  onOutputChange: (val: string) => void;
  onSlidesReorder: (slides: string[]) => void;
  onLyricsFound: (lyrics: string, title: string, artist: string) => void;
  onDuplicateRemove: (paraIndex: number) => void;
  onDuplicateRename: (paraIndex: number, newHeader: string) => void;
}

function nextHeader(header: string): string | null {
  const m = header.match(/^(\D+?)\s*(\d*)$/);
  if (!m) return null;
  const base = m[1].trim();
  const num = m[2] ? parseInt(m[2], 10) : 1;
  return base + " " + (num + 1);
}

export default function LyricEditor({
  input,
  output,
  slides,
  duplicates,
  onInputChange,
  onOutputChange,
  onSlidesReorder,
  onLyricsFound,
  onDuplicateRemove,
  onDuplicateRename,
}: LyricEditorProps) {
  const [showEmpty, setShowEmpty] = useState(true);
  const [showLyricsSearch, setShowLyricsSearch] = useState(false);
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());

  const handleReorder = useCallback(
    (newSlides: string[]) => {
      onSlidesReorder(newSlides);
    },
    [onSlidesReorder],
  );

  const handleEditSlide = useCallback(
    (index: number, text: string) => {
      const updated = [...slides];
      updated[index] = text;
      onSlidesReorder(updated);
    },
    [slides, onSlidesReorder],
  );

  const visibleDuplicates = duplicates.filter(
    (d) => !dismissed.has(`${d.aIndex}-${d.bIndex}`),
  );

  return (
    <div className="grid flex-1 grid-cols-1 gap-4 min-h-0 md:grid-cols-2 md:gap-6">
      <Card className="flex flex-col overflow-hidden">
        <div className="flex items-center justify-between border-b bg-muted px-4 py-2.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          <span>Paste Raw Lyrics</span>
          <button
            onClick={() => {
              onInputChange("");
              setShowEmpty(true);
            }}
            className="rounded-md px-2 py-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            &#10005; Clear
          </button>
        </div>
        <div className="relative flex-1 min-h-0">
          <textarea
            id="input-area"
            value={input}
            onChange={(e) => onInputChange(e.target.value)}
            placeholder="Paste raw lyrics here..."
            spellCheck={false}
            className="absolute inset-0 resize-none border-0 bg-transparent p-4 font-mono text-sm leading-relaxed text-foreground outline-none placeholder:text-muted-foreground"
          />
        </div>
      </Card>

      <Card id="output-panel" className="flex flex-col overflow-hidden">
        <div className="flex items-center justify-between border-b bg-muted px-4 py-2.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          <span>Cleaned Lyrics</span>
          <span className="flex items-center gap-3">
            <button
              onClick={() => setShowLyricsSearch(true)}
              className="flex items-center gap-1 rounded-md px-2 py-1 text-[10px] font-normal normal-case text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
              Search Lyrics
            </button>
            <span className="flex items-center gap-1.5 text-[10px] font-normal normal-case text-muted-foreground">
              <svg width="10" height="10" viewBox="0 0 12 12" fill="currentColor">
                <circle cx="4" cy="2" r="1" />
                <circle cx="8" cy="2" r="1" />
                <circle cx="4" cy="6" r="1" />
                <circle cx="8" cy="6" r="1" />
                <circle cx="4" cy="10" r="1" />
                <circle cx="8" cy="10" r="1" />
              </svg>
              Drag to reorder
            </span>
          </span>
        </div>

        {visibleDuplicates.length > 0 && (
          <div className="space-y-1.5 border-b bg-amber-50 px-4 py-2.5 dark:bg-amber-950/20">
            {visibleDuplicates.map((d) => {
              const key = `${d.aIndex}-${d.bIndex}`;
              const pct = Math.round(d.similarity * 100);
              const sameHeader =
                d.aHeader &&
                d.bHeader &&
                d.aHeader.toLowerCase() === d.bHeader.toLowerCase();
              const nextA = sameHeader ? nextHeader(d.aHeader) : null;
              const nextB = sameHeader ? nextHeader(d.bHeader) : null;

              return (
                <div key={key} className="flex flex-wrap items-center gap-2 text-xs">
                  <span className="text-amber-700 dark:text-amber-400">
                    &#9888; Possible duplicate:
                  </span>
                  <span className="font-medium text-amber-800 dark:text-amber-300">
                    {d.aHeader || `Slide ${d.aIndex + 1}`}
                  </span>
                  <span className="text-amber-600 dark:text-amber-500">and</span>
                  <span className="font-medium text-amber-800 dark:text-amber-300">
                    {d.bHeader || `Slide ${d.bIndex + 1}`}
                  </span>
                  <span className="text-amber-600 dark:text-amber-500">
                    ({pct}% similar)
                  </span>
                  <span className="ml-auto flex items-center gap-1">
                    {sameHeader && nextA && (
                      <button
                        onClick={() => {
                          onDuplicateRename(d.bIndex, nextA);
                          setDismissed((prev) => new Set(prev).add(key));
                        }}
                        className="rounded px-1.5 py-0.5 text-amber-700 transition-colors hover:bg-amber-100 dark:text-amber-400 dark:hover:bg-amber-900/30"
                      >
                        Rename &rarr; {nextA}
                      </button>
                    )}
                    <button
                      onClick={() => {
                        onDuplicateRemove(d.bIndex);
                        setDismissed(new Set());
                      }}
                      className="rounded px-1.5 py-0.5 text-red-600 transition-colors hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/30"
                    >
                      Remove {d.bHeader || `Slide ${d.bIndex + 1}`}
                    </button>
                    <button
                      onClick={() =>
                        setDismissed((prev) => new Set(prev).add(key))
                      }
                      className="rounded px-1.5 py-0.5 text-muted-foreground transition-colors hover:bg-muted"
                    >
                      Keep Both
                    </button>
                  </span>
                </div>
              );
            })}
          </div>
        )}

        <LyricsSearch
          isOpen={showLyricsSearch}
          onClose={() => setShowLyricsSearch(false)}
          onLyricsFound={onLyricsFound}
        />
        <div className="relative flex-1 min-h-0">
          {!output && showEmpty ? (
            <div className="flex h-full flex-col items-center justify-center px-4 text-center text-muted-foreground">
              <span className="mb-3 text-3xl opacity-50">&#9835;</span>
              <p className="text-sm leading-relaxed">
                Paste lyrics in the left panel, then click{" "}
                <strong className="text-foreground">Clean Lyrics</strong>.
              </p>
            </div>
          ) : slides.length > 1 ? (
            <div className="absolute inset-0 overflow-y-auto p-3">
              <SortableSections
                slides={slides}
                onReorder={handleReorder}
                onEditSlide={handleEditSlide}
              />
            </div>
          ) : (
            <div
              contentEditable
              suppressContentEditableWarning
              spellCheck={false}
              onInput={(e) =>
                onOutputChange(
                  (e.target as HTMLDivElement).textContent || "",
                )
              }
              className="absolute inset-0 overflow-y-auto whitespace-pre-wrap p-4 font-mono text-sm leading-relaxed text-foreground outline-none"
            >
              {output}
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
