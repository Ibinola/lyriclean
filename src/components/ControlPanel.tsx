"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useState } from "react";

interface ControlPanelProps {
  onClean: () => void;
  onCopy: () => void;
  linesPerBreak: number;
  onLinesPerBreakChange: (val: number) => void;
  onReplace: (find: string, replace: string) => void;
  rawLines: number;
  cleanedLines: number;
  sections: number;
  slides: number;
  showSlides: boolean;
  hasOutput: boolean;
}

export default function ControlPanel({
  onClean,
  onCopy,
  linesPerBreak,
  onLinesPerBreakChange,
  onReplace,
  rawLines,
  cleanedLines,
  sections,
  slides,
  showSlides,
  hasOutput,
}: ControlPanelProps) {
  const [findText, setFindText] = useState("");
  const [replaceText, setReplaceText] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    onCopy();
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleReplace = () => {
    if (!findText) return;
    onReplace(findText, replaceText);
  };

  return (
    <div className="space-y-3">
      {/* Lines per slide */}
      <div className="flex items-center gap-3 rounded-xl border bg-white px-4 py-2.5 text-sm flex-wrap">
        <Label
          htmlFor="linesPerBreak"
          className="text-xs font-semibold uppercase tracking-wide text-stone-500"
        >
          Lines per slide:
        </Label>
        <div className="flex items-center">
          <button
            onClick={() => onLinesPerBreakChange(Math.max(0, linesPerBreak - 1))}
            className="rounded-l-lg border px-2.5 py-1.5 text-sm text-stone-600 transition-colors hover:bg-stone-100"
          >
            &minus;
          </button>
          <input
            id="linesPerBreak"
            type="number"
            value={linesPerBreak}
            min={0}
            max={10}
            onChange={(e) =>
              onLinesPerBreakChange(Math.min(10, Math.max(0, parseInt(e.target.value) || 0)))
            }
            className="w-11 border-y py-1.5 text-center text-sm outline-none [-moz-appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
          />
          <button
            onClick={() => onLinesPerBreakChange(Math.min(10, linesPerBreak + 1))}
            className="rounded-r-lg border px-2.5 py-1.5 text-sm text-stone-600 transition-colors hover:bg-stone-100"
          >
            +
          </button>
        </div>
        <span className="text-xs text-stone-400">
          {linesPerBreak === 0 ? "0 = no splitting" : `${linesPerBreak} lines per slide`}
        </span>
      </div>

      {/* Action buttons */}
      <div className="flex flex-wrap gap-2">
        <Button onClick={onClean} className="bg-indigo-600 hover:bg-indigo-700">
          &#10003; Clean Lyrics
        </Button>
        <Button
          onClick={handleCopy}
          disabled={!hasOutput}
          variant={copied ? "default" : "secondary"}
          className={copied ? "bg-emerald-600 hover:bg-emerald-700" : ""}
        >
          {copied ? "\u2713 Copied!" : "\u{1F4CB} Copy to Clipboard"}
        </Button>
        <Button
          onClick={() => setShowSearch(!showSearch)}
          variant="secondary"
        >
          &#128270; Search &amp; Replace
        </Button>
      </div>

      {/* Search & Replace */}
      {showSearch && (
        <div className="rounded-xl border bg-white px-4 py-3">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="flex items-center gap-2 text-sm font-semibold">
              &#128270; Search &amp; Replace
            </h3>
            <button
              onClick={() => setShowSearch(false)}
              className="text-xs text-stone-400 transition-colors hover:text-stone-600"
            >
              Hide &#10005;
            </button>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
            <div className="flex-1 space-y-1">
              <Label
                htmlFor="findText"
                className="text-xs font-semibold uppercase text-stone-500"
              >
                Find
              </Label>
              <Input
                id="findText"
                value={findText}
                onChange={(e) => setFindText(e.target.value)}
                placeholder="e.g. halellujah"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    if (replaceText) handleReplace();
                    else document.getElementById("replaceText")?.focus();
                  }
                }}
              />
            </div>
            <div className="flex-1 space-y-1">
              <Label
                htmlFor="replaceText"
                className="text-xs font-semibold uppercase text-stone-500"
              >
                Replace with
              </Label>
              <Input
                id="replaceText"
                value={replaceText}
                onChange={(e) => setReplaceText(e.target.value)}
                placeholder="e.g. hallelujah"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleReplace();
                  }
                }}
              />
            </div>
            <Button onClick={handleReplace} className="bg-indigo-600 hover:bg-indigo-700">
              Replace All
            </Button>
          </div>
        </div>
      )}

      <Separator />

      {/* Stats */}
      <div className="flex flex-wrap items-center gap-x-6 gap-y-1 text-xs text-stone-500">
        <span>
          <span className="font-semibold text-stone-900">{rawLines}</span> raw
        </span>
        <span>
          &#8594; <span className="font-semibold text-stone-900">{cleanedLines}</span> cleaned
        </span>
        <span>
          <span className="mr-1 inline-block h-1.5 w-1.5 rounded-full bg-amber-500" />
          <span className="font-semibold text-stone-900">{sections}</span> sections
        </span>
        {showSlides && (
          <span>
            <span className="mr-1 inline-block h-1.5 w-1.5 rounded-full bg-amber-500" />
            <span className="font-semibold text-stone-900">{slides}</span> slides
          </span>
        )}
      </div>
    </div>
  );
}
