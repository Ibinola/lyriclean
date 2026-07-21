import { describe, it, expect } from "vitest";
import { spellcheck } from "./spellcheck";

describe("spellcheck", () => {
  it("returns empty for empty input", () => {
    expect(spellcheck("")).toBe("");
  });

  it("corrects common misspellings of Hallelujah", () => {
    expect(spellcheck("halelujah")).toBe("hallelujah");
    expect(spellcheck("haleluia")).toBe("hallelujah");
    expect(spellcheck("haleluya")).toBe("hallelujah");
  });

  it("corrects Hosanna variants", () => {
    expect(spellcheck("hosana")).toBe("hosanna");
    expect(spellcheck("hosannah")).toBe("hosanna");
  });

  it("corrects YHWH to Yahweh", () => {
    expect(spellcheck("yhwh")).toBe("yahweh");
    expect(spellcheck("yahwe")).toBe("yahweh");
  });

  it("corrects Messiah variants", () => {
    expect(spellcheck("messaih")).toBe("messiah");
    expect(spellcheck("messias")).toBe("messiah");
  });

  it("preserves UPPERCASE casing", () => {
    expect(spellcheck("HALELUJAH")).toBe("HALLELUJAH");
  });

  it("preserves Title Case", () => {
    expect(spellcheck("Halelujah")).toBe("Hallelujah");
  });

  it("preserves lowercase casing for lowercase input", () => {
    const result = spellcheck("halelujah");
    expect(result).toBe("hallelujah");
  });

  it("corrects words within sentences", () => {
    const input = "praise the lord halelujah";
    const result = spellcheck(input);
    expect(result).toContain("hallelujah");
  });

  it("does not modify correctly spelled worship words", () => {
    expect(spellcheck("Praise the Lord")).toBe("Praise the Lord");
    expect(spellcheck("Jesus")).toBe("Jesus");
    expect(spellcheck("Glory")).toBe("Glory");
  });

  it("handles punctuation-adjacent words", () => {
    expect(spellcheck("halelujah!")).toBe("hallelujah!");
    expect(spellcheck("(halelujah)")).toBe("(hallelujah)");
    expect(spellcheck("halelujah,")).toBe("hallelujah,");
  });

  it("corrects Emmanuel variants", () => {
    expect(spellcheck("emanuel")).toBe("emmanuel");
    expect(spellcheck("emmanual")).toBe("emmanuel");
  });

  it("corrects Righteousness variants", () => {
    expect(spellcheck("rightousness")).toBe("righteousness");
    expect(spellcheck("righteusness")).toBe("righteousness");
  });

  it("corrects Glory variants", () => {
    expect(spellcheck("glorify")).toBe("glorify");
    expect(spellcheck("glorius")).toBe("glorious");
  });

  it("corrects Sanctified variants", () => {
    expect(spellcheck("sactified")).toBe("sanctified");
  });

  it("corrects Testimony variants", () => {
    expect(spellcheck("testomony")).toBe("testimony");
    expect(spellcheck("testamony")).toBe("testimony");
  });

  it("handles multiple corrections in one text preserving casing", () => {
    const input = "Halelujah hosana YHWH";
    const result = spellcheck(input);
    expect(result).toBe("Hallelujah hosanna YAHWEH");
  });
});
