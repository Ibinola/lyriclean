import { describe, it, expect } from "vitest";
import { decideAutoCopyOutcome } from "./autoCopyDecision";

describe("decideAutoCopyOutcome: should auto-copy", () => {
  it("is ready when output is non-empty and there are zero duplicate warnings", () => {
    const outcome = decideAutoCopyOutcome({ text: "Amazing grace\nHow sweet the sound", duplicates: [] });
    expect(outcome).toBe("ready");
  });
});

describe("decideAutoCopyOutcome: must NOT auto-copy", () => {
  it("flags needs-review when duplicate warnings exist, even with real output", () => {
    const outcome = decideAutoCopyOutcome({
      text: "Chorus\nMy chains are gone",
      duplicates: [{ aIndex: 0, bIndex: 1 }],
    });
    expect(outcome).toBe("needs-review");
  });

  it("flags empty when cleaned output is empty, regardless of duplicates", () => {
    expect(decideAutoCopyOutcome({ text: "", duplicates: [] })).toBe("empty");
    expect(decideAutoCopyOutcome({ text: "   ", duplicates: [] })).toBe("empty");
  });

  it("prioritizes empty over needs-review when both would technically apply", () => {
    // Not a realistic combination (empty text implies no duplicates were
    // even detected), but the empty check should still win if it ever
    // happened, since there is nothing to review either way.
    expect(decideAutoCopyOutcome({ text: "", duplicates: [{ x: 1 }] })).toBe("empty");
  });
});
