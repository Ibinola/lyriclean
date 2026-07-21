"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useRef, useState } from "react";

interface ControlPanelProps {
  onClean: () => void;
  onCopy: () => void;
  onExport: (format: "ews" | "pro" | "pptx") => void;
  linesPerBreak: number;
  onLinesPerBreakChange: (val: number) => void;
  onReplace: (find: string, replace: string) => void;
  rawLines: number;
  cleanedLines: number;
  sections: number;
  slides: number;
  showSlides: boolean;
  hasOutput: boolean;
  showSearch: boolean;
  onShowSearchChange: (val: boolean) => void;
  findInputRef: React.RefObject<HTMLInputElement | null>;
  duplicates: number;
  cleaning: boolean;
  exporting: "ews" | "pro" | "pptx" | null;
}

export default function ControlPanel({
  onClean,
  onCopy,
  onExport,
  linesPerBreak,
  onLinesPerBreakChange,
  onReplace,
  rawLines,
  cleanedLines,
  sections,
  slides,
  showSlides,
  hasOutput,
  showSearch,
  onShowSearchChange,
  findInputRef,
  duplicates,
  cleaning,
  exporting,
}: ControlPanelProps) {
  const [findText, setFindText] = useState("");
  const [replaceText, setReplaceText] = useState("");
  const [copied, setCopied] = useState(false);
  const [showExport, setShowExport] = useState(false);
  const exportRef = useRef<HTMLDivElement>(null);

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
      <div
        id="lines-control"
        className="flex items-center gap-3 rounded-xl border bg-card px-4 py-2.5 text-sm flex-wrap"
      >
        <Label
          htmlFor="linesPerBreak"
          className="text-xs font-semibold uppercase tracking-wide text-muted-foreground"
        >
          Lines per slide:
        </Label>
        <div className="flex items-center">
          <button
            onClick={() => onLinesPerBreakChange(Math.max(0, linesPerBreak - 1))}
            className="rounded-l-lg border px-2.5 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-muted"
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
            className="w-11 border-y py-1.5 text-center text-sm text-foreground outline-none bg-transparent [-moz-appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
          />
          <button
            onClick={() => onLinesPerBreakChange(Math.min(10, linesPerBreak + 1))}
            className="rounded-r-lg border px-2.5 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-muted"
          >
            +
          </button>
        </div>
        <span className="text-xs text-muted-foreground">
          {linesPerBreak === 0 ? "0 = no splitting" : `${linesPerBreak} lines per slide`}
        </span>
      </div>

      {/* Action buttons */}
      <div className="flex flex-wrap gap-2">
        <Button
          id="clean-btn"
          onClick={onClean}
          disabled={cleaning}
          className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60"
        >
          {cleaning ? <Spinner /> : null}
          {cleaning ? " Cleaning..." : "\u2713 Clean Lyrics"}
        </Button>
        <kbd className="hidden items-center rounded-md border bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground shadow-sm sm:inline-flex">
          ⌘+Enter
        </kbd>
        <Button
          onClick={handleCopy}
          disabled={!hasOutput}
          variant={copied ? "default" : "secondary"}
          className={copied ? "bg-emerald-600 hover:bg-emerald-700" : ""}
        >
          {copied ? "\u2713 Copied!" : "\u{1F4CB} Copy to Clipboard"}
        </Button>
        <Button onClick={() => onShowSearchChange(!showSearch)} variant="secondary">
          &#128270; Search &amp; Replace
        </Button>
        <div className="relative" ref={exportRef}>
          <Button
            id="export-btn"
            onClick={() => setShowExport(!showExport)}
            disabled={!hasOutput || exporting !== null}
            variant="secondary"
          >
            {exporting ? <Spinner /> : null}
            {exporting ? " Exporting..." : "\u2195 Export"}
          </Button>
          {showExport && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setShowExport(false)} />
              <div className="absolute bottom-full left-0 z-20 mb-1 w-52 overflow-hidden rounded-lg border bg-card shadow-lg max-sm:bottom-auto max-sm:top-full max-sm:mb-0 max-sm:mt-1">
                <button
                  onClick={() => {
                    onExport("ews");
                    setShowExport(false);
                  }}
                  disabled={exporting !== null}
                  className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm transition-colors hover:bg-muted disabled:opacity-50"
                >
                  {exporting === "ews" ? <Spinner /> : null}
                  EasyWorship (.ews)
                </button>
                <button
                  onClick={() => {
                    onExport("pro");
                    setShowExport(false);
                  }}
                  disabled={exporting !== null}
                  className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm transition-colors hover:bg-muted disabled:opacity-50"
                >
                  {exporting === "pro" ? <Spinner /> : null}
                  ProPresenter (.pro)
                </button>
                <button
                  onClick={() => {
                    onExport("pptx");
                    setShowExport(false);
                  }}
                  disabled={exporting !== null}
                  className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm transition-colors hover:bg-muted disabled:opacity-50"
                >
                  {exporting === "pptx" ? <Spinner /> : null}
                  PowerPoint (.pptx)
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Search & Replace */}
      {showSearch && (
        <div className="rounded-xl border bg-card px-4 py-3">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="flex items-center gap-2 text-sm font-semibold">
              &#128270; Search &amp; Replace
            </h3>
            <button
              onClick={() => onShowSearchChange(false)}
              className="text-xs text-muted-foreground transition-colors hover:text-foreground"
            >
              Hide &#10005;
            </button>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
            <div className="flex-1 space-y-1">
              <Label
                htmlFor="findText"
                className="text-xs font-semibold uppercase text-muted-foreground"
              >
                Find
              </Label>
              <Input
                ref={findInputRef}
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
                className="text-xs font-semibold uppercase text-muted-foreground"
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
      <div className="flex flex-wrap items-center gap-x-6 gap-y-1 text-xs text-muted-foreground">
        <span>
          <span className="font-semibold text-foreground">{rawLines}</span> raw
        </span>
        <span>
          &#8594; <span className="font-semibold text-foreground">{cleanedLines}</span> cleaned
        </span>
        <span>
          <span className="mr-1 inline-block h-1.5 w-1.5 rounded-full bg-amber-500" />
          <span className="font-semibold text-foreground">{sections}</span> sections
        </span>
        {showSlides && (
          <span>
            <span className="mr-1 inline-block h-1.5 w-1.5 rounded-full bg-amber-500" />
            <span className="font-semibold text-foreground">{slides}</span> slides
          </span>
        )}
        {duplicates > 0 && (
          <span>
            <span className="mr-1 inline-block h-1.5 w-1.5 rounded-full bg-red-500" />
            <span className="font-semibold text-red-600 dark:text-red-400">{duplicates}</span>{" "}
            duplicate{duplicates !== 1 ? "s" : ""} flagged
          </span>
        )}
      </div>
    </div>
  );
}

function Spinner() {
  return (
    <svg className="h-3.5 w-3.5 animate-spin" viewBox="0 0 24 24" fill="none">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
      />
    </svg>
  );
}
