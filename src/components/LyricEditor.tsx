"use client";

import { Card } from "@/components/ui/card";
import { useCallback, useState } from "react";
import SortableSections from "@/components/SortableSections";
import LyricsSearch from "@/components/LyricsSearch";

interface LyricEditorProps {
  input: string;
  output: string;
  slides: string[];
  onInputChange: (val: string) => void;
  onOutputChange: (val: string) => void;
  onSlidesReorder: (slides: string[]) => void;
  onLyricsFound: (lyrics: string, title: string, artist: string) => void;
}

export default function LyricEditor({
  input,
  output,
  slides,
  onInputChange,
  onOutputChange,
  onSlidesReorder,
  onLyricsFound,
}: LyricEditorProps) {
  const [showEmpty, setShowEmpty] = useState(true);
  const [showLyricsSearch, setShowLyricsSearch] = useState(false);

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
