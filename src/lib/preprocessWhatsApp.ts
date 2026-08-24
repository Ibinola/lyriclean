import { removeEmoji } from "./fillerDetection";
import { matchesSectionLabel, normalizeSectionLabel, extractBracketedLabel } from "./sectionLabels";

// WhatsApp/Markdown-style emphasis characters that can wrap an entire line:
// *bold*, _italic_, ~strikethrough~, `mono`, and WhatsApp Web's ```mono```.
// Order matters - the triple-backtick pair must be tried before the single
// backtick pair, or a triple-backtick line would be mis-unwrapped by one
// backtick at a time.
const wrapperPairs: [string, string][] = [
  ["```", "```"],
  ["*", "*"],
  ["_", "_"],
  ["~", "~"],
  ["`", "`"],
];

function unwrapEmphasis(text: string): string | null {
  for (const [open, close] of wrapperPairs) {
    if (text.length > open.length + close.length && text.startsWith(open) && text.endsWith(close)) {
      const inner = text.slice(open.length, text.length - close.length).trim();
      if (inner) return inner;
    }
  }
  return null;
}

// Reuses the canonical section-label matcher/normalizer rather than keeping
// a separate list, per the audit's warning about duplicated section-pattern
// lists (sectionLabels.ts is the single source of truth).
function recognizedSectionLabel(text: string): string | null {
  const bracketed = extractBracketedLabel(text);
  if (bracketed) return normalizeSectionLabel(bracketed);
  if (matchesSectionLabel(text)) return normalizeSectionLabel(text);
  return null;
}

const forwardedPattern = /^forwarded(\s+many\s+times)?$/i;

/**
 * Normalizes a small set of high-confidence WhatsApp-originated artifacts
 * BEFORE the general cleaning pipeline runs, so a recognized section label
 * survives WhatsApp's own text formatting instead of appearing as literal
 * *Chorus* / _Verse 1_ / ~Bridge~ noise in the cleaned output.
 *
 * Deliberately narrow: a line is only ever transformed when it is
 * independently confirmed safe -
 *   - fully wrapped in one matching pair of emphasis characters AND the
 *     unwrapped text is a recognized section label (via sectionLabels.ts),
 *   - or an exact WhatsApp forwarding-marker line ("Forwarded" /
 *     "Forwarded many times").
 * Ordinary lyric content - including lyric lines a user happened to bold,
 * italicize, or decorate with an emoji in WhatsApp - is left completely
 * untouched. There is no independent signal (equivalent to the section-
 * label check) that tells us emphasis around arbitrary lyric text is
 * WhatsApp formatting rather than intentional content, so it is not
 * guessed at here.
 */
export function preprocessWhatsApp(raw: string): string {
  if (!raw) return raw;

  return raw
    .split("\n")
    .map((line) => {
      const trimmed = line.trim();
      if (!trimmed) return line;

      if (forwardedPattern.test(trimmed)) return "";

      // A section label may carry both an emoji and emphasis at once
      // (e.g. "🎤 *Chorus*"). Emoji is stripped only to test the shape
      // here - the main cleaning pipeline already removes emoji from
      // every line unconditionally, so this has no effect beyond
      // detection when the line isn't actually a recognized label.
      const candidate = removeEmoji(trimmed).trim();
      const unwrapped = unwrapEmphasis(candidate);
      if (unwrapped) {
        const label = recognizedSectionLabel(unwrapped);
        if (label) return label;
      }

      return line;
    })
    .join("\n");
}
