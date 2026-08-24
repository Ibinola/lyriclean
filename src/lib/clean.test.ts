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
    const result = cleanLyrics(input, { keepSectionHeaders: true });
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
    const result = cleanLyrics(input, { keepSectionHeaders: true });
    expect(result.text).toBe("Verse 1\nAmazing grace\nChorus\nHow sweet the sound");
    expect(result.sections).toContain("Verse 1");
    expect(result.sections).toContain("Chorus");
  });

  it("strips section headers from output by default but still detects sections", () => {
    const input = "[Verse 1]\nAmazing grace\n[Chorus]\nHow sweet the sound";
    const result = cleanLyrics(input);
    expect(result.text).toBe("Amazing grace\n\nHow sweet the sound");
    expect(result.sections).toEqual(["Verse 1", "Chorus"]);
  });

  it("detects bare section labels", () => {
    const input = "Verse 1\nAmazing grace\nChorus\nHow sweet the sound";
    const result = cleanLyrics(input, { keepSectionHeaders: true });
    expect(result.text).toBe("Verse 1\nAmazing grace\nChorus\nHow sweet the sound");
  });

  it("resolves Hungarian label aliases", () => {
    const input = "[refrén]\nHallelujah";
    const result = cleanLyrics(input, { keepSectionHeaders: true });
    expect(result.text).toContain("Chorus");
  });

  it("resolves Italian label aliases", () => {
    const input = "Ritornello\nGloria a Dio";
    const result = cleanLyrics(input, { keepSectionHeaders: true });
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

  it("strips spaced x-number annotations like 'x 8'", () => {
    const input = "Yahweh Sabaoth x 8\nIba eh, iba x 10\nOf Israel x7";
    const result = cleanLyrics(input);
    expect(result.text).toBe("Yahweh Sabaoth\nIba eh, iba\nOf Israel");
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
    const result = cleanLyrics(input, { keepSectionHeaders: true });
    expect(result.text).toContain("Pre-Chorus");
  });

  it("handles colon-prefixed section labels", () => {
    const input = "Verse 1:\nAmazing grace\nChorus:\nHow sweet";
    const result = cleanLyrics(input, { keepSectionHeaders: true });
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
    const result = cleanLyrics(input, { keepSectionHeaders: true });
    expect(result.text).toContain("Verse 1");
    expect(result.text).toContain("Chorus");
  });
});

describe("removeLeaderCues toggle", () => {
  it("strips leader cue labels but keeps the real content when enabled (default)", () => {
    const input = "Lead: Amazing grace\nLeader: Sing it again\nHow sweet the sound";
    const result = cleanLyrics(input);
    expect(result.text).not.toContain("Lead:");
    expect(result.text).not.toContain("Leader:");
    expect(result.text).toContain("Amazing grace");
    expect(result.text).toContain("Sing it again");
  });

  it("removes a bare leader cue with no content when enabled (default)", () => {
    const input = "Amazing grace\nLead\nHow sweet";
    const result = cleanLyrics(input);
    expect(result.text).not.toContain("Lead");
  });

  it("preserves leader cue lines untouched when disabled", () => {
    const input = "Lead: Amazing grace\nLeader: Sing it again\nHow sweet the sound";
    const result = cleanLyrics(input, { removeLeaderCues: false });
    expect(result.text).toContain("Lead: Amazing grace");
    expect(result.text).toContain("Leader: Sing it again");
  });

  it("preserves a bare leader cue when disabled, even though it also has a high filler-word ratio", () => {
    const input = "Amazing grace\nLead\nHow sweet";
    const result = cleanLyrics(input, { removeLeaderCues: false });
    expect(result.text).toContain("Lead");
  });

  it("does not touch a real lyric line that happens to start with 'Lead'", () => {
    const input = "Lead me to the cross\nHow sweet the sound";
    const result = cleanLyrics(input);
    expect(result.text).toContain("Lead me to the cross");
  });
});

describe("removeBGV toggle", () => {
  it("strips BGV/choir cue labels when enabled (default)", () => {
    const input = "BGV: harmony\nChoir: repeat\nHow sweet the sound";
    const result = cleanLyrics(input);
    expect(result.text).not.toContain("BGV");
    expect(result.text).not.toContain("Choir");
    expect(result.text).toContain("How sweet the sound");
  });

  it("removes a bare BGV/Choir cue with no content when enabled (default)", () => {
    const input = "Amazing grace\nBGV\nChoir\nHow sweet";
    const result = cleanLyrics(input);
    expect(result.text).not.toContain("BGV");
    expect(result.text).not.toContain("Choir");
  });

  it("preserves BGV/choir cue lines untouched when disabled", () => {
    const input = "BGV: harmony\nChoir: repeat\nHow sweet the sound";
    const result = cleanLyrics(input, { removeBGV: false });
    expect(result.text).toContain("BGV: harmony");
    expect(result.text).toContain("Choir: repeat");
  });

  it("preserves a bare BGV cue when disabled", () => {
    const input = "Amazing grace\nBGV\nHow sweet";
    const result = cleanLyrics(input, { removeBGV: false });
    expect(result.text).toContain("BGV");
  });
});

describe("removeInstrumentalSections toggle", () => {
  it("removes bracketed and bare instrumental markers when enabled (default)", () => {
    const input = "Amazing grace\n[Instrumental]\nInstrumental\nHow sweet the sound";
    const result = cleanLyrics(input);
    expect(result.text).not.toMatch(/instrumental/i);
    expect(result.text).toContain("Amazing grace");
    expect(result.text).toContain("How sweet the sound");
  });

  it("preserves bracketed and bare instrumental markers untouched when disabled", () => {
    const input = "Amazing grace\n[Instrumental]\nInstrumental\nHow sweet the sound";
    const result = cleanLyrics(input, { removeInstrumentalSections: false });
    expect(result.text).toContain("[Instrumental]");
    expect(result.text).toMatch(/(^|\n)Instrumental(\n|$)/);
  });

  it("does not affect an unrelated bracketed stage direction", () => {
    const input = "Amazing grace\n[instrument only]\nHow sweet";
    const result = cleanLyrics(input, { removeInstrumentalSections: false });
    expect(result.text).not.toContain("instrument only");
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

describe("repeat section directives (removeRepeatMarkers)", () => {
  const directives = [
    "Repeat Chorus",
    "Repeat Chorus x2",
    "Repeat Chorus 2x",
    "Repeat Verse 1",
    "Verse 1 x2",
    "Chorus x3",
    "Repeat Bridge",
    "Repeat Refrain",
    "Repeat Tag x2",
  ];

  it.each(directives)("removes %s entirely when enabled (default)", (line) => {
    const result = cleanLyrics(`Amazing grace\n${line}\nHow sweet the sound`);
    expect(result.text).toBe("Amazing grace\nHow sweet the sound");
  });

  it("removes directives that lose their embedded section number during count-stripping, but still correctly identifies them", () => {
    // "Verse 2 x3" / "Repeat Verse 1 x2" internally fold the section's own
    // number into the stripped count (see matchRepeatDirective's doc
    // comment) - confirming the end-to-end removal still succeeds despite
    // that, since only the boolean match matters for removal.
    for (const line of ["Verse 2 x3", "Repeat Verse 1 x2"]) {
      const result = cleanLyrics(`Amazing grace\n${line}\nHow sweet the sound`);
      expect(result.text).toBe("Amazing grace\nHow sweet the sound");
    }
  });

  it.each(directives)("preserves %s completely unchanged when disabled", (line) => {
    const result = cleanLyrics(`Amazing grace\n${line}\nHow sweet the sound`, {
      removeRepeatMarkers: false,
    });
    expect(result.text).toBe(`Amazing grace\n${line}\nHow sweet the sound`);
  });

  it("does not let the generic filler heuristic override a disabled toggle (Repeat Refrain)", () => {
    // Both "repeat" and "refrain" are instruction words, so this line would
    // otherwise be deleted by isFillerLine's ratio check regardless of
    // removeRepeatMarkers - the explicit bypass in clean.ts must prevent that.
    const result = cleanLyrics("Amazing grace\nRepeat Refrain\nHow sweet the sound", {
      removeRepeatMarkers: false,
    });
    expect(result.text).toBe("Amazing grace\nRepeat Refrain\nHow sweet the sound");
  });

  it.each([
    "We repeat Your name",
    "I will repeat the sound of praise",
    "Sing it again",
    "Again and again",
    "Your love repeats through generations",
  ])("does not remove the real lyric line %s", (line) => {
    const result = cleanLyrics(`Amazing grace\n${line}\nHow sweet the sound`);
    expect(result.text).toContain(line);
  });

  it("does not change already-correct bare-count behavior", () => {
    // No section label is referenced, so these are unaffected by this
    // feature and continue to behave exactly as before.
    expect(cleanLyrics("Amazing grace\nx2\nHow sweet").text).toBe("Amazing grace\nHow sweet");
    expect(cleanLyrics("Amazing grace\n2x\nHow sweet").text).toBe("Amazing grace\nHow sweet");
    expect(cleanLyrics("Amazing grace\nRepeat x2\nHow sweet").text).toBe(
      "Amazing grace\nHow sweet",
    );
    expect(cleanLyrics("Amazing grace\n(x2)\nHow sweet").text).toBe("Amazing grace\nHow sweet");
    expect(cleanLyrics("Amazing grace\n[x2]\nHow sweet").text).toBe("Amazing grace\nHow sweet");
    // Not section-referencing, so left untouched, same as before this task.
    expect(cleanLyrics("Amazing grace\nRepeat 3 times\nHow sweet").text).toBe(
      "Amazing grace\nRepeat 3 times\nHow sweet",
    );
  });

  it("does not regress existing trailing-annotation repeat-marker stripping", () => {
    const result = cleanLyrics("Shout to the Lord 4x BGV");
    expect(result.text).toBe("Shout to the Lord");
  });

  it("does not regress Task 1's leader/BGV/instrumental toggles", () => {
    const input = "Lead: Amazing grace\nBGV: harmony\n[Instrumental]\nHow sweet the sound";
    const enabled = cleanLyrics(input);
    expect(enabled.text).toBe("Amazing grace\nHow sweet the sound");

    const disabled = cleanLyrics(input, {
      removeLeaderCues: false,
      removeBGV: false,
      removeInstrumentalSections: false,
    });
    expect(disabled.text).toContain("Lead: Amazing grace");
    expect(disabled.text).toContain("BGV: harmony");
    expect(disabled.text).toMatch(/instrumental/i);
  });
});
