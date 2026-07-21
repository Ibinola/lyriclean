"use client";

import { useEffect, useState } from "react";

interface Shortcut {
  keys: string[];
  label: string;
}

const shortcuts: Shortcut[] = [
  { keys: ["⌘", "Enter"], label: "Clean lyrics" },
  { keys: ["⌘", "⇧", "C"], label: "Copy to clipboard" },
  { keys: ["⌘", "F"], label: "Open search & replace" },
  { keys: ["Esc"], label: "Close search / modals" },
];

export default function KeyboardShortcuts() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const isMeta = e.metaKey || e.ctrlKey;
      if (isMeta && e.key === "/") {
        e.preventDefault();
        setOpen((p) => !p);
      }
      if (e.key === "Escape") {
        setOpen(false);
      }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, []);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="text-xs text-muted-foreground underline underline-offset-2 transition-colors hover:text-foreground"
        aria-label="Keyboard shortcuts"
      >
        <span className="hidden sm:inline">Keyboard shortcuts</span>
        <span className="sm:hidden">Shortcuts</span>
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh]"
          onClick={() => setOpen(false)}
        >
          <div className="fixed inset-0 bg-black/40" />
          <div
            className="relative z-10 mx-4 w-full max-w-xs rounded-xl border bg-card shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b px-5 py-3.5">
              <h2 className="flex items-center gap-2 text-sm font-semibold">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M15 6v12a3 3 0 1 0 3-3H6a3 3 0 1 0 3 3V6a3 3 0 1 0-3 3h12a3 3 0 1 0-3-3" />
                </svg>
                Keyboard Shortcuts
              </h2>
              <button
                onClick={() => setOpen(false)}
                className="text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                &#x2715;
              </button>
            </div>
            <div className="p-5">
              <div className="space-y-3">
                {shortcuts.map((s) => (
                  <div key={s.label} className="flex items-center justify-between gap-4">
                    <span className="text-xs text-muted-foreground">{s.label}</span>
                    <span className="flex items-center gap-1">
                      {s.keys.map((k, i) => (
                        <span key={i}>
                          <kbd className="inline-flex min-w-[1.5rem] items-center justify-center rounded-md border bg-muted px-1.5 py-0.5 text-[11px] font-medium tabular-nums text-foreground shadow-sm">
                            {k}
                          </kbd>
                          {i < s.keys.length - 1 && (
                            <span className="mx-0.5 text-xs text-muted-foreground">+</span>
                          )}
                        </span>
                      ))}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
