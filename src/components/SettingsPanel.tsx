"use client";

import { useEffect, useRef, useState } from "react";
import type { CleaningOptions } from "@/lib/cleaningOptions";
import { optionLabels, saveOptions, loadOptions, defaultOptions } from "@/lib/cleaningOptions";

interface SettingsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onOptionsChange: (options: CleaningOptions) => void;
}

function toggleGroup<T extends string>(label: string, keys: T[], current: Record<T, boolean>, onChange: (key: T, val: boolean) => void) {
  const allOn = keys.every((k) => current[k]);
  const allOff = keys.every((k) => !current[k]);
  const groupState = allOn ? "all" : allOff ? "none" : "mixed";

  return (
    <fieldset className="rounded-lg border p-3">
      <legend className="flex items-center gap-2 px-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        <span>{label}</span>
        <button
          onClick={() => {
            const newVal = groupState !== "all";
            for (const k of keys) onChange(k, newVal);
          }}
          className="rounded px-1.5 py-0.5 text-[10px] font-normal normal-case text-muted-foreground transition-colors hover:bg-muted"
        >
          {groupState === "all" ? "Disable All" : groupState === "none" ? "Enable All" : "Enable All"}
        </button>
      </legend>
      <div className="mt-2 space-y-1.5">
        {keys.map((k) => (
          <label key={k} className="flex cursor-pointer items-start gap-2 text-sm">
            <input
              type="checkbox"
              checked={current[k]}
              onChange={(e) => onChange(k, e.target.checked)}
              className="mt-0.5 h-3.5 w-3.5 rounded border-gray-300 text-indigo-600"
            />
            <span className="text-muted-foreground">{optionLabels[k as keyof CleaningOptions]}</span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}

export default function SettingsPanel({ isOpen, onClose, onOptionsChange }: SettingsPanelProps) {
  const [options, setOptions] = useState<CleaningOptions>(defaultOptions);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) setOptions(loadOptions());
  }, [isOpen]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) onClose();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const setOne = (key: keyof CleaningOptions, val: boolean) => {
    const next = { ...options, [key]: val };
    setOptions(next);
    saveOptions(next);
    onOptionsChange(next);
  };

  const resetAll = () => {
    setOptions(defaultOptions);
    saveOptions(defaultOptions);
    onOptionsChange(defaultOptions);
  };

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/40" onClick={onClose} />
      <div
        ref={panelRef}
        className="fixed inset-x-4 top-[10%] z-50 mx-auto max-w-lg overflow-y-auto rounded-xl border bg-card p-5 shadow-xl max-sm:inset-x-2 max-sm:top-2"
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-base font-semibold">Cleaning Rules</h2>
          <button
            onClick={onClose}
            className="rounded-md px-2 py-1 text-sm text-muted-foreground transition-colors hover:bg-muted"
          >
            Done &#10005;
          </button>
        </div>

        <div className="space-y-3">
          {toggleGroup("Filler & Instructions", [
            "removeFillerLines",
            "removeRepeatMarkers",
            "removeLeaderCues",
            "removeBGV",
            "removeInstrumentalSections",
            "removeStageDirections",
          ] as (keyof CleaningOptions)[], options, setOne)}

          {toggleGroup("Annotations & Prefixes", [
            "stripVoiceAnnotations",
            "stripNumberPrefixes",
            "stripBulletPrefixes",
            "stripCallResponse",
          ] as (keyof CleaningOptions)[], options, setOne)}

          {toggleGroup("Formatting", [
            "removeEmoji",
            "normalizeSectionLabels",
            "spellcheck",
            "collapseEmptyLines",
          ] as (keyof CleaningOptions)[], options, setOne)}
        </div>

        <div className="mt-4 flex items-center justify-between border-t pt-4">
          <button
            onClick={resetAll}
            className="rounded-md px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:bg-muted"
          >
            Reset to Defaults
          </button>
          <p className="text-[10px] text-muted-foreground">Preferences saved automatically</p>
        </div>
      </div>
    </>
  );
}
