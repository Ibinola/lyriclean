"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useEffect, useRef, useState } from "react";

interface SearchResult {
  id: string;
  title: string;
  artist: string;
  albumArt: string | null;
  url: string;
  source: "genius" | "lrclib";
}

interface LyricsSearchProps {
  isOpen: boolean;
  onClose: () => void;
  onLyricsFound: (lyrics: string, title: string, artist: string) => void;
}

type Step = "idle" | "searching" | "results" | "fetching" | "preview";

export default function LyricsSearch({ isOpen, onClose, onLyricsFound }: LyricsSearchProps) {
  const [song, setSong] = useState("");
  const [step, setStep] = useState<Step>("idle");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [error, setError] = useState("");
  const [selectedResult, setSelectedResult] = useState<SearchResult | null>(null);
  const [lyrics, setLyrics] = useState("");
  const [fetchSource, setFetchSource] = useState("");
  const songInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setStep("idle");
      setSong("");
      setResults([]);
      setError("");
      setSelectedResult(null);
      setLyrics("");
      setFetchSource("");
      setTimeout(() => songInputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") { e.preventDefault(); onClose(); }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [isOpen, onClose]);

  const handleSearch = async () => {
    if (!song.trim()) return;
    setStep("searching");
    setError("");
    setResults([]);
    setLyrics("");
    setSelectedResult(null);

    try {
      const res = await fetch("/api/lyrics/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ song: song.trim() }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Search failed");
        setStep("idle");
        return;
      }

      if (data.results.length === 0) {
        setError("No results found");
        setStep("idle");
        return;
      }

      setResults(data.results);
      setStep("results");
    } catch {
      setError("Network error. Check your connection.");
      setStep("idle");
    }
  };

  const handleSelectResult = async (result: SearchResult) => {
    setSelectedResult(result);
    setStep("fetching");
    setError("");

    try {
      const res = await fetch("/api/lyrics/fetch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: result.url, title: result.title, artist: result.artist }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to fetch lyrics");
        setStep("results");
        return;
      }

      setLyrics(data.lyrics);
      setFetchSource(data.source || "");
      setStep("preview");
    } catch {
      setError("Network error. Check your connection.");
      setStep("results");
    }
  };

  const handleUseLyrics = () => {
    if (!lyrics || !selectedResult) return;
    onLyricsFound(lyrics, selectedResult.title, selectedResult.artist);
    onClose();
  };

  const handleBack = () => {
    setStep("results");
    setSelectedResult(null);
    setLyrics("");
    setFetchSource("");
    setError("");
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[10vh] sm:pt-[15vh]" onClick={onClose}>
      <div className="fixed inset-0 bg-black/40" />
      <div
        className="relative z-10 mx-4 w-full max-w-2xl rounded-xl border bg-card shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b px-4 py-3">
          <h2 className="flex items-center gap-2 text-sm font-semibold">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
            Search Lyrics
          </h2>
          <button onClick={onClose} className="text-sm text-muted-foreground transition-colors hover:text-foreground">
            &#x2715;
          </button>
        </div>

        {/* Body */}
        <div className="max-h-[65vh] overflow-y-auto p-4">
          {/* Search input row */}
          {(step === "idle" || step === "results") && (
            <div className="flex items-end gap-2">
              <div className="flex-1">
                <label htmlFor="modal-song" className="mb-1 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Type in the lyrics you heard
                </label>
                <Input
                  ref={songInputRef}
                  id="modal-song"
                  value={song}
                  onChange={(e) => setSong(e.target.value)}
                  placeholder="e.g. Lord of all creation..."
                  className="rounded-[9999px]"
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && song.trim()) {
                      e.preventDefault();
                      handleSearch();
                    }
                  }}
                />
              </div>
              <Button
                onClick={handleSearch}
                disabled={!song.trim()}
                className="h-10 w-10 shrink-0 rounded-full bg-indigo-600 p-0 hover:bg-indigo-700"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
              </Button>
            </div>
          )}

          {/* Error */}
          {error && (
            <p className="mt-2 text-xs text-red-500">{error}</p>
          )}

          {/* Searching spinner */}
          {step === "searching" && (
            <div className="flex items-center gap-2 py-4 text-sm text-muted-foreground">
              <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Searching...
            </div>
          )}

          {/* Fetching spinner */}
          {step === "fetching" && (
            <div className="flex items-center gap-2 py-4 text-sm text-muted-foreground">
              <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Fetching lyrics...
            </div>
          )}

          {/* Results cards */}
          {step === "results" && results.length > 0 && (
            <div className="mt-3 space-y-3">
              {(["genius", "lrclib"] as const).map((source) => {
                const sourceResults = results.filter((r) => r.source === source);
                if (sourceResults.length === 0) return null;
                return (
                  <div key={source}>
                    <h4 className="mb-1.5 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                      {source === "genius" ? (
                        <span className="flex items-center gap-1">Genius</span>
                      ) : (
                        <span className="flex items-center gap-1">LRCLIB</span>
                      )}
                      <span className="h-px flex-1 bg-border" />
                    </h4>
                    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
                      {sourceResults.map((r) => (
                        <button
                          key={r.id}
                          onClick={() => handleSelectResult(r)}
                          className="group flex flex-col overflow-hidden rounded-lg border bg-background text-left transition-colors hover:border-indigo-400 hover:bg-muted/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                        >
                          <div className="aspect-square w-full overflow-hidden bg-muted">
                            {r.albumArt ? (
                              <img
                                src={r.albumArt}
                                alt={`${r.title} album art`}
                                className="h-full w-full object-cover transition-transform group-hover:scale-105"
                                loading="lazy"
                              />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3"/><path d="M12 17h.01"/></svg>
                              </div>
                            )}
                          </div>
                          <div className="flex min-w-0 flex-col gap-0.5 p-2">
                            <span className="truncate text-xs font-medium text-foreground">{r.title}</span>
                            <span className="truncate text-[11px] text-muted-foreground">{r.artist}</span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Lyrics preview */}
          {step === "preview" && selectedResult && lyrics && (
            <div className="space-y-3">
              <button
                onClick={handleBack}
                className="flex items-center gap-1 text-xs text-muted-foreground transition-colors hover:text-foreground"
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m15 18-6-6 6-6"/></svg>
                Back to results
              </button>

              <div className="flex items-start gap-3">
                {selectedResult.albumArt && (
                  <img
                    src={selectedResult.albumArt}
                    alt=""
                    className="h-12 w-12 flex-shrink-0 rounded object-cover"
                  />
                )}
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-foreground">{selectedResult.title}</p>
                  <p className="text-xs text-muted-foreground">{selectedResult.artist}</p>
                </div>
                {fetchSource && (
                  <span className="shrink-0 self-start rounded-full border px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                    {fetchSource === "genius" ? "Genius" : fetchSource === "lrclib" ? "LRCLIB" : "AGL"}
                  </span>
                )}
              </div>

              <div className="max-h-48 overflow-y-auto rounded-lg border bg-muted/50 p-3 font-mono text-xs leading-relaxed text-foreground whitespace-pre-wrap">
                {lyrics}
              </div>

              <Button
                onClick={handleUseLyrics}
                className="w-full bg-indigo-600 hover:bg-indigo-700"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>
                Use These Lyrics
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
