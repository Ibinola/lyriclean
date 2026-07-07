"use client";

import { useCallback, useEffect, useState } from "react";
import { Joyride, STATUS } from "react-joyride";

const LS_KEY = "lyriclean:tourDone";

const steps = [
  {
    target: "main",
    title: "Welcome to lyriclean",
    content: "Let me show you around — it only takes 30 seconds.",
    placement: "center" as const,
    disableBeacon: true,
  },
  {
    target: "#input-area",
    title: "Paste Raw Lyrics",
    content:
      "Paste lyrics from WhatsApp, email, or a song sheet. lyriclean handles all the messy formatting.",
    placement: "right" as const,
  },
  {
    target: "#clean-btn",
    title: "Clean Lyrics",
    content:
      "Click this to strip fillers (x2, Repeat, Refrain), normalize section headers, and split into slides.",
    placement: "bottom" as const,
  },
  {
    target: "#lines-control",
    title: "Lines per Slide",
    content:
      "Set how many lines appear on each slide. Change it anytime and the output updates instantly.",
    placement: "bottom" as const,
  },
  {
    target: "#output-panel",
    title: "Reorder & Edit",
    content:
      "Drag slides to rearrange the song order. Click any slide text to edit it directly.",
    placement: "left" as const,
  },
  {
    target: "#export-btn",
    title: "Export",
    content:
      "Download in EasyWorship, ProPresenter, or PowerPoint format — ready for service.",
    placement: "top" as const,
  },
];

export default function OnboardingTour() {
  const [run, setRun] = useState(false);

  useEffect(() => {
    const done = localStorage.getItem(LS_KEY);
    if (!done) setRun(true);
  }, []);

  const handleCallback = useCallback((data: Record<string, unknown>) => {
    const { status } = data as { status: string };
    if (status === STATUS.FINISHED || status === STATUS.SKIPPED) {
      localStorage.setItem(LS_KEY, "1");
      setRun(false);
    }
  }, []);

  // @ts-expect-error react-joyride types are incomplete
  return <Joyride steps={steps} run={run} callback={handleCallback} continuous showProgress showSkipButton scrollToFirstStep disableScrolling={false} locale={{ back: "Previous", close: "Skip", last: "Done", next: "Next", skip: "Skip tour" }} styles={{ options: { primaryColor: "#4f46e5", textColor: "#1e1b4b", backgroundColor: "#ffffff", arrowColor: "#ffffff", overlayColor: "rgba(0, 0, 0, 0.4)", zIndex: 1000 }, tooltipContainer: { textAlign: "left" }, buttonNext: { backgroundColor: "#4f46e5", fontSize: "0.875rem", padding: "6px 16px" }, buttonBack: { color: "#6b7280", fontSize: "0.875rem", marginRight: 8 }, buttonSkip: { color: "#9ca3af", fontSize: "0.875rem" } }} />;
}
