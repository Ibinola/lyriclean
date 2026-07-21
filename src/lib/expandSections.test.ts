import { describe, it, expect } from "vitest";
import { expandReferences } from "./expandSections";

describe("expandReferences", () => {
  it("returns empty string for empty input", () => {
    expect(expandReferences("")).toBe("");
    expect(expandReferences("   ")).toBe("   ");
  });

  it("returns text unchanged when no references exist", () => {
    const input = "Verse 1\nAmazing grace\nHow sweet the sound";
    expect(expandReferences(input)).toBe(input);
  });

  it("expands parenthetical reference with earlier section content", () => {
    const input =
      "Verse 1\nAmazing grace\nHow sweet the sound\n\n" +
      "Chorus\nPraise the Lord\n\n" +
      "(Chorus)";
    const result = expandReferences(input);
    expect(result).toContain("Verse 1");
    expect(result).toContain("Praise the Lord");
    expect(result).not.toContain("(Chorus)");
  });

  it("expands bracketed reference [Refrain]", () => {
    const input = "Verse\nLine 1\n\n" + "Refrain\nLine A\nLine B\n\n" + "[Refrain]";
    const result = expandReferences(input);
    expect(result).toContain("Line A");
    expect(result).toContain("Line B");
    expect(result).not.toContain("[Refrain]");
  });

  it("uses first occurrence when multiple definitions exist", () => {
    const input =
      "Chorus\nFirst version\nLine A\n\n" +
      "Verse\nMiddle\n\n" +
      "Chorus\nSecond version\nLine B\n\n" +
      "(Chorus)";
    const result = expandReferences(input);
    // The reference is replaced with the first definition;
    // second definition paragraph remains in the text
    const chorusCount = (result.match(/First version/g) || []).length;
    expect(chorusCount).toBe(2);
    expect(result).toContain("Second version");
  });

  it("expands numbered references like (Chorus 2)", () => {
    const input =
      "Verse 1\nLine one\n\n" + "Chorus\nChorus line\n\n" + "Verse 2\nLine two\n\n" + "(Chorus)";
    const result = expandReferences(input);
    expect(result).toContain("Chorus line");
    expect(result).not.toContain("(Chorus)");
  });

  it("does not expand if section has no content lines", () => {
    const input = "Chorus\n\n" + "(Chorus)";
    const result = expandReferences(input);
    expect(result).toContain("(Chorus)");
  });

  it("handles indirect references", () => {
    const input =
      "Verse 1\nLine one\n\n" + "Chorus\nChorus line\n\n" + "(Verse 1)\n\n" + "(Chorus)";
    const result = expandReferences(input);
    expect(result).toContain("Line one");
    expect(result).toContain("Chorus line");
    expect(result).not.toContain("(Verse 1)");
    expect(result).not.toContain("(Chorus)");
  });

  it("preserves non-reference parenthetical text", () => {
    const input = "Verse\nLine 1\n\n" + "Some (parenthetical) note";
    const result = expandReferences(input);
    expect(result).toContain("(parenthetical)");
  });
});
