"use client";

import { useState } from "react";

const shortcuts = [
  { keys: ["⌘", "Enter"], label: "Clean lyrics" },
  { keys: ["⌘", "Z"], label: "Undo" },
  { keys: ["⌘", "Shift", "Z"], label: "Redo" },
  { keys: ["⌘", "Shift", "C"], label: "Copy to clipboard" },
  { keys: ["⌘", "F"], label: "Search & Replace" },
  { keys: ["Esc"], label: "Close search / settings" },
];

export default function KeyboardShortcuts() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="text-indigo-600 hover:underline"
      >
        Keyboard shortcuts
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40 bg-black/40" onClick={() => setOpen(false)} />
          <div className="fixed inset-x-4 top-[15%] z-50 mx-auto max-w-md rounded-xl border bg-card p-5 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-base font-semibold">Keyboard Shortcuts</h2>
              <button
                onClick={() => setOpen(false)}
                className="rounded-md px-2 py-1 text-sm text-muted-foreground transition-colors hover:bg-muted"
              >
                Close &#10005;
              </button>
            </div>
            <div className="space-y-2">
              {shortcuts.map((s) => (
                <div key={s.label} className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">{s.label}</span>
                  <span className="flex items-center gap-1">
                    {s.keys.map((k) => (
                      <kbd
                        key={k}
                        className="rounded-md border bg-muted px-1.5 py-0.5 text-[11px] font-medium text-muted-foreground shadow-sm"
                      >
                        {k}
                      </kbd>
                    ))}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </>
  );
}
