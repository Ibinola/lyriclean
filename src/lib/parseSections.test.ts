import { describe, it, expect } from "vitest";
import { parseSections, sectionsToText, hasSectionHeaders } from "./parseSections";

describe("parseSections", () => {
  it("returns empty array for empty text", () => {
    expect(parseSections("")).toEqual([]);
    expect(parseSections("   ")).toEqual([]);
  });

  it("parses a section with header and lines", () => {
    const text = "Verse 1\nAmazing grace\nHow sweet the sound";
    const sections = parseSections(text);
    expect(sections).toHaveLength(1);
    expect(sections[0].header).toBe("Verse 1");
    expect(sections[0].lines).toEqual(["Amazing grace", "How sweet the sound"]);
  });

  it("parses multiple sections", () => {
    const text = "Verse 1\nAmazing grace\n\nChorus\nHow sweet\nthe sound";
    const sections = parseSections(text);
    expect(sections).toHaveLength(2);
    expect(sections[0].header).toBe("Verse 1");
    expect(sections[1].header).toBe("Chorus");
  });

  it("treats non-header paragraph as headerless section", () => {
    const text = "Line 1\nLine 2";
    const sections = parseSections(text);
    expect(sections).toHaveLength(1);
    expect(sections[0].header).toBe("");
    expect(sections[0].lines).toEqual(["Line 1", "Line 2"]);
  });

  it("assigns unique IDs to each section", () => {
    const text = "Verse 1\nA\n\nChorus\nB";
    const sections = parseSections(text);
    expect(sections[0].id).toBeDefined();
    expect(sections[1].id).toBeDefined();
    expect(sections[0].id).not.toBe(sections[1].id);
  });
});

describe("sectionsToText", () => {
  it("converts sections back to text", () => {
    const sections = [
      { id: "1", header: "Verse 1", lines: ["Amazing grace", "How sweet"] },
      { id: "2", header: "Chorus", lines: ["Praise the Lord"] },
    ];
    expect(sectionsToText(sections)).toBe(
      "Verse 1\nAmazing grace\nHow sweet\n\nChorus\nPraise the Lord",
    );
  });

  it("handles headerless sections", () => {
    const sections = [{ id: "1", header: "", lines: ["Line A", "Line B"] }];
    expect(sectionsToText(sections)).toBe("Line A\nLine B");
  });
});

describe("hasSectionHeaders", () => {
  it("returns true when sections have headers", () => {
    const sections = [{ id: "1", header: "Verse 1", lines: ["A"] }];
    expect(hasSectionHeaders(sections)).toBe(true);
  });

  it("returns false when no sections have headers", () => {
    const sections = [{ id: "1", header: "", lines: ["A"] }];
    expect(hasSectionHeaders(sections)).toBe(false);
  });

  it("returns true when at least one section has a header", () => {
    const sections = [
      { id: "1", header: "", lines: ["A"] },
      { id: "2", header: "Chorus", lines: ["B"] },
    ];
    expect(hasSectionHeaders(sections)).toBe(true);
  });
});
