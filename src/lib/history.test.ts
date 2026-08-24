import { describe, it, expect, beforeEach } from "vitest";
import { saveAutosave, loadAutosave, clearAutosave, type Snapshot } from "./history";

// vitest.config.ts runs tests in the "node" environment, which has no global
// localStorage. history.ts talks to `localStorage` directly (matching how
// the rest of the app's persistence code — e.g. cleaningOptions.ts — already
// does it), so a minimal in-memory stand-in is installed here rather than
// pulling in jsdom just for this one module.
class MemoryStorage implements Storage {
  private store = new Map<string, string>();
  get length() {
    return this.store.size;
  }
  clear(): void {
    this.store.clear();
  }
  getItem(key: string): string | null {
    return this.store.has(key) ? this.store.get(key)! : null;
  }
  key(index: number): string | null {
    return Array.from(this.store.keys())[index] ?? null;
  }
  removeItem(key: string): void {
    this.store.delete(key);
  }
  setItem(key: string, value: string): void {
    this.store.set(key, value);
  }
}

beforeEach(() => {
  (globalThis as unknown as { localStorage: Storage }).localStorage = new MemoryStorage();
});

function makeSnapshot(overrides: Partial<Snapshot> = {}): Snapshot {
  return {
    rawLyrics: "Amazing grace\nHow sweet the sound",
    cleanedLyrics: "Amazing grace\nHow sweet the sound",
    displayedLyrics: "Amazing grace\nHow sweet the sound",
    linesPerBreak: 2,
    foundSections: [],
    duplicates: [],
    ...overrides,
  };
}

describe("autosave persistence (lyriclean:autosave)", () => {
  it("persists work normally and restores it byte-for-byte", () => {
    const snapshot = makeSnapshot();
    saveAutosave(snapshot);
    expect(loadAutosave()).toEqual(snapshot);
  });

  it("Clear removes the persisted work", () => {
    saveAutosave(makeSnapshot());
    expect(loadAutosave()).not.toBeNull();

    clearAutosave();

    expect(loadAutosave()).toBeNull();
  });

  it("a reload/restore after Clear does not bring old lyrics back", () => {
    saveAutosave(makeSnapshot({ rawLyrics: "Old song that was cleared" }));
    clearAutosave();

    // Simulates the mount-time restore effect in tool/page.tsx: it only
    // restores when loadAutosave() returns a truthy snapshot with rawLyrics.
    const restored = loadAutosave();
    expect(restored).toBeNull();
    expect(JSON.stringify(restored ?? "")).not.toContain("Old song that was cleared");
  });

  it("new lyrics entered after Clear autosave normally again", () => {
    saveAutosave(makeSnapshot({ rawLyrics: "First song" }));
    clearAutosave();
    expect(loadAutosave()).toBeNull();

    const secondSong = makeSnapshot({ rawLyrics: "Second, different song" });
    saveAutosave(secondSong);

    expect(loadAutosave()).toEqual(secondSong);
  });

  it("Clear does not remove unrelated persisted preferences", () => {
    localStorage.setItem("lyriclean:darkMode", "dark");
    localStorage.setItem("lyriclean:tourDone", "1");
    localStorage.setItem(
      "lyriclean:cleaningOptions",
      JSON.stringify({ removeLeaderCues: false }),
    );
    saveAutosave(makeSnapshot());

    clearAutosave();

    expect(loadAutosave()).toBeNull();
    expect(localStorage.getItem("lyriclean:darkMode")).toBe("dark");
    expect(localStorage.getItem("lyriclean:tourDone")).toBe("1");
    expect(localStorage.getItem("lyriclean:cleaningOptions")).toBe(
      JSON.stringify({ removeLeaderCues: false }),
    );
  });

  it("clearing when nothing was ever saved is a harmless no-op", () => {
    expect(loadAutosave()).toBeNull();
    expect(() => clearAutosave()).not.toThrow();
    expect(loadAutosave()).toBeNull();
  });
});
