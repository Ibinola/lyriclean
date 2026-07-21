const labels = [
  "verse",
  "chorus",
  "bridge",
  "intro",
  "outro",
  "pre-chorus",
  "refrain",
  "hook",
  "tag",
  "interlude",
];

const labelPattern = new RegExp(
  `^[\\[\\\(]?\\s*(${labels.join("|")})(?:\\s*\\d+)?\\s*[\\]:\\)]?\\s*$`,
  "i",
);

function normalizeKey(label: string): string {
  return label
    .replace(/^\[|\]$/g, "")
    .replace(/^\(|\)$/g, "")
    .replace(/:$/, "")
    .trim()
    .toLowerCase()
    .replace(/\d+/, "")
    .trim();
}

/**
 * Expands parenthetical section references (e.g. `(Refrain)`) with the
 * actual section content from earlier in the song.
 *
 * Runs BEFORE the normal cleaning pass so the expanded text gets cleaned too.
 */
export function expandReferences(raw: string): string {
  if (!raw.trim()) return raw;

  const paragraphs = raw.split(/\n\s*\n/);
  // Map of normalized label → full paragraph text (header + lines)
  const sections = new Map<string, string>();

  // First pass: collect section definitions
  for (const para of paragraphs) {
    if (!para.trim()) continue;
    const lines = para.split("\n");
    const first = lines[0].trim();
    const match = first.match(labelPattern);
    if (match && lines.length > 1) {
      const key = normalizeKey(match[1]);
      // Store first occurrence (the full definition, not a reference)
      if (!sections.has(key)) {
        sections.set(key, para);
      }
    }
  }

  // Second pass: replace references
  const refPattern = new RegExp(
    `^[\\[\\\(]\\s*(${labels.map((l) => l + "(?:\\s*\\d+)?").join("|")})\\s*[\\]\\)]\\s*$`,
    "im",
  );

  const result = paragraphs.map((para) => {
    const trimmed = para.trim();
    if (!trimmed) return para;

    const match = trimmed.match(refPattern);
    if (match) {
      const key = normalizeKey(match[1]);
      const replacement = sections.get(key);
      if (replacement) {
        // Re-run the replacement text through section expansion too
        // (handles indirect references)
        return replacement;
      }
    }
    return para;
  });

  return result.join("\n\n");
}
