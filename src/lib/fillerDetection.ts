const instructionWords = new Set([
  "repeat", "refrain", "interlude", "instrumental", "chants",
  "lead", "bgv", "unison", "harmony",
]);

const noiseWords = new Set([
  "a", "an", "the", "and", "or", "but", "in", "on", "at", "to",
  "for", "of", "with", "by", "from", "into", "through", "like",
  "things", "as", "if", "so", "than", "then", "just", "very",
]);

function removeEmoji(str: string): string {
  return str
    .replace(
      /[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F1E0}-\u{1F1FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{FE00}-\u{FE0F}\u{1F900}-\u{1F9FF}\u{1FA00}-\u{1FA6F}\u{1FA70}-\u{1FAFF}\u{200D}\u{20E3}\u{231A}-\u{231B}\u{23E9}-\u{23F3}\u{23F8}-\u{23FA}\u{25AA}-\u{25AB}\u{25B6}\u{25C0}\u{25FB}-\u{25FE}\u{2934}\u{2935}\u{2B05}-\u{2B07}\u{2B1B}-\u{2B1C}\u{2B50}\u{2B55}\u{3030}\u{303D}\u{3297}\u{3299}]/gu,
      "",
    )
    .trim();
}

function isFillerLine(trimmed: string): boolean {
  const lower = trimmed.toLowerCase();
  if (/^[\[\(]?\s*(?:(?:\d+\s*x\s*\d*|x\d+)|(?:repeat|refrain|instrumentals?|interlude|chants?)(?:\s+(?:\d+\s*x\s*\d*|x\d+))?)\s*[\]\)]?$/.test(lower)) return true;
  if (/^\(sung\s+in\s+\w+\)$/i.test(trimmed)) return true;
  if (/^\[.*?\]$/.test(trimmed) && /[?]/.test(trimmed)) return true;
  if (/^Repeat:\s/i.test(trimmed)) return true;
  if (/^Refrain:\s?$/i.test(trimmed)) return true;
  if (removeEmoji(trimmed) === "" && trimmed.length > 0) return true;
  if (/^\d+\s*contributors?/i.test(trimmed)) return true;
  const clean = lower.replace(/(?:\d+\s*x\s*\d*|x\d+)/g, "");
  const words = clean.split(/[\s,;:!?()\[\]'"\/]+/).filter((w) => w.length > 0);
  if (words.length === 0) return true;
  const nonNoise = words.filter((w) => !noiseWords.has(w));
  if (nonNoise.length === 0) return false;
  const instructionCount = nonNoise.filter((w) => instructionWords.has(w)).length;
  return instructionCount / nonNoise.length >= 0.8;
}

export { removeEmoji, isFillerLine };
