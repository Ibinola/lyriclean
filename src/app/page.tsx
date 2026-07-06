"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Header from "@/components/Header";
import LyricEditor from "@/components/LyricEditor";
import ControlPanel from "@/components/ControlPanel";
import { cleanLyrics, applyLineBreaks } from "@/lib/clean";

const SAMPLE =
  "There is more, more to You o God\nThe Undoubted have ever known\nI want more, more of you Yahweh\nFill me up, till overflow\n\nRefrain:\nIna so in gan ka Yesu (Jesus, I want to see You)\nZuchiyata na neman Yesu (My heart is longing for Jesus)\nIn gan daukakan ka, Yesu (To see your glory, Jesus)\nZuchiyata na neman Yesu (My heart is longing for Jesus)\n\nI hunger and thirst for You, Yahweh\nIn a dry and weary land\nThere\u2019s no measure to how much of You I want\nConsume me now\n\n(Refrain)\n\nIna sonka, ya yesu (I love you dear Jesus)\nIn ganka, ya yesu (Let me see you dear Jesus)\nIna sonka, ya yesu (I love you dear Jesus)\nYa yesu Ya yesu (Dear Jesus, dear Jesus) (Repeat)\n\n(Refrain)\n\nIna sonka, ya yesu (I love you dear Jesus)\nIn ganka, ya yesu (Let me see you dear Jesus)\nIna sonka, ya yesu (I love you dear Jesus)\nYa yesu Ya yesu (Dear Jesus, dear Jesus) (Repeat)\n\n(Refrain)";

const LS_INPUT = "lyriclean:input";
const LS_LINES = "lyriclean:linesPerBreak";

function getInitialInput() {
  if (typeof window === "undefined") return SAMPLE;
  return localStorage.getItem(LS_INPUT) || SAMPLE;
}

function getInitialLines() {
  if (typeof window === "undefined") return 0;
  const stored = localStorage.getItem(LS_LINES);
  return stored ? parseInt(stored, 10) : 0;
}

export default function Home() {
  const [rawLyrics, setRawLyrics] = useState(getInitialInput);
  const [cleanedLyrics, setCleanedLyrics] = useState("");
  const [displayedLyrics, setDisplayedLyrics] = useState("");
  const [linesPerBreak, setLinesPerBreak] = useState(getInitialLines);
  const [foundSections, setFoundSections] = useState<string[]>([]);
  const [showSearch, setShowSearch] = useState(false);
  const baseTextRef = useRef("");
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const findInputRef = useRef<HTMLInputElement>(null);

  // Persist input on change (debounced)
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      localStorage.setItem(LS_INPUT, rawLyrics);
    }, 500);
  }, [rawLyrics]);

  // Persist linesPerBreak
  useEffect(() => {
    localStorage.setItem(LS_LINES, String(linesPerBreak));
  }, [linesPerBreak]);

  const rawLines = rawLyrics
    ? rawLyrics.split("\n").filter(Boolean).length
    : 0;
  const cleanedLines = cleanedLyrics
    ? cleanedLyrics.split("\n").filter(Boolean).length
    : 0;
  const slides = displayedLyrics
    ? displayedLyrics.split("\n\n").filter(Boolean).length
    : 0;

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

  const handleInputChange = (val: string) => {
    setRawLyrics(val);
    if (val === "") {
      localStorage.removeItem(LS_INPUT);
    }
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

      <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-4 overflow-hidden px-4 py-5 sm:px-6">
        <LyricEditor
          input={rawLyrics}
          output={displayedLyrics}
          onInputChange={handleInputChange}
          onOutputChange={handleOutputChange}
        />

        <ControlPanel
          onClean={handleClean}
          onCopy={handleCopy}
          linesPerBreak={linesPerBreak}
          onLinesPerBreakChange={handleLinesPerBreakChange}
          onReplace={handleReplace}
          rawLines={rawLines}
          cleanedLines={cleanedLines}
          sections={foundSections.length}
          slides={slides}
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
