import { describe, it, expect } from "vitest";
import { cleanLyrics, applyLineBreaks } from "./clean";

describe("cleanLyrics", () => {
  it("returns empty result for empty input", () => {
    for (const val of ["", "   ", null as unknown as string, undefined as unknown as string]) {
      const r = cleanLyrics(val);
      expect(r.text).toBe("");
      expect(r.sections).toEqual([]);
      expect(r.report.totalLinesBefore).toBe(0);
    }
  });

  it("strips ANSI escape codes", () => {
    const input = "\x1b[31mVerse\x1b[0m\nAmazing grace";
    const result = cleanLyrics(input);
    expect(result.text).toContain("Amazing grace");
    expect(result.text).toContain("Verse");
  });

  it("removes emoji but keeps empty lines", () => {
    const input = "🙏 Praise God\n\n❤️ His love";
    const result = cleanLyrics(input);
    expect(result.text).toContain("Praise God");
    expect(result.text).toContain("His love");
  });

  it("detects bracketed section labels", () => {
    const input = "[Verse 1]\nAmazing grace\n[Chorus]\nHow sweet the sound";
    const result = cleanLyrics(input);
    expect(result.text).toBe("Verse 1\nAmazing grace\nChorus\nHow sweet the sound");
    expect(result.sections).toContain("Verse 1");
    expect(result.sections).toContain("Chorus");
  });

  it("detects bare section labels", () => {
    const input = "Verse 1\nAmazing grace\nChorus\nHow sweet the sound";
    const result = cleanLyrics(input);
    expect(result.text).toBe("Verse 1\nAmazing grace\nChorus\nHow sweet the sound");
  });

  it("resolves Hungarian label aliases", () => {
    const input = "[refrén]\nHallelujah";
    const result = cleanLyrics(input);
    expect(result.text).toContain("Chorus");
  });

  it("resolves Italian label aliases", () => {
    const input = "Ritornello\nGloria a Dio";
    const result = cleanLyrics(input);
    expect(result.text).toContain("Chorus");
  });

  it("removes filler lines (standalone x-number)", () => {
    const input = "Amazing grace\n2x\nHow sweet the sound";
    const result = cleanLyrics(input);
    expect(result.text).not.toContain("2x");
    expect(result.text).toContain("Amazing grace");
    expect(result.text).toContain("How sweet the sound");
  });

  it("removes filler lines (instruction words only)", () => {
    const input = "Amazing grace\nLead\nBGV\nHow sweet";
    const result = cleanLyrics(input);
    expect(result.text).not.toContain("Lead");
    expect(result.text).not.toContain("BGV");
  });

  it("preserves content lines with instruction words mixed in", () => {
    const input = "We sing in harmony\nI will repeat this song";
    const result = cleanLyrics(input);
    expect(result.text).toContain("We sing in harmony");
    expect(result.text).toContain("I will repeat this song");
  });

  it("strips trailing x-number annotations from content lines", () => {
    const input = "Glory to God 2x\nHallelujah 8x";
    const result = cleanLyrics(input);
    expect(result.text).toContain("Glory to God\nHallelujah");
    expect(result.text).not.toContain("2x");
    expect(result.text).not.toContain("8x");
  });

  it("strips trailing x-number with BGV annotation", () => {
    const input = "Shout to the Lord 4x BGV";
    const result = cleanLyrics(input);
    expect(result.text).toContain("Shout to the Lord");
    expect(result.text).not.toContain("4x");
    expect(result.text).not.toContain("BGV");
  });

  it("removes meta-comment lines", () => {
    const input = "Amazing grace\n3 contributors\nHow sweet";
    const result = cleanLyrics(input);
    expect(result.text).not.toContain("contributors");
  });

  it("removes sung-in annotation lines", () => {
    const input = "Amazing grace\n(Sung in Yoruba)\nHow sweet";
    const result = cleanLyrics(input);
    expect(result.text).not.toContain("Sung in");
  });

  it("removes pure bracketed non-section lines", () => {
    const input = "Amazing grace\n[instrument only]\nHow sweet";
    const result = cleanLyrics(input);
    expect(result.text).not.toContain("instrument only");
  });

  it("condenses consecutive blank lines into one", () => {
    const input = "Line 1\n\n\n\nLine 2";
    const result = cleanLyrics(input);
    expect(result.text).toBe("Line 1\n\nLine 2");
  });

  it("strips leading numbers/bullets", () => {
    const input = "1. Amazing grace\n2. How sweet the sound";
    const result = cleanLyrics(input);
    expect(result.text).toBe("Amazing grace\nHow sweet the sound");
  });

  it("strips leading dashes/bullet chars", () => {
    const input = "- Amazing grace\n• How sweet";
    const result = cleanLyrics(input);
    expect(result.text).toBe("Amazing grace\nHow sweet");
  });

  it("normalizes pre-chorus label", () => {
    const input = "Prechorus\nLine 1\nPre-chorus\nLine 2";
    const result = cleanLyrics(input);
    expect(result.text).toContain("Pre-Chorus");
  });

  it("handles colon-prefixed section labels", () => {
    const input = "Verse 1:\nAmazing grace\nChorus:\nHow sweet";
    const result = cleanLyrics(input);
    expect(result.text).toContain("Verse 1");
    expect(result.text).toContain("Chorus");
  });

  it("removes Call/Response prefixes", () => {
    const input = "Call: Amazing grace\nResponse: How sweet";
    const result = cleanLyrics(input);
    expect(result.text).not.toContain("Call:");
    expect(result.text).not.toContain("Response:");
  });

  it("extracts section labels from mixed content", () => {
    const input = "Verse 1:\nLine that looks like content\n[Chorus]\nChorus content";
    const result = cleanLyrics(input);
    expect(result.text).toContain("Verse 1");
    expect(result.text).toContain("Chorus");
  });
});

describe("applyLineBreaks", () => {
  it("returns empty for empty input", () => {
    expect(applyLineBreaks("", 2)).toBe("");
  });

  it("returns text unchanged if lpb is 0 or negative", () => {
    const text = "Line 1\nLine 2\nLine 3";
    expect(applyLineBreaks(text, 0)).toBe(text);
    expect(applyLineBreaks(text, -1)).toBe(text);
  });

  it("groups lines by lines-per-break", () => {
    const text = "Line 1\nLine 2\nLine 3\nLine 4";
    expect(applyLineBreaks(text, 2)).toBe("Line 1\nLine 2\n\nLine 3\nLine 4");
  });

  it("preserves section headers when grouping within a paragraph", () => {
    const text = "Verse 1\nLine A\nLine B\nLine C\nLine D";
    const result = applyLineBreaks(text, 2);
    expect(result).toContain("Verse 1\nLine A\nLine B");
  });

  it("handles odd number of lines", () => {
    const text = "Line 1\nLine 2\nLine 3";
    expect(applyLineBreaks(text, 2)).toBe("Line 1\nLine 2\n\nLine 3");
  });

  it("preserves multiple paragraphs separated by blank lines", () => {
    const text = "Verse 1\nLine A\nLine B\n\nLine C\nLine D\nLine E";
    const result = applyLineBreaks(text, 2);
    expect(result).toBe("Verse 1\nLine A\nLine B\n\nLine C\nLine D\n\nLine E");
  });
});
