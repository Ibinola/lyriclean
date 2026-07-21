export interface DuplicateGroup {
  aIndex: number;
  bIndex: number;
  similarity: number;
  aHeader: string;
  bHeader: string;
  aContent: string;
  bContent: string;
}

function normalizeLines(lines: string[]): string[] {
  return lines.map((l) => l.toLowerCase().trim()).filter(Boolean);
}

function jaccardSimilarity(a: string[], b: string[]): number {
  const setA = new Set(a);
  const setB = new Set(b);
  let intersection = 0;
  for (const x of setA) {
    if (setB.has(x)) intersection++;
  }
  const union = new Set([...setA, ...setB]).size;
  if (union === 0) return 0;
  return intersection / union;
}

function contentHash(text: string): string {
  let h = 0;
  for (let i = 0; i < text.length; i++) {
    h = (h << 5) - h + text.charCodeAt(i);
    h |= 0;
  }
  return `h${Math.abs(h)}`;
}

export function detectDuplicates(text: string, threshold = 0.75): DuplicateGroup[] {
  const paragraphs = text.split("\n\n").filter(Boolean);
  const sectionPattern =
    /^(Verse\s*\d*|Chorus(?:\s+\d+)?|Bridge(?:\s+\d+)?|Intro(?:\s+\d+)?|Outro(?:\s+\d+)?|Pre-Chorus|Refrain|Hook|Tag|Interlude|Chants|Instrumental(?:\s+\d+)?)$/i;

  interface Para {
    header: string;
    lines: string[];
    hash: string;
  }

  const parsed: Para[] = paragraphs.map((p) => {
    const lines = p.split("\n");
    const first = lines[0].trim();
    if (sectionPattern.test(first)) {
      return { header: first, lines: lines.slice(1), hash: contentHash(p) };
    }
    return { header: "", lines, hash: contentHash(p) };
  });

  const results: DuplicateGroup[] = [];
  const paired = new Set<string>();

  for (let i = 0; i < parsed.length; i++) {
    for (let j = i + 1; j < parsed.length; j++) {
      const key = `${i}-${j}`;
      if (paired.has(key)) continue;

      const a = normalizeLines(parsed[i].lines);
      const b = normalizeLines(parsed[j].lines);
      if (a.length === 0 && b.length === 0) continue;

      const sim = jaccardSimilarity(a, b);
      if (sim >= threshold) {
        results.push({
          aIndex: i,
          bIndex: j,
          similarity: sim,
          aHeader: parsed[i].header,
          bHeader: parsed[j].header,
          aContent: paragraphs[i],
          bContent: paragraphs[j],
        });
        paired.add(key);
      }
    }
  }

  return results;
}
