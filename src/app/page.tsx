"use client";

import { useCallback, useRef, useState } from "react";
import Header from "@/components/Header";
import LyricEditor from "@/components/LyricEditor";
import ControlPanel from "@/components/ControlPanel";
import { cleanLyrics, applyLineBreaks } from "@/lib/clean";

const SAMPLE =
  "There is more, more to You o God\nThe Undoubted have ever known\nI want more, more of you Yahweh\nFill me up, till overflow\n\nRefrain:\nIna so in gan ka Yesu (Jesus, I want to see You)\nZuchiyata na neman Yesu (My heart is longing for Jesus)\nIn gan daukakan ka, Yesu (To see your glory, Jesus)\nZuchiyata na neman Yesu (My heart is longing for Jesus)\n\nI hunger and thirst for You, Yahweh\nIn a dry and weary land\nThere\u2019s no measure to how much of You I want\nConsume me now\n\n(Refrain)\n\nIna sonka, ya yesu (I love you dear Jesus)\nIn ganka, ya yesu (Let me see you dear Jesus)\nIna sonka, ya yesu (I love you dear Jesus)\nYa yesu Ya yesu (Dear Jesus, dear Jesus) (Repeat)\n\n(Refrain)\n\nIna sonka, ya yesu (I love you dear Jesus)\nIn ganka, ya yesu (Let me see you dear Jesus)\nIna sonka, ya yesu (I love you dear Jesus)\nYa yesu Ya yesu (Dear Jesus, dear Jesus) (Repeat)\n\n(Refrain)";

export default function Home() {
  const [rawLyrics, setRawLyrics] = useState(SAMPLE);
  const [cleanedLyrics, setCleanedLyrics] = useState("");
  const [displayedLyrics, setDisplayedLyrics] = useState("");
  const [linesPerBreak, setLinesPerBreak] = useState(0);
  const [foundSections, setFoundSections] = useState<string[]>([]);
  const baseTextRef = useRef("");

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

  const handleClean = () => {
    const result = cleanLyrics(rawLyrics);
    baseTextRef.current = result.text;
    setCleanedLyrics(result.text);
    setFoundSections(result.sections);
    applyFormatting(result.text);
  };

  const handleCopy = async () => {
    if (!displayedLyrics) return;
    try {
      await navigator.clipboard.writeText(displayedLyrics);
    } catch {
      // fallback
    }
  };

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

  return (
    <div className="flex min-h-screen flex-col bg-stone-100">
      <Header />

      <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-4 overflow-hidden px-4 py-5 sm:px-6">
        <LyricEditor
          input={rawLyrics}
          output={displayedLyrics}
          onInputChange={setRawLyrics}
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
        />
      </main>

      <footer className="border-t px-4 py-5 text-center text-xs text-stone-400">
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
