"use client";

import { Card } from "@/components/ui/card";
import { useState } from "react";

interface LyricEditorProps {
  input: string;
  output: string;
  onInputChange: (val: string) => void;
  onOutputChange: (val: string) => void;
}

export default function LyricEditor({
  input,
  output,
  onInputChange,
  onOutputChange,
}: LyricEditorProps) {
  const [showEmpty, setShowEmpty] = useState(true);

  return (
    <div className="grid flex-1 grid-cols-1 gap-4 min-h-0 md:grid-cols-2 md:gap-6">
      <Card className="flex flex-col overflow-hidden">
        <div className="flex items-center justify-between border-b bg-stone-50 px-4 py-2.5 text-xs font-semibold uppercase tracking-wide text-stone-500">
          <span>Paste Raw Lyrics</span>
          <button
            onClick={() => {
              onInputChange("");
              setShowEmpty(true);
            }}
            className="rounded-md px-2 py-1 text-stone-400 transition-colors hover:bg-stone-200 hover:text-stone-600"
          >
            &#10005; Clear
          </button>
        </div>
        <div className="relative flex-1 min-h-0">
          <textarea
            value={input}
            onChange={(e) => onInputChange(e.target.value)}
            placeholder="Paste WhatsApp lyrics here..."
            spellCheck={false}
            className="absolute inset-0 resize-none border-0 bg-transparent p-4 font-mono text-sm leading-relaxed text-stone-900 outline-none placeholder:text-stone-400"
          />
        </div>
      </Card>

      <Card className="flex flex-col overflow-hidden">
        <div className="flex items-center justify-between border-b bg-stone-50 px-4 py-2.5 text-xs font-semibold uppercase tracking-wide text-stone-500">
          <span>Cleaned Lyrics</span>
        </div>
        <div className="relative flex-1 min-h-0">
          {!output && showEmpty ? (
            <div className="flex h-full flex-col items-center justify-center px-4 text-center text-stone-400">
              <span className="mb-3 text-3xl opacity-50">&#9835;</span>
              <p className="text-sm leading-relaxed">
                Paste lyrics in the left panel, then click{" "}
                <strong className="text-stone-600">Clean Lyrics</strong>.
              </p>
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
              className="absolute inset-0 overflow-y-auto whitespace-pre-wrap p-4 font-mono text-sm leading-relaxed text-stone-900 outline-none focus:bg-indigo-50 focus:ring-2 focus:ring-indigo-500 focus:ring-inset"
            >
              {output}
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
