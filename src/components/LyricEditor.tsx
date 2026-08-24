"use client";

import { Card } from "@/components/ui/card";
import { useCallback, useState } from "react";
import SortableSections from "@/components/SortableSections";
import LyricsSearch from "@/components/LyricsSearch";
import type { DuplicateGroup } from "@/lib/detectDuplicates";
import { useLiveTranscription } from "@/lib/useLiveTranscription";
import { useSongIdentifier, CLIP_SECONDS } from "@/lib/useSongIdentifier";

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
  onClear: () => void;
  onPaste?: (e: React.ClipboardEvent) => void;
  onTranscribeLine?: (line: string) => void;
  onIdentified?: (title: string, artist: string) => void;
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
  onClear,
  onPaste,
  onTranscribeLine,
  onIdentified,
}: LyricEditorProps) {
  const [showEmpty, setShowEmpty] = useState(true);
  const [showLyricsSearch, setShowLyricsSearch] = useState(false);
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());

  const transcribe = useLiveTranscription(
    useCallback((line: string) => onTranscribeLine?.(line), [onTranscribeLine]),
  );
  const transcribing = transcribe.state === "listening";

  const identify = useSongIdentifier(
    useCallback((title: string, artist: string) => onIdentified?.(title, artist), [onIdentified]),
  );
  const identifying = identify.state === "recording" || identify.state === "identifying";

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

  const visibleDuplicates = duplicates.filter((d) => !dismissed.has(`${d.aIndex}-${d.bIndex}`));

  return (
    <div className="grid flex-1 grid-cols-1 gap-4 min-h-0 md:grid-cols-2 md:gap-6">
      <Card className="flex flex-col overflow-hidden">
        <div className="flex items-center justify-between border-b bg-muted px-4 py-2.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          <span>Paste Raw Lyrics</span>
          <span className="flex items-center gap-2">
            <button
              onClick={identify.state === "recording" ? identify.stop : identify.start}
              disabled={!identify.supported}
              title={
                identify.supported
                  ? identify.state === "recording"
                    ? "Stop and identify"
                    : "Identify the song playing nearby"
                  : "Song identification requires Chrome or Edge"
              }
              className={`flex items-center gap-1.5 rounded-md px-2 py-1 text-[10px] font-normal normal-case transition-colors ${
                identify.state === "recording"
                  ? "bg-indigo-100 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              } disabled:cursor-not-allowed disabled:opacity-40`}
            >
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 18V5l12-2v13" />
                <circle cx="6" cy="18" r="3" />
                <circle cx="18" cy="16" r="3" />
              </svg>
              {identify.state === "recording"
                ? `Recording ${identify.elapsed}s`
                : identify.state === "identifying"
                  ? "Identifying…"
                  : "Identify"}
            </button>
            <button
              onClick={transcribing ? transcribe.stop : transcribe.start}
              disabled={!transcribe.supported}
              title={
                transcribe.supported
                  ? transcribing
                    ? "Stop listening"
                    : "Transcribe from microphone"
                  : "Live transcription requires Chrome or Edge"
              }
              className={`flex items-center gap-1.5 rounded-md px-2 py-1 text-[10px] font-normal normal-case transition-colors ${
                transcribing
                  ? "bg-red-100 text-red-600 dark:bg-red-950/40 dark:text-red-400"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              } disabled:cursor-not-allowed disabled:opacity-40`}
            >
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
                <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                <line x1="12" x2="12" y1="19" y2="22" />
              </svg>
              {transcribing ? "Stop" : "Transcribe"}
            </button>
            <button
              onClick={() => {
                onClear();
                setShowEmpty(true);
              }}
              className="rounded-md px-2 py-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              &#10005; Clear
            </button>
          </span>
        </div>

        {identifying && (
          <div className="border-b bg-indigo-50 px-4 py-2 dark:bg-indigo-950/30">
            <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-wide text-indigo-600 dark:text-indigo-400">
              <span className="h-2 w-2 animate-pulse rounded-full bg-red-500" />
              {identify.state === "recording"
                ? `Listening for ${CLIP_SECONDS}s…`
                : "Identifying song…"}
            </div>
            <p className="mt-1 font-mono text-xs leading-relaxed text-muted-foreground">
              {identify.state === "recording"
                ? "Keep the audio near the mic. Stop early or wait for the clip to finish."
                : "Matching the audio fingerprint…"}
            </p>
          </div>
        )}

        {identify.error && (
          <div className="border-b bg-red-50 px-4 py-2 text-[11px] text-red-600 dark:bg-red-950/30 dark:text-red-400">
            {identify.error}
          </div>
        )}

        {(transcribing || transcribe.interim || transcribe.committed || transcribe.error) && (
          <div className="border-b bg-indigo-50 px-4 py-2 dark:bg-indigo-950/30">
            <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-wide text-indigo-600 dark:text-indigo-400">
              <span className="h-2 w-2 animate-pulse rounded-full bg-red-500" />
              {transcribe.error ? transcribe.error : transcribing ? "Listening…" : "Transcribed"}
            </div>
            <p className="mt-1 whitespace-pre-wrap font-mono text-xs leading-relaxed text-foreground">
              {transcribe.committed ? transcribe.committed + "\n" : ""}
              <span className="text-muted-foreground">{transcribe.interim}</span>
            </p>
          </div>
        )}

        <div className="relative flex-1 min-h-0">
          <textarea
            id="input-area"
            value={input}
            onChange={(e) => onInputChange(e.target.value)}
            onPaste={onPaste}
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
              <svg
                width="10"
                height="10"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.3-4.3" />
              </svg>
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
          <div className="max-h-72 space-y-3 overflow-y-auto border-b bg-amber-50 px-4 py-3 dark:bg-amber-950/20">
            {visibleDuplicates.map((d) => {
              const key = `${d.aIndex}-${d.bIndex}`;
              const pct = Math.round(d.similarity * 100);
              const sameHeader =
                d.aHeader && d.bHeader && d.aHeader.toLowerCase() === d.bHeader.toLowerCase();
              const nextA = sameHeader ? nextHeader(d.aHeader) : null;

              const labelA = d.aHeader || `Slide ${d.aIndex + 1}`;
              const labelB = d.bHeader || `Slide ${d.bIndex + 1}`;

              return (
                <div key={key} className="rounded-lg border border-amber-200 bg-card p-3 dark:border-amber-800/40">
                  <div className="flex flex-wrap items-center gap-2 text-xs">
                    <span className="text-amber-700 dark:text-amber-400">
                      &#9888; Possible duplicate:
                    </span>
                    <span className="font-medium text-amber-800 dark:text-amber-300">{labelA}</span>
                    <span className="text-amber-600 dark:text-amber-500">and</span>
                    <span className="font-medium text-amber-800 dark:text-amber-300">{labelB}</span>
                    <span className="text-amber-600 dark:text-amber-500">({pct}% similar)</span>
                  </div>

                  <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2">
                    <div className="rounded-md border border-amber-200/70 bg-background p-2 dark:border-amber-800/30">
                      <p className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-amber-600 dark:text-amber-400">
                        {labelA}
                      </p>
                      <pre className="whitespace-pre-wrap font-mono text-xs leading-relaxed text-foreground">
                        {d.aContent}
                      </pre>
                    </div>
                    <div className="rounded-md border border-amber-200/70 bg-background p-2 dark:border-amber-800/30">
                      <p className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-amber-600 dark:text-amber-400">
                        {labelB}
                      </p>
                      <pre className="whitespace-pre-wrap font-mono text-xs leading-relaxed text-foreground">
                        {d.bContent}
                      </pre>
                    </div>
                  </div>

                  <div className="mt-2 flex flex-wrap items-center gap-1.5">
                    <button
                      onClick={() => {
                        onDuplicateRemove(d.aIndex);
                        setDismissed(new Set());
                      }}
                      className="rounded px-2 py-1 text-xs font-medium text-red-600 transition-colors hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/30"
                    >
                      Keep {labelB}
                    </button>
                    <button
                      onClick={() => {
                        onDuplicateRemove(d.bIndex);
                        setDismissed(new Set());
                      }}
                      className="rounded px-2 py-1 text-xs font-medium text-red-600 transition-colors hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/30"
                    >
                      Keep {labelA}
                    </button>
                    {sameHeader && nextA && (
                      <button
                        onClick={() => {
                          onDuplicateRename(d.bIndex, nextA);
                          setDismissed((prev) => new Set(prev).add(key));
                        }}
                        className="rounded px-2 py-1 text-xs font-medium text-amber-700 transition-colors hover:bg-amber-100 dark:text-amber-400 dark:hover:bg-amber-900/30"
                      >
                        Rename {labelB} &rarr; {nextA}
                      </button>
                    )}
                    <span className="flex-1" />
                    <button
                      onClick={() => setDismissed((prev) => new Set(prev).add(key))}
                      className="rounded px-2 py-1 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted"
                    >
                      Keep Both
                    </button>
                  </div>
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
              onInput={(e) => onOutputChange((e.target as HTMLDivElement).textContent || "")}
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
