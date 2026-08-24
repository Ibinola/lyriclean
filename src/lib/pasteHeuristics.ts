/**
 * Decides whether a clipboard paste is substantial enough to count as "an
 * entire block of lyrics" worth auto-cleaning, as opposed to a small
 * in-place edit (replacing one word, pasting a short phrase) made while
 * manually editing Raw Lyrics.
 *
 * Rule (deterministic — no AI or lyric-shape detection):
 *   - the pasted text contains a real newline once surrounding whitespace
 *     is trimmed (more than one line of actual content), OR
 *   - the pasted text, trimmed, is at least MIN_MEANINGFUL_PASTE_LENGTH
 *     characters (covers a single long line pasted without newlines).
 *
 * This judges the PASTED FRAGMENT itself (the clipboard contents at the
 * moment of the paste event), not the resulting merged textarea value —
 * pasting one short word into the middle of an already-long song must not
 * count as "meaningful" just because the textarea as a whole is long
 * afterward.
 */
export const MIN_MEANINGFUL_PASTE_LENGTH = 30;

export function isMeaningfulPaste(pastedText: string): boolean {
  const trimmed = pastedText.trim();
  if (!trimmed) return false;
  return trimmed.includes("\n") || trimmed.length >= MIN_MEANINGFUL_PASTE_LENGTH;
}
