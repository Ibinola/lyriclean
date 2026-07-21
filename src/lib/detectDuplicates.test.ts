import { describe, it, expect } from "vitest";
import { detectDuplicates } from "./detectDuplicates";

describe("detectDuplicates", () => {
  it("returns empty array for empty text", () => {
    expect(detectDuplicates("")).toEqual([]);
    expect(detectDuplicates("   ")).toEqual([]);
  });

  it("returns empty for single section", () => {
    const text = "Verse 1\nAmazing grace\nHow sweet the sound";
    expect(detectDuplicates(text)).toEqual([]);
  });

  it("detects identical sections", () => {
    const text = "Chorus\nPraise the Lord\nHallelujah\n\n" + "Chorus\nPraise the Lord\nHallelujah";
    const results = detectDuplicates(text);
    expect(results).toHaveLength(1);
    expect(results[0].similarity).toBe(1);
    expect(results[0].aHeader).toBe("Chorus");
    expect(results[0].bHeader).toBe("Chorus");
  });

  it("detects near-identical sections above 75% threshold", () => {
    const text =
      "Chorus\nPraise the Lord\nHallelujah\nPraise Him\n\n" +
      "Chorus\nPraise the Lord\nHallelujah\nPraise him";
    const results = detectDuplicates(text);
    expect(results).toHaveLength(1);
    expect(results[0].similarity).toBeGreaterThanOrEqual(0.75);
  });

  it("does not flag distinct sections", () => {
    const text =
      "Verse 1\nAmazing grace\nHow sweet the sound\n\n" + "Chorus\nPraise the Lord\nHallelujah";
    expect(detectDuplicates(text)).toEqual([]);
  });

  it("respects custom threshold", () => {
    // 3 of 5 lines shared => 0.6 similarity
    const text =
      "Verse 1\nLine 1\nLine 2\nLine 3\nLine 4\n\n" + "Chorus\nLine 1\nLine 2\nLine 3\nDifferent";
    const strict = detectDuplicates(text, 0.9);
    expect(strict).toEqual([]);
    const loose = detectDuplicates(text, 0.5);
    expect(loose).toHaveLength(1);
  });

  it("ignores casing in comparison", () => {
    const text = "Chorus\nPraise the Lord\n\n" + "Chorus\nPRAISE THE LORD";
    const results = detectDuplicates(text);
    expect(results).toHaveLength(1);
  });

  it("detects duplicates with numbered headers", () => {
    const text = "Chorus\nPraise the Lord\n\n" + "Chorus 2\nPraise the Lord";
    const results = detectDuplicates(text);
    expect(results).toHaveLength(1);
  });

  it("handles sections without headers", () => {
    const text = "Line A\nLine B\n\n" + "Line A\nLine B";
    const results = detectDuplicates(text);
    expect(results).toHaveLength(1);
    expect(results[0].aHeader).toBe("");
  });

  it("does not pair sections with itself", () => {
    const text = "Chorus\nPraise\n\n" + "Verse\nDifferent\n\n" + "Bridge\nAlso different";
    expect(detectDuplicates(text)).toEqual([]);
  });

  it("returns correct indices in the original paragraph list", () => {
    const text = "Chorus\nPraise\n\n" + "Verse\nDifferent\n\n" + "Chorus\nPraise";
    const results = detectDuplicates(text);
    expect(results[0].aIndex).toBe(0);
    expect(results[0].bIndex).toBe(2);
  });
});
