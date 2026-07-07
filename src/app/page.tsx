"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Header from "@/components/Header";
import LyricEditor from "@/components/LyricEditor";
import ControlPanel from "@/components/ControlPanel";
import OnboardingTour from "@/components/OnboardingTour";
import { cleanLyrics, applyLineBreaks } from "@/lib/clean";
import {
  exportEasyWorship,
  exportProPresenter,
  exportPowerPoint,
} from "@/lib/export";

export default function Home() {
  const [rawLyrics, setRawLyrics] = useState("");
  const [cleanedLyrics, setCleanedLyrics] = useState("");
  const [displayedLyrics, setDisplayedLyrics] = useState("");
  const [linesPerBreak, setLinesPerBreak] = useState(0);
  const [foundSections, setFoundSections] = useState<string[]>([]);
  const [showSearch, setShowSearch] = useState(false);
  const baseTextRef = useRef("");
  const findInputRef = useRef<HTMLInputElement>(null);

  const rawLines = rawLyrics
    ? rawLyrics.split("\n").filter(Boolean).length
    : 0;
  const cleanedLines = cleanedLyrics
    ? cleanedLyrics.split("\n").filter(Boolean).length
    : 0;
  const slideCount = displayedLyrics
    ? displayedLyrics.split("\n\n").filter(Boolean).length
    : 0;
  const slideList = displayedLyrics
    ? displayedLyrics.split("\n\n").filter(Boolean)
    : [];

  const applyFormatting = useCallback(
    (baseText: string) => {
      const formatted = applyLineBreaks(baseText, linesPerBreak);
      setDisplayedLyrics(formatted);
    },
    [linesPerBreak],
  );

  const handleClean = useCallback(() => {
    const result = cleanLyrics(rawLyrics);
    baseTextRef.current = result.text;
    setCleanedLyrics(result.text);
    setFoundSections(result.sections);
    applyFormatting(result.text);
  }, [rawLyrics, applyFormatting]);

  const handleCopy = useCallback(async () => {
    if (!displayedLyrics) return;
    try {
      await navigator.clipboard.writeText(displayedLyrics);
    } catch {
      // fallback
    }
  }, [displayedLyrics]);

  const handleReplace = (find: string, replace: string) => {
    if (!baseTextRef.current) return;
    const escaped = find.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const regex = new RegExp(escaped, "gi");
    const replaced = baseTextRef.current.replace(regex, replace);
    if (replaced !== baseTextRef.current) {
      baseTextRef.current = replaced;
      setCleanedLyrics(replaced);
      applyFormatting(replaced);
    }
  };

  const handleLinesPerBreakChange = (val: number) => {
    setLinesPerBreak(val);
    if (baseTextRef.current) {
      const formatted = applyLineBreaks(baseTextRef.current, val);
      setDisplayedLyrics(formatted);
    }
  };

  const handleOutputChange = (val: string) => {
    setDisplayedLyrics(val);
    baseTextRef.current = val;
    setCleanedLyrics(val);
  };

  const handleSlidesReorder = (newSlides: string[]) => {
    const text = newSlides.join("\n\n");
    setDisplayedLyrics(text);
    baseTextRef.current = text;
    setCleanedLyrics(text);
  };

  const handleExport = async (format: "ews" | "pro" | "pptx") => {
    if (!displayedLyrics) return;
    const slides = displayedLyrics.split("\n\n").filter(Boolean);
    const title = "Song";

    switch (format) {
      case "ews": {
        const xml = exportEasyWorship(slides, title);
        const blob = new Blob([xml], { type: "application/xml" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${title}.ews`;
        a.click();
        URL.revokeObjectURL(url);
        break;
      }
      case "pro": {
        const text = exportProPresenter(slides);
        const blob = new Blob([text], { type: "text/plain" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${title}.pro`;
        a.click();
        URL.revokeObjectURL(url);
        break;
      }
      case "pptx": {
        await exportPowerPoint(slides, title);
        break;
      }
    }
  };

  const handleInputChange = (val: string) => {
    setRawLyrics(val);
  };

  // Stale-safe refs for keyboard handler
  const handleCleanRef = useRef(handleClean);
  handleCleanRef.current = handleClean;
  const handleCopyRef = useRef(handleCopy);
  handleCopyRef.current = handleCopy;
  const showSearchRef = useRef(showSearch);
  showSearchRef.current = showSearch;

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const isMeta = e.metaKey || e.ctrlKey;
      if (isMeta && e.key === "Enter") {
        e.preventDefault();
        handleCleanRef.current();
      }
      if (isMeta && e.shiftKey && (e.key === "c" || e.key === "C")) {
        e.preventDefault();
        handleCopyRef.current();
      }
      if (isMeta && (e.key === "f" || e.key === "F")) {
        e.preventDefault();
        setShowSearch(true);
        setTimeout(() => findInputRef.current?.focus(), 0);
      }
      if (e.key === "Escape" && showSearchRef.current) {
        e.preventDefault();
        setShowSearch(false);
      }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, []);

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <OnboardingTour />

      <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-4 overflow-hidden px-4 py-5 sm:px-6">
        <LyricEditor
          input={rawLyrics}
          output={displayedLyrics}
          slides={slideList}
          onInputChange={handleInputChange}
          onOutputChange={handleOutputChange}
          onSlidesReorder={handleSlidesReorder}
        />

        <ControlPanel
          onClean={handleClean}
          onCopy={handleCopy}
          onExport={handleExport}
          linesPerBreak={linesPerBreak}
          onLinesPerBreakChange={handleLinesPerBreakChange}
          onReplace={handleReplace}
          rawLines={rawLines}
          cleanedLines={cleanedLines}
          sections={foundSections.length}
          slides={slideCount}
          showSlides={linesPerBreak > 0}
          hasOutput={cleanedLyrics.length > 0}
          showSearch={showSearch}
          onShowSearchChange={setShowSearch}
          findInputRef={findInputRef}
        />
      </main>

      <footer className="border-t px-4 py-5 text-center text-xs text-muted-foreground">
        Built for worship teams, everywhere.{" "}
        <a
          href="https://github.com/Ibinola/lyriclean"
          target="_blank"
          rel="noopener"
          className="text-indigo-600 hover:underline"
        >
          Open source
        </a>{" "}
        &middot; Free forever
      </footer>
    </div>
  );
}
