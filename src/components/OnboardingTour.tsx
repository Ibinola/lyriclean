"use client";

import { useCallback, useEffect, useRef, useState } from "react";

const LS_KEY = "lyriclean:tourDone";

interface Step {
  target: string;
  title: string;
  body: string;
  placement: "bottom" | "top" | "left" | "right";
}

const steps: Step[] = [
  {
    target: "#input-area",
    title: "Paste Raw Lyrics",
    body: "Paste raw lyrics here. lyriclean handles all the messy formatting.",
    placement: "bottom",
  },
  {
    target: "#clean-btn",
    title: "Clean Lyrics",
    body: "Strips fillers (x2, Repeat, Refrain, emoji), normalizes section headers, and splits into slides.",
    placement: "top",
  },
  {
    target: "#lines-control",
    title: "Lines per Slide",
    body: "Set how many lines appear per slide. Change it anytime and the output updates instantly.",
    placement: "top",
  },
  {
    target: "#output-panel",
    title: "Reorder & Edit",
    body: "Drag any slide to rearrange the song. Click the text to edit a slide directly.",
    placement: "left",
  },
  {
    target: "#export-btn",
    title: "Export",
    body: "Download in EasyWorship, ProPresenter, or PowerPoint format — ready for service.",
    placement: "top",
  },
];

function getArrowStyle(placement: string) {
  const base = "absolute h-2 w-2 rotate-45 bg-card border-l border-t";
  switch (placement) {
    case "bottom":
      return `${base} -top-1 left-1/2 -translate-x-1/2`;
    case "top":
      return `${base} -bottom-1 left-1/2 -translate-x-1/2 border-l-0 border-t-0 border-r border-b`;
    case "left":
      return `${base} -right-1 top-1/2 -translate-y-1/2 border-l-0 border-t-0 border-r border-b`;
    case "right":
      return `${base} -left-1 top-1/2 -translate-y-1/2`;
    default:
      return "";
  }
}

function getTooltipPosition(
  el: Element,
  placement: string,
): { top: number; left: number } {
  const rect = el.getBoundingClientRect();
  const gap = 12;

  switch (placement) {
    case "bottom":
      return { top: rect.bottom + gap, left: rect.left + rect.width / 2 };
    case "top":
      return { top: rect.top - gap, left: rect.left + rect.width / 2 };
    case "left":
      return { top: rect.top + rect.height / 2, left: rect.left - gap };
    case "right":
      return { top: rect.top + rect.height / 2, left: rect.right + gap };
    default:
      return { top: rect.bottom + gap, left: rect.left + rect.width / 2 };
  }
}

export default function OnboardingTour() {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);
  const tooltipRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const done = localStorage.getItem(LS_KEY);
    if (!done) setOpen(true);
  }, []);

  useEffect(() => {
    if (!open) return;

    const s = steps[step];
    const el = document.querySelector(s.target);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [step, open]);

  const finish = useCallback(() => {
    localStorage.setItem(LS_KEY, "1");
    setOpen(false);
  }, []);

  if (!open) return null;

  const s = steps[step];
  const el = document.querySelector(s.target);
  const pos = el
    ? getTooltipPosition(el, s.placement)
    : { top: 200, left: window.innerWidth / 2 };

  // Clamp tooltip so it doesn't overflow the viewport
  const tooltipWidth = 320;
  const tooltipHeight = 180;
  let left = pos.left - tooltipWidth / 2;
  let top = pos.top;

  if (s.placement === "left") left = pos.left - tooltipWidth - 16;
  if (s.placement === "right") left = pos.left + 16;
  if (s.placement === "top") top = pos.top - tooltipHeight - 8;
  if (s.placement === "bottom") top = pos.top + 8;

  left = Math.max(16, Math.min(left, window.innerWidth - tooltipWidth - 16));
  top = Math.max(16, Math.min(top, window.innerHeight - tooltipHeight - 16));

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/30"
        onClick={finish}
      />

      {/* Target highlight */}
      {el && (
        <div
          className="fixed z-40 rounded-lg ring-2 ring-indigo-500/60 ring-offset-2 ring-offset-transparent transition-all duration-300"
          style={{
            top: el.getBoundingClientRect().top - 4,
            left: el.getBoundingClientRect().left - 4,
            width: (el as HTMLElement).offsetWidth + 8,
            height: (el as HTMLElement).offsetHeight + 8,
            pointerEvents: "none",
          }}
        />
      )}

      {/* Tooltip card */}
      <div
        ref={tooltipRef}
        className="fixed z-50 w-80 rounded-xl border bg-card shadow-2xl"
        style={{ top, left }}
      >
        {/* Arrow */}
        <div className={getArrowStyle(s.placement)} />

        {/* Progress dots */}
        <div className="flex gap-1.5 px-5 pt-4">
          {steps.map((_, i) => (
            <div
              key={i}
              className={`h-1 flex-1 rounded-full transition-colors ${
                i === step ? "bg-indigo-600" : "bg-muted-foreground/20"
              }`}
            />
          ))}
        </div>

        {/* Body */}
        <div className="px-5 pb-4 pt-3">
          <h3 className="mb-1 text-[15px] font-semibold">{s.title}</h3>
          <p className="text-sm leading-relaxed text-muted-foreground">
            {s.body}
          </p>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between border-t px-5 py-3">
          <button
            onClick={finish}
            className="text-xs text-muted-foreground underline-offset-2 hover:underline"
          >
            Skip tour
          </button>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setStep(step - 1)}
              className={`rounded-lg border px-3 py-1.5 text-xs transition-colors hover:bg-muted ${
                step === 0 ? "invisible" : ""
              }`}
            >
              Previous
            </button>
            <button
              onClick={() =>
                step < steps.length - 1 ? setStep(step + 1) : finish()
              }
              className="rounded-lg bg-indigo-600 px-3 py-1.5 text-xs text-white transition-colors hover:bg-indigo-700"
            >
              {step < steps.length - 1 ? "Next" : "Done"}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
