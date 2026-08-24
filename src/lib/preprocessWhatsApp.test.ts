import { describe, it, expect } from "vitest";
import { preprocessWhatsApp } from "./preprocessWhatsApp";
import { cleanLyrics } from "./clean";

describe("preprocessWhatsApp: section label emphasis", () => {
  it("unwraps asterisk-emphasized section labels", () => {
    expect(preprocessWhatsApp("*Chorus*")).toBe("Chorus");
    expect(preprocessWhatsApp("*Verse 1*")).toBe("Verse 1");
  });

  it("unwraps underscore-emphasized section labels", () => {
    expect(preprocessWhatsApp("_Verse 2_")).toBe("Verse 2");
  });

  it("unwraps tilde-emphasized section labels", () => {
    expect(preprocessWhatsApp("~Bridge~")).toBe("Bridge");
  });

  it("unwraps single- and triple-backtick section labels", () => {
    expect(preprocessWhatsApp("`Chorus`")).toBe("Chorus");
    expect(preprocessWhatsApp("```Chorus```")).toBe("Chorus");
  });

  it("unwraps a bracketed label inside emphasis", () => {
    expect(preprocessWhatsApp("*[Chorus]*")).toBe("Chorus");
  });

  it("unwraps a colon-suffixed label inside emphasis", () => {
    expect(preprocessWhatsApp("*Chorus:*")).toBe("Chorus");
  });

  it("unwraps a section label that also carries a decorative emoji", () => {
    expect(preprocessWhatsApp("🎤 *Chorus*")).toBe("Chorus");
    expect(preprocessWhatsApp("*Chorus* 🎤")).toBe("Chorus");
  });

  it("leaves multi-line input's other lines untouched while unwrapping the header", () => {
    const input = "*Verse 1*\nAmazing grace\nHow sweet the sound";
    expect(preprocessWhatsApp(input)).toBe("Verse 1\nAmazing grace\nHow sweet the sound");
  });
});

describe("preprocessWhatsApp: forwarding markers", () => {
  it("drops a bare 'Forwarded' line", () => {
    expect(preprocessWhatsApp("Forwarded\nAmazing grace")).toBe("\nAmazing grace");
  });

  it("drops a 'Forwarded many times' line", () => {
    expect(preprocessWhatsApp("Forwarded many times\nAmazing grace")).toBe("\nAmazing grace");
  });
});

describe("preprocessWhatsApp: preserves legitimate lyric content", () => {
  it("does not touch a fully-emphasized lyric line", () => {
    expect(preprocessWhatsApp("*You are good*")).toBe("*You are good*");
    expect(preprocessWhatsApp("_You are worthy_")).toBe("_You are worthy_");
  });

  it("does not touch mid-line emphasis inside a lyric", () => {
    expect(preprocessWhatsApp("You are *good*")).toBe("You are *good*");
  });

  it("does not touch an ordinary lyric line", () => {
    expect(preprocessWhatsApp("Lead me to the cross")).toBe("Lead me to the cross");
  });

  it("does not touch a lyric line with a trailing emoji", () => {
    const input = "You turned my mourning into dancing 🎶";
    expect(preprocessWhatsApp(input)).toBe(input);
  });

  it("does not touch WhatsApp noise this task deliberately leaves alone", () => {
    for (const line of ["Today", "Yesterday", "10:42 PM", "22:15", "John Doe", "John Doe:", "+234 801 234 5678"]) {
      expect(preprocessWhatsApp(line)).toBe(line);
    }
  });
});

describe("preprocessWhatsApp -> cleanLyrics integration", () => {
  it("lets the existing section-label pipeline recognize a previously-unwrapped header", () => {
    const input = "*Chorus*\nMy chains are gone";
    const result = cleanLyrics(preprocessWhatsApp(input), { keepSectionHeaders: true });
    expect(result.text).toBe("Chorus\nMy chains are gone");
    expect(result.sections).toEqual(["Chorus"]);
  });

  it("still strips a fully-emphasized lyric's markers only if cleanLyrics itself would (it does not)", () => {
    const input = "*You are good*\nAll the time";
    const result = cleanLyrics(preprocessWhatsApp(input));
    expect(result.text).toContain("*You are good*");
    expect(result.text).toContain("All the time");
  });

  it("does not regress Task 1's cue/instrumental toggle behavior", () => {
    const input = preprocessWhatsApp(
      "Lead: Amazing grace\nBGV: harmony\nChoir: repeat\nAmazing grace\nRepeat x2\n[Instrumental]",
    );
    const result = cleanLyrics(input);
    expect(result.text).toContain("Amazing grace");
    expect(result.text).not.toContain("Lead:");
    expect(result.text).not.toContain("BGV");
    expect(result.text).not.toContain("Choir");
    expect(result.text).not.toMatch(/instrumental/i);

    const preserved = cleanLyrics(input, {
      removeLeaderCues: false,
      removeBGV: false,
      removeInstrumentalSections: false,
    });
    expect(preserved.text).toContain("Lead: Amazing grace");
    expect(preserved.text).toContain("BGV: harmony");
    expect(preserved.text).toContain("Choir: repeat");
    expect(preserved.text).toMatch(/instrumental/i);
  });

  it("cleans a realistic WhatsApp-pasted song end to end", () => {
    const input = `*Verse 1*
Amazing grace
How sweet the sound

🎤 *Chorus*
My chains are gone
I've been set free

[Instrumental]

BGV: Hallelujah

Repeat Chorus x2`;

    const result = cleanLyrics(preprocessWhatsApp(input), { keepSectionHeaders: true });

    // Structure: both real section headers recognized and normalized.
    expect(result.sections).toEqual(["Verse 1", "Chorus"]);
    expect(result.text).toContain("Verse 1");
    expect(result.text).toContain("Chorus");

    // No legitimate lyric content lost.
    expect(result.text).toContain("Amazing grace");
    expect(result.text).toContain("How sweet the sound");
    expect(result.text).toContain("My chains are gone");
    expect(result.text).toContain("I've been set free");
    expect(result.text).toContain("Hallelujah");

    // WhatsApp emphasis markers gone from the header; noise gone.
    expect(result.text).not.toContain("*");
    expect(result.text).not.toContain("🎤");
    expect(result.text).not.toMatch(/\[Instrumental\]/i);
    expect(result.text).not.toContain("BGV");
  });
});
