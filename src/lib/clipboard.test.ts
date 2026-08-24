import { describe, it, expect, afterEach, vi } from "vitest";
import { copyToClipboard } from "./clipboard";

// Modern Node (this project's vitest environment) has a built-in read-only
// `navigator` global, so it can't be reassigned directly - vi.stubGlobal is
// the supported way to override it for a test and restore it afterward.
afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("copyToClipboard", () => {
  it("returns true on a successful write", async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    vi.stubGlobal("navigator", { clipboard: { writeText } });

    const result = await copyToClipboard("hello");

    expect(result).toBe(true);
    expect(writeText).toHaveBeenCalledWith("hello");
  });

  it("returns false, without throwing, when the write is rejected", async () => {
    const writeText = vi.fn().mockRejectedValue(new Error("NotAllowedError"));
    vi.stubGlobal("navigator", { clipboard: { writeText } });
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

    const result = await copyToClipboard("hello");

    expect(result).toBe(false);
    expect(warnSpy).toHaveBeenCalled();
  });

  it("returns false, without throwing, when the Clipboard API is unavailable", async () => {
    vi.stubGlobal("navigator", {});
    const result = await copyToClipboard("hello");
    expect(result).toBe(false);
  });

  it("returns false, without throwing, when navigator itself is undefined", async () => {
    vi.stubGlobal("navigator", undefined);
    const result = await copyToClipboard("hello");
    expect(result).toBe(false);
  });

  it("never retries on failure", async () => {
    const writeText = vi.fn().mockRejectedValue(new Error("denied"));
    vi.stubGlobal("navigator", { clipboard: { writeText } });

    await copyToClipboard("hello");

    expect(writeText).toHaveBeenCalledTimes(1);
  });
});
