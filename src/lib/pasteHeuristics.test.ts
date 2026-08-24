import { describe, it, expect } from "vitest";
import { isMeaningfulPaste, MIN_MEANINGFUL_PASTE_LENGTH } from "./pasteHeuristics";

describe("isMeaningfulPaste: should auto-clean", () => {
  it("multi-line WhatsApp-style lyrics", () => {
    const text = "*Verse 1*\nAmazing grace\nHow sweet the sound";
    expect(isMeaningfulPaste(text)).toBe(true);
  });

  it("multi-line plain lyrics", () => {
    const text = "Amazing grace\nHow sweet the sound\nThat saved a wretch like me";
    expect(isMeaningfulPaste(text)).toBe(true);
  });

  it("a long single-line song with no section labels or newlines", () => {
    const text =
      "Amazing grace how sweet the sound that saved a wretch like me I once was lost but now am found";
    expect(text.includes("\n")).toBe(false);
    expect(isMeaningfulPaste(text)).toBe(true);
  });

  it("WhatsApp-formatted section labels count as multi-line content", () => {
    expect(isMeaningfulPaste("*Chorus*\nMy chains are gone")).toBe(true);
  });

  it("a short paste that is nonetheless multi-line", () => {
    expect(isMeaningfulPaste("Verse\nA")).toBe(true);
  });
});

describe("isMeaningfulPaste: should NOT auto-clean", () => {
  it("a single pasted word", () => {
    expect(isMeaningfulPaste("Hallelujah")).toBe(false);
  });

  it("a short phrase", () => {
    expect(isMeaningfulPaste("Amazing grace")).toBe(false);
  });

  it("empty or whitespace-only paste", () => {
    expect(isMeaningfulPaste("")).toBe(false);
    expect(isMeaningfulPaste("   ")).toBe(false);
    expect(isMeaningfulPaste("\n\n\n")).toBe(false);
  });

  it("a trailing stray newline on an otherwise short paste", () => {
    expect(isMeaningfulPaste("Amen\n")).toBe(false);
  });

  it("respects the exact length boundary", () => {
    const justUnder = "a".repeat(MIN_MEANINGFUL_PASTE_LENGTH - 1);
    const exact = "a".repeat(MIN_MEANINGFUL_PASTE_LENGTH);
    expect(isMeaningfulPaste(justUnder)).toBe(false);
    expect(isMeaningfulPaste(exact)).toBe(true);
  });
});
