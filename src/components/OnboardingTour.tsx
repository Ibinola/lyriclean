"use client";

import { useCallback, useEffect, useState } from "react";

const LS_KEY = "lyriclean:tourDone";

const steps = [
  {
    target: "#input-area",
    title: "Paste Raw Lyrics",
    body: "Copy lyrics from WhatsApp or email and paste them here. lyriclean strips all the clutter automatically.",
  },
  {
    target: "#clean-btn",
    title: "Clean Lyrics",
    body: "Click this to remove fillers (x2, Repeat, Refrain, emoji), normalize section headers, and split into slides.",
  },
  {
    target: "#lines-control",
    title: "Lines per Slide",
    body: "Choose how many lines appear on each slide. Change it anytime \u2014 the output updates instantly.",
  },
  {
    target: "#output-panel",
    title: "Reorder & Edit",
    body: "Drag any slide to rearrange the song order. Click the text to edit a slide directly.",
  },
  {
    target: "#export-btn",
    title: "Export",
    body: "Download in EasyWorship, ProPresenter, or PowerPoint format \u2014 ready for Sunday.",
  },
];

export default function OnboardingTour() {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);

  useEffect(() => {
    const done = localStorage.getItem(LS_KEY);
    if (!done) setOpen(true);
  }, []);

  const finish = useCallback(() => {
    localStorage.setItem(LS_KEY, "1");
    setOpen(false);
  }, []);

  if (!open) return null;

  return (
    <>
      <div
        className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
        onClick={finish}
      />
      <div className="fixed left-1/2 top-1/2 z-50 w-full max-w-sm -translate-x-1/2 -translate-y-1/2 rounded-2xl border bg-card p-6 shadow-2xl">
        <div className="mb-5 flex gap-1.5">
          {steps.map((_, i) => (
            <div
              key={i}
              className={`h-1.5 flex-1 rounded-full transition-colors ${
                i === step ? "bg-indigo-600" : "bg-muted"
              }`}
            />
          ))}
        </div>

        <h3 className="mb-1.5 text-lg font-semibold">{steps[step].title}</h3>
        <p className="mb-6 text-sm leading-relaxed text-muted-foreground">
          {steps[step].body}
        </p>

        <div className="flex items-center justify-between">
          <button
            onClick={finish}
            className="text-sm text-muted-foreground underline-offset-2 hover:underline"
          >
            Skip tour
          </button>
          <div className="flex items-center gap-2">
            {step > 0 && (
              <button
                onClick={() => setStep(step - 1)}
                className="rounded-lg border px-4 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-muted"
              >
                Previous
              </button>
            )}
            <button
              onClick={() =>
                step < steps.length - 1 ? setStep(step + 1) : finish()
              }
              className="rounded-lg bg-indigo-600 px-4 py-1.5 text-sm text-white transition-colors hover:bg-indigo-700"
            >
              {step < steps.length - 1 ? "Next" : "Done"}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
