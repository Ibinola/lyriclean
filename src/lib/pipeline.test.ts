// Exercises the exact function composition that tool/page.tsx's
// runCleaningPipeline uses (preprocessWhatsApp -> expandReferences ->
// cleanLyrics -> detectDuplicates -> applyLineBreaks). runCleaningPipeline
// itself can't be unit tested directly - it's a useCallback closing over
// React state setters in a client component, and this project has no
// component-rendering test library installed - so this file proves the
// composition is correct at the level that is testable, and the manual
// browser verification in this task's report covers the React wiring
// around it (the auto-clean trigger, state timing, autosave).

import { describe, it, expect } from "vitest";
import { preprocessWhatsApp } from "./preprocessWhatsApp";
import { expandReferences } from "./expandSections";
import { cleanLyrics, applyLineBreaks } from "./clean";
import { detectDuplicates } from "./detectDuplicates";
import type { CleaningOptions } from "./cleaningOptions";

function runPipeline(input: string, options?: Partial<CleaningOptions>, linesPerBreak = 0) {
  const whatsappNormalized = preprocessWhatsApp(input);
  const expanded = expandReferences(whatsappNormalized);
  const result = cleanLyrics(expanded, options);
  const duplicates = detectDuplicates(result.text);
  const displayed = applyLineBreaks(result.text, linesPerBreak);
  return { ...result, duplicates, displayed };
}

describe("composed pipeline: raw text is never mutated", () => {
  it("leaves the original input string untouched", () => {
    const input = "*Verse 1*\nAmazing grace\nHow sweet the sound";
    const originalCopy = input.slice();
    runPipeline(input);
    expect(input).toBe(originalCopy);
  });

  it("cleaned output differs from raw input in the expected way", () => {
    const input = "*Chorus*\nMy chains are gone";
    const { text } = runPipeline(input);
    expect(text).not.toBe(input);
    expect(text).toBe("My chains are gone");
  });
});

describe("composed pipeline: respects current cleaning preferences", () => {
  it("preserves leader/BGV cues and instrumental markers when their toggles are off", () => {
    const input = "Lead: Amazing grace\nBGV: harmony\n[Instrumental]\nHow sweet the sound";
    const enabled = runPipeline(input);
    expect(enabled.text).toBe("Amazing grace\nHow sweet the sound");

    const disabled = runPipeline(input, {
      removeLeaderCues: false,
      removeBGV: false,
      removeInstrumentalSections: false,
    });
    expect(disabled.text).toContain("Lead: Amazing grace");
    expect(disabled.text).toContain("BGV: harmony");
    expect(disabled.text).toMatch(/instrumental/i);
  });

  it("respects removeRepeatMarkers for section-referencing repeat directives", () => {
    const input = "Amazing grace\nRepeat Chorus x2\nHow sweet the sound";
    expect(runPipeline(input).text).toBe("Amazing grace\nHow sweet the sound");
    expect(runPipeline(input, { removeRepeatMarkers: false }).text).toBe(
      "Amazing grace\nRepeat Chorus x2\nHow sweet the sound",
    );
  });
});

describe("composed pipeline: WhatsApp preprocessing runs as part of the flow", () => {
  it("unwraps a WhatsApp-emphasized section label before section detection sees it", () => {
    const input = "🎤 *Chorus*\nMy chains are gone";
    const result = runPipeline(input, { keepSectionHeaders: true });
    expect(result.text).toBe("Chorus\nMy chains are gone");
    expect(result.sections).toEqual(["Chorus"]);
  });
});

describe("composed pipeline: lines-per-slide is applied to the final display text", () => {
  it("groups the cleaned output into slides using the current lines-per-slide value", () => {
    const input = "Line one\nLine two\nLine three\nLine four";
    const result = runPipeline(input, {}, 2);
    expect(result.displayed).toBe("Line one\nLine two\n\nLine three\nLine four");
  });

  it("leaves output as a single block when lines-per-slide is 0", () => {
    const input = "Line one\nLine two\nLine three\nLine four";
    const result = runPipeline(input, {}, 0);
    expect(result.displayed).toBe(result.text);
  });
});

describe("composed pipeline: duplicate detection runs on the cleaned text", () => {
  it("flags a near-identical repeated section", () => {
    const input = `Chorus
My chains are gone
I've been set free

Chorus
My chains are gone
I've been set free`;
    const result = runPipeline(input);
    expect(result.duplicates.length).toBeGreaterThan(0);
  });
});

describe("composed pipeline: a realistic full WhatsApp-pasted song end to end", () => {
  it("produces a fully structured, correct result", () => {
    const input = `*Verse 1*
Amazing grace
How sweet the sound

🎤 *Chorus*
My chains are gone
I've been set free

[Instrumental]

BGV: Hallelujah

Repeat Chorus x2`;

    const result = runPipeline(input, { keepSectionHeaders: true });

    expect(result.sections).toEqual(["Verse 1", "Chorus"]);
    expect(result.text).toContain("Amazing grace");
    expect(result.text).toContain("How sweet the sound");
    expect(result.text).toContain("My chains are gone");
    expect(result.text).toContain("I've been set free");
    expect(result.text).toContain("Hallelujah");
    expect(result.text).not.toContain("*");
    expect(result.text).not.toContain("🎤");
    expect(result.text).not.toMatch(/\[Instrumental\]/i);
    expect(result.text).not.toContain("BGV");
    expect(result.text).not.toContain("Repeat Chorus");
  });
});
