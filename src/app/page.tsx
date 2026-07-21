"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Header from "@/components/Header";
import LyricEditor from "@/components/LyricEditor";
import ControlPanel from "@/components/ControlPanel";
import OnboardingTour from "@/components/OnboardingTour";
import Changelog from "@/components/Changelog";
import KeyboardShortcuts from "@/components/KeyboardShortcuts";
import { cleanLyrics, applyLineBreaks } from "@/lib/clean";
import { expandReferences } from "@/lib/expandSections";
import { spellcheck } from "@/lib/spellcheck";
import { detectDuplicates, type DuplicateGroup } from "@/lib/detectDuplicates";
import { useToast } from "@/components/Toaster";
import { exportEasyWorship, exportProPresenter, exportPowerPoint } from "@/lib/export";

export default function Home() {
  const [rawLyrics, setRawLyrics] = useState("");
  const [cleanedLyrics, setCleanedLyrics] = useState("");
  const [displayedLyrics, setDisplayedLyrics] = useState("");
  const [linesPerBreak, setLinesPerBreak] = useState(0);
  const [foundSections, setFoundSections] = useState<string[]>([]);
  const [showSearch, setShowSearch] = useState(false);
  const [duplicates, setDuplicates] = useState<DuplicateGroup[]>([]);
  const [cleaning, setCleaning] = useState(false);
  const [exporting, setExporting] = useState<"ews" | "pro" | "pptx" | null>(null);
  const baseTextRef = useRef("");
  const { toast } = useToast();
  const findInputRef = useRef<HTMLInputElement>(null);

  const rawLines = rawLyrics ? rawLyrics.split("\n").filter(Boolean).length : 0;
  const cleanedLines = cleanedLyrics ? cleanedLyrics.split("\n").filter(Boolean).length : 0;
  const slideCount = displayedLyrics ? displayedLyrics.split("\n\n").filter(Boolean).length : 0;
  const slideList = displayedLyrics ? displayedLyrics.split("\n\n").filter(Boolean) : [];

  const applyFormatting = useCallback(
    (baseText: string) => {
      const formatted = applyLineBreaks(baseText, linesPerBreak);
      setDisplayedLyrics(formatted);
    },
    [linesPerBreak],
  );

  const handleClean = useCallback(() => {
    if (!rawLyrics.trim()) return;
    setCleaning(true);
    const expanded = expandReferences(rawLyrics);
    const checked = spellcheck(expanded);
    const result = cleanLyrics(checked);
    baseTextRef.current = result.text;
    setCleanedLyrics(result.text);
    setFoundSections(result.sections);
    setDuplicates(detectDuplicates(result.text));
    applyFormatting(result.text);
    setCleaning(false);
    if (!result.text.trim()) {
      toast("No lyrics remained after cleaning", "info");
    } else {
      toast(`Cleaned to ${result.sections.length} sections`, "success");
    }
  }, [rawLyrics, applyFormatting, toast]);

  const handleCopy = useCallback(async () => {
    if (!displayedLyrics) return;
    try {
      await navigator.clipboard.writeText(displayedLyrics);
      toast("Copied to clipboard", "success");
    } catch {
      toast("Failed to copy", "error");
    }
  }, [displayedLyrics, toast]);

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

  const handleDuplicateRemove = useCallback(
    (paraIndex: number) => {
      const paras = baseTextRef.current.split("\n\n");
      if (paraIndex < 0 || paraIndex >= paras.length) return;
      paras.splice(paraIndex, 1);
      const newText = paras.join("\n\n").trim();
      baseTextRef.current = newText;
      setCleanedLyrics(newText);
      setDuplicates(detectDuplicates(newText));
      applyFormatting(newText);
    },
    [applyFormatting],
  );

  const handleDuplicateRename = useCallback(
    (paraIndex: number, newHeader: string) => {
      const paras = baseTextRef.current.split("\n\n");
      if (paraIndex < 0 || paraIndex >= paras.length) return;
      const lines = paras[paraIndex].split("\n");
      lines[0] = newHeader;
      paras[paraIndex] = lines.join("\n");
      const newText = paras.join("\n\n").trim();
      baseTextRef.current = newText;
      setCleanedLyrics(newText);
      setDuplicates(detectDuplicates(newText));
      applyFormatting(newText);
    },
    [applyFormatting],
  );

  const handleOutputChange = (val: string) => {
    setDisplayedLyrics(val);
    baseTextRef.current = val;
    setCleanedLyrics(val);
    setDuplicates([]);
  };

  const handleSlidesReorder = (newSlides: string[]) => {
    const text = newSlides.join("\n\n");
    setDisplayedLyrics(text);
    baseTextRef.current = text;
    setCleanedLyrics(text);
    setDuplicates([]);
  };

  const handleExport = async (format: "ews" | "pro" | "pptx") => {
    if (!displayedLyrics) return;
    setExporting(format);
    const slides = displayedLyrics.split("\n\n").filter(Boolean);
    const title = "Song";

    try {
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
      toast("Exported successfully", "success");
    } catch {
      toast("Export failed", "error");
    } finally {
      setExporting(null);
    }
  };

  const handleLyricsFound = useCallback(
    (lyrics: string, title: string, artist: string) => {
      setRawLyrics(lyrics);
      const expanded = expandReferences(lyrics);
      const checked = spellcheck(expanded);
      const result = cleanLyrics(checked);
      baseTextRef.current = result.text;
      setCleanedLyrics(result.text);
      setFoundSections(result.sections);
      setDuplicates(detectDuplicates(result.text));
      applyFormatting(result.text);
      toast(`Loaded "${title}" by ${artist}`, "success");
    },
    [applyFormatting, toast],
  );

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
          duplicates={duplicates}
          onInputChange={handleInputChange}
          onOutputChange={handleOutputChange}
          onSlidesReorder={handleSlidesReorder}
          onLyricsFound={handleLyricsFound}
          onDuplicateRemove={handleDuplicateRemove}
          onDuplicateRename={handleDuplicateRename}
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
          duplicates={duplicates.length}
          showSearch={showSearch}
          onShowSearchChange={setShowSearch}
          findInputRef={findInputRef}
          cleaning={cleaning}
          exporting={exporting}
        />
      </main>

      <footer className="flex flex-wrap items-center justify-center gap-x-2 gap-y-1 border-t px-4 py-5 text-center text-xs text-muted-foreground">
        <span>Built for worship teams, everywhere.</span>
        <a
          href="https://github.com/Ibinola/lyriclean"
          target="_blank"
          rel="noopener"
          className="text-indigo-600 hover:underline"
        >
          Open source
        </a>
        <span className="hidden sm:inline">&middot;</span>
        <span>Free forever</span>
        <span className="hidden sm:inline">&middot;</span>
        <Changelog />
        <span className="hidden sm:inline">&middot;</span>
        <KeyboardShortcuts />
      </footer>
    </div>
  );
}
