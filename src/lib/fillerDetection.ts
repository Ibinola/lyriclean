import { matchesSectionLabel } from "./sectionLabels";

const instructionWords = new Set([
  "repeat",
  "refrain",
  "interlude",
  "instrumental",
  "chants",
  "lead",
  "bgv",
  "unison",
  "harmony",
]);

const noiseWords = new Set([
  "a",
  "an",
  "the",
  "and",
  "or",
  "but",
  "in",
  "on",
  "at",
  "to",
  "for",
  "of",
  "with",
  "by",
  "from",
  "into",
  "through",
  "like",
  "things",
  "as",
  "if",
  "so",
  "than",
  "then",
  "just",
  "very",
]);

function removeEmoji(str: string): string {
  return str
    .replace(
      /[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F1E0}-\u{1F1FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{FE00}-\u{FE0F}\u{1F900}-\u{1F9FF}\u{1FA00}-\u{1FA6F}\u{1FA70}-\u{1FAFF}\u{200D}\u{20E3}\u{231A}-\u{231B}\u{23E9}-\u{23F3}\u{23F8}-\u{23FA}\u{25AA}-\u{25AB}\u{25B6}\u{25C0}\u{25FB}-\u{25FE}\u{2934}\u{2935}\u{2B05}-\u{2B07}\u{2B1B}-\u{2B1C}\u{2B50}\u{2B55}\u{3030}\u{303D}\u{3297}\u{3299}]/gu,
      "",
    )
    .trim();
}

export interface CueMatch {
  /** null = a bare cue with no content to preserve (e.g. "Lead" alone) */
  remainder: string | null;
}

function matchCue(trimmed: string, words: string[]): CueMatch | null {
  const group = words.join("|");
  const bare = new RegExp(`^(?:${group})\\s*:?\\s*$`, "i");
  if (bare.test(trimmed)) return { remainder: null };

  const prefixed = new RegExp(`^(?:${group})\\s*:\\s*(.+)$`, "i");
  const match = trimmed.match(prefixed);
  if (match) return { remainder: match[1].trim() };

  return null;
}

const leaderCueWords = ["lead", "leader", "pastor"];
const bgvCueWords = ["bgv", "choir", "backup", "background"];

// Bare or bracket/paren-wrapped instrumental marker, with an optional number
// (e.g. "Instrumental 2") or trailing x-count (e.g. "[Instrumental x2]").
const instrumentalPattern =
  /^[\[\(]?\s*instrumentals?\s*\d*\s*(?:x\s*\d+)?\s*[\]\)]?\s*:?\s*$/i;

/**
 * Matches a leader/director cue line ("Lead:", "Leader:", "Pastor:", or the
 * bare word alone). A colon is REQUIRED before any trailing content so a
 * real lyric line like "Lead me to the cross" is never touched.
 */
function matchLeaderCue(trimmed: string): CueMatch | null {
  return matchCue(trimmed, leaderCueWords);
}

/**
 * Matches a BGV/choir cue line ("BGV:", "Choir:", "Backup:", "Background:",
 * or the bare word alone). Same colon requirement as matchLeaderCue.
 */
function matchBGVCue(trimmed: string): CueMatch | null {
  return matchCue(trimmed, bgvCueWords);
}

function isInstrumentalMarker(trimmed: string): boolean {
  return instrumentalPattern.test(trimmed);
}

// A trailing numeric count suffix, same shape as the count-detection already
// used by the general repeat-marker stripping in clean.ts (x2, 2x, x 8, ...).
const trailingCountPattern = /^(.*?)\s*[\[\(]?\s*(?:\d+\s*x\s*\d*|\bx\s*\d+)\s*[\]\)]?$/i;

function splitTrailingCount(trimmed: string): { rest: string; hadCount: boolean } {
  const match = trimmed.match(trailingCountPattern);
  if (match && match[1].trim()) {
    return { rest: match[1].trim(), hadCount: true };
  }
  return { rest: trimmed, hadCount: false };
}

/**
 * Matches a "repeat this section" directive line — a line that is
 * structurally just an instruction to repeat a recognized song section, not
 * lyric content that merely contains the word "repeat":
 *
 *   "Repeat <SectionLabel>"     (count optional, e.g. "Repeat Chorus x2")
 *   "<SectionLabel> x2"          (count REQUIRED — without it, this is just
 *                                 a normal section header, already handled
 *                                 by the existing section-detection logic)
 *
 * The referenced label is verified against the canonical section-label
 * matcher (sectionLabels.ts), so this can never fire on free-form text that
 * happens to contain "repeat" — e.g. "We repeat Your name" does not start
 * with the word "repeat", so it is never even considered.
 *
 * Note: splitTrailingCount can, for a label that itself carries a number
 * (e.g. "Verse 2 x3"), fold that number into the stripped count rather than
 * the label ("rest" ends up as "Verse", not "Verse 2"). That's harmless
 * here — this function only returns a boolean, it never reconstructs text —
 * but is not something to build on if this logic is ever reused elsewhere.
 */
function matchRepeatDirective(trimmed: string): boolean {
  const { rest, hadCount } = splitTrailingCount(trimmed);

  const repeatMatch = rest.match(/^repeat\s+(.+)$/i);
  if (repeatMatch) {
    return matchesSectionLabel(repeatMatch[1].trim());
  }

  return hadCount && matchesSectionLabel(rest);
}

function isFillerLine(trimmed: string): boolean {
  const lower = trimmed.toLowerCase();
  if (
    /^[\[\(]?\s*(?:(?:\d+\s*x\s*\d*|\bx\s*\d+)|(?:repeat|refrain|instrumentals?|interlude|chants?)(?:\s+(?:\d+\s*x\s*\d*|\bx\s*\d+))?)\s*[\]\)]?$/.test(
      lower,
    )
  )
    return true;
  if (/^\(sung\s+in\s+\w+\)$/i.test(trimmed)) return true;
  if (/^\[.*?\]$/.test(trimmed) && /[?]/.test(trimmed)) return true;
  if (/^Repeat:\s/i.test(trimmed)) return true;
  if (/^Refrain:\s?$/i.test(trimmed)) return true;
  if (removeEmoji(trimmed) === "" && trimmed.length > 0) return true;
  if (/^\d+\s*contributors?/i.test(trimmed)) return true;
  if (/^lyrics?\s+(?:for|to)\s+/i.test(trimmed)) return true;
  if (/\bsong\s+request\b/i.test(trimmed)) return true;
  const clean = lower.replace(/(?:\d+\s*x\s*\d*|x\d+)/g, "");
  const words = clean.split(/[\s,;:!?()\[\]'"\/]+/).filter((w) => w.length > 0);
  if (words.length === 0) return true;
  const nonNoise = words.filter((w) => !noiseWords.has(w));
  if (nonNoise.length === 0) return false;
  const instructionCount = nonNoise.filter((w) => instructionWords.has(w)).length;
  return instructionCount / nonNoise.length >= 0.8;
}

export {
  removeEmoji,
  isFillerLine,
  matchLeaderCue,
  matchBGVCue,
  isInstrumentalMarker,
  matchRepeatDirective,
};
