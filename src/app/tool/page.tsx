"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Header from "@/components/Header";
import LyricEditor from "@/components/LyricEditor";
import ControlPanel from "@/components/ControlPanel";
import OnboardingTour from "@/components/OnboardingTour";
import Changelog from "@/components/Changelog";
import KeyboardShortcuts from "@/components/KeyboardShortcuts";
import SettingsPanel from "@/components/SettingsPanel";
import { cleanLyrics, applyLineBreaks } from "@/lib/clean";
import { expandReferences } from "@/lib/expandSections";
import { detectDuplicates, type DuplicateGroup } from "@/lib/detectDuplicates";
import { useToast } from "@/components/Toaster";
import { exportEasyWorship, exportProPresenter, exportPowerPoint } from "@/lib/export";
import { useHistory, type Snapshot } from "@/lib/history";
import type { CleaningOptions, CleaningReport } from "@/lib/cleaningOptions";
import { loadOptions } from "@/lib/cleaningOptions";

export default function Home() {
  const [rawLyrics, setRawLyrics] = useState("");
  const [cleanedLyrics, setCleanedLyrics] = useState("");
  const [displayedLyrics, setDisplayedLyrics] = useState("");
  const [linesPerBreak, setLinesPerBreak] = useState(0);
  const [foundSections, setFoundSections] = useState<string[]>([]);
  const [showSearch, setShowSearch] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [duplicates, setDuplicates] = useState<DuplicateGroup[]>([]);
  const [cleaning, setCleaning] = useState(false);
  const [exporting, setExporting] = useState<"ews" | "pro" | "pptx" | "txt" | null>(null);
  const [lastReport, setLastReport] = useState<CleaningReport | null>(null);
  const [cleaningOptions, setCleaningOptions] = useState<CleaningOptions>(loadOptions);
  const baseTextRef = useRef("");

  const { toast } = useToast();
  const findInputRef = useRef<HTMLInputElement>(null);

  const history = useHistory();
  const autoSavedRef = useRef(false);

  // Restore auto-saved state on mount
  useEffect(() => {
    if (autoSavedRef.current) return;
    autoSavedRef.current = true;
    const saved = history.loadFromDisk();
    if (saved && saved.rawLyrics) {
      setRawLyrics(saved.rawLyrics);
      setCleanedLyrics(saved.cleanedLyrics);
      setDisplayedLyrics(saved.displayedLyrics);
      setLinesPerBreak(saved.linesPerBreak);
      setFoundSections(saved.foundSections);
      setDuplicates(saved.duplicates);
      baseTextRef.current = saved.cleanedLyrics;
    }
  }, [history]);

  // Auto-save on state change
  useEffect(() => {
    if (!rawLyrics && !cleanedLyrics) return;
    const timer = setTimeout(() => {
      history.saveToDisk({
        rawLyrics,
        cleanedLyrics,
        displayedLyrics,
        linesPerBreak,
        foundSections,
        duplicates,
      });
    }, 1000);
    return () => clearTimeout(timer);
  }, [rawLyrics, cleanedLyrics, displayedLyrics, linesPerBreak, foundSections, duplicates, history]);

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

  const pushSnapshot = useCallback(
    (snap?: Partial<Snapshot>) => {
      history.push({
        rawLyrics: snap?.rawLyrics ?? rawLyrics,
        cleanedLyrics: snap?.cleanedLyrics ?? cleanedLyrics,
        displayedLyrics: snap?.displayedLyrics ?? displayedLyrics,
        linesPerBreak,
        foundSections: snap?.foundSections ?? foundSections,
        duplicates: snap?.duplicates ?? duplicates,
      });
    },
    [history, rawLyrics, cleanedLyrics, displayedLyrics, linesPerBreak, foundSections, duplicates],
  );

  const updateState = useCallback(
    (newText: string) => {
      pushSnapshot();
      baseTextRef.current = newText;
      setCleanedLyrics(newText);
      setDuplicates(detectDuplicates(newText));
      applyFormatting(newText);
    },
    [pushSnapshot, applyFormatting],
  );

  const handleClean = useCallback(() => {
    if (!rawLyrics.trim()) return;
    setCleaning(true);
    setLastReport(null);

    const expanded = expandReferences(rawLyrics);
    const result = cleanLyrics(expanded, cleaningOptions);

    baseTextRef.current = result.text;
    setCleanedLyrics(result.text);
    setFoundSections(result.sections);
    setDuplicates(detectDuplicates(result.text));
    applyFormatting(result.text);
    setLastReport(result.report);
    setCleaning(false);

    if (!result.text.trim()) {
      toast("No lyrics remained after cleaning", "info");
    } else {
      toast(`Cleaned to ${result.sections.length} sections`, "success");
    }
  }, [rawLyrics, cleaningOptions, applyFormatting, toast]);

  const handleUndo = useCallback(() => {
    const snap = history.undo();
    if (!snap) return;
    setRawLyrics(snap.rawLyrics);
    setCleanedLyrics(snap.cleanedLyrics);
    setDisplayedLyrics(snap.displayedLyrics);
    setLinesPerBreak(snap.linesPerBreak);
    setFoundSections(snap.foundSections);
    setDuplicates(snap.duplicates);
    baseTextRef.current = snap.cleanedLyrics;
  }, [history]);

  const handleRedo = useCallback(() => {
    const snap = history.redo();
    if (!snap) return;
    setRawLyrics(snap.rawLyrics);
    setCleanedLyrics(snap.cleanedLyrics);
    setDisplayedLyrics(snap.displayedLyrics);
    setLinesPerBreak(snap.linesPerBreak);
    setFoundSections(snap.foundSections);
    setDuplicates(snap.duplicates);
    baseTextRef.current = snap.cleanedLyrics;
  }, [history]);

  const handleReset = useCallback(() => {
    pushSnapshot();
    setCleanedLyrics("");
    setDisplayedLyrics("");
    setFoundSections([]);
    setDuplicates([]);
    baseTextRef.current = "";
    setLastReport(null);
  }, [pushSnapshot]);

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
    pushSnapshot();
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
      pushSnapshot();
      paras.splice(paraIndex, 1);
      const newText = paras.join("\n\n").trim();
      baseTextRef.current = newText;
      setCleanedLyrics(newText);
      setDuplicates(detectDuplicates(newText));
      applyFormatting(newText);
    },
    [pushSnapshot, applyFormatting],
  );

  const handleDuplicateRename = useCallback(
    (paraIndex: number, newHeader: string) => {
      const paras = baseTextRef.current.split("\n\n");
      if (paraIndex < 0 || paraIndex >= paras.length) return;
      pushSnapshot();
      const lines = paras[paraIndex].split("\n");
      lines[0] = newHeader;
      paras[paraIndex] = lines.join("\n");
      const newText = paras.join("\n\n").trim();
      baseTextRef.current = newText;
      setCleanedLyrics(newText);
      setDuplicates(detectDuplicates(newText));
      applyFormatting(newText);
    },
    [pushSnapshot, applyFormatting],
  );

  const handleOutputChange = (val: string) => {
    pushSnapshot();
    setDisplayedLyrics(val);
    baseTextRef.current = val;
    setCleanedLyrics(val);
    setDuplicates([]);
  };

  const handleSlidesReorder = (newSlides: string[]) => {
    pushSnapshot();
    const text = newSlides.join("\n\n");
    setDisplayedLyrics(text);
    baseTextRef.current = text;
    setCleanedLyrics(text);
    setDuplicates([]);
  };

  const handleExport = async (format: "ews" | "pro" | "pptx" | "txt") => {
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
        case "txt": {
          const blob = new Blob([displayedLyrics], { type: "text/plain" });
          const url = URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = `${title}.txt`;
          a.click();
          URL.revokeObjectURL(url);
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
      pushSnapshot({ rawLyrics: lyrics });
      setRawLyrics(lyrics);
      const expanded = expandReferences(lyrics);
      const result = cleanLyrics(expanded, cleaningOptions);
      baseTextRef.current = result.text;
      setCleanedLyrics(result.text);
      setFoundSections(result.sections);
      setDuplicates(detectDuplicates(result.text));
      applyFormatting(result.text);
      setLastReport(result.report);
      toast(`Loaded "${title}" by ${artist}`, "success");
    },
    [cleaningOptions, pushSnapshot, applyFormatting, toast],
  );

  const handleInputChange = (val: string) => {
    setRawLyrics(val);
  };

  const handleOptionsChange = useCallback((options: CleaningOptions) => {
    setCleaningOptions(options);
  }, []);

  // Auto-paste detection
  const handlePaste = useCallback(
    (e: React.ClipboardEvent) => {
      const pasted = e.clipboardData.getData("text");
      if (pasted.length > 20) {
        setTimeout(() => {
          if (rawLyrics !== pasted) setRawLyrics(pasted);
        }, 0);
      }
    },
    [rawLyrics],
  );

  // Stale-safe refs for keyboard handler
  const handleCleanRef = useRef(handleClean);
  handleCleanRef.current = handleClean;
  const handleCopyRef = useRef(handleCopy);
  handleCopyRef.current = handleCopy;
  const handleUndoRef = useRef(handleUndo);
  handleUndoRef.current = handleUndo;
  const handleRedoRef = useRef(handleRedo);
  handleRedoRef.current = handleRedo;
  const showSearchRef = useRef(showSearch);
  showSearchRef.current = showSearch;
  const showSettingsRef = useRef(showSettings);
  showSettingsRef.current = showSettings;

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const isMeta = e.metaKey || e.ctrlKey;
      if (isMeta && e.shiftKey && (e.key === "z" || e.key === "Z")) {
        e.preventDefault();
        handleRedoRef.current();
        return;
      }
      if (isMeta && (e.key === "z" || e.key === "Z")) {
        e.preventDefault();
        handleUndoRef.current();
        return;
      }
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
      if (e.key === "Escape") {
        if (showSearchRef.current) {
          e.preventDefault();
          setShowSearch(false);
        }
        if (showSettingsRef.current) {
          e.preventDefault();
          setShowSettings(false);
        }
      }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, []);

  const dismissReport = useCallback(() => setLastReport(null), []);

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header homeHref="/tool" />
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
          onPaste={handlePaste}
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
          canUndo={history.canUndo}
          canRedo={history.canRedo}
          hasChanges={cleanedLyrics.length > 0}
          onUndo={handleUndo}
          onRedo={handleRedo}
          onReset={handleReset}
          onSettingsOpen={() => setShowSettings(true)}
          lastReport={lastReport}
          onDismissReport={dismissReport}
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

      <SettingsPanel
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        onOptionsChange={handleOptionsChange}
      />
    </div>
  );
}
