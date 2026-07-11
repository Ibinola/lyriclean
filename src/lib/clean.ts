const sectionLabels = [
  "verse", "chorus", "bridge", "intro", "outro",
  "pre-chorus", "refrain", "hook", "tag", "interlude",
  "chants", "instrumental",
];

const labelAliases = new Map([
  ["refrén", "chorus"],
  ["verze", "verse"],
  ["verzus", "verse"],
  ["intró", "intro"],
  ["instrumentális", "instrumental"],
  ["outró", "outro"],
  ["strofa", "verse"],
  ["ritornello", "chorus"],
  ["ponte", "bridge"],
]);

function stripANSI(str: string): string {
  return str.replace(/\x1b\[[\d;]*[a-zA-Z]/g, "");
}

function removeEmoji(str: string): string {
  return str
    .replace(
      /[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F1E0}-\u{1F1FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{FE00}-\u{FE0F}\u{1F900}-\u{1F9FF}\u{1FA00}-\u{1FA6F}\u{1FA70}-\u{1FAFF}\u{200D}\u{20E3}\u{231A}-\u{231B}\u{23E9}-\u{23F3}\u{23F8}-\u{23FA}\u{25AA}-\u{25AB}\u{25B6}\u{25C0}\u{25FB}-\u{25FE}\u{2934}\u{2935}\u{2B05}-\u{2B07}\u{2B1B}-\u{2B1C}\u{2B50}\u{2B55}\u{3030}\u{303D}\u{3297}\u{3299}]/gu,
      "",
    )
    .trim();
}

function resolveLabelAlias(label: string): string {
  const lower = label.toLowerCase().trim();
  for (const [alias, english] of labelAliases) {
    if (lower === alias) return english;
    if (new RegExp(`^${alias}\\s*\\d*$`, "i").test(lower)) {
      const num = lower.match(/\d+/);
      return english + (num ? ` ${num[0]}` : "");
    }
    const colonIdx = lower.indexOf(":");
    if (colonIdx > 0) {
      const prefix = lower.slice(0, colonIdx).trim();
      if (prefix === alias) return english;
      const prefixNum = prefix.match(/\d+/);
      if (new RegExp(`^${alias}\\s*\\d*$`, "i").test(prefix)) {
        return english + (prefixNum ? ` ${prefixNum[0]}` : "");
      }
    }
  }
  return label;
}

function matchesSectionLabel(text: string): boolean {
  let label = text.replace(/^\[|\]$/g, "").replace(/:$/, "").trim();
  const lower = label.toLowerCase();
  if (sectionLabels.includes(lower)) return true;
  if (sectionLabels.some((s) => new RegExp(`^${s}\\s*\\d*$`, "i").test(lower))) return true;
  if (/^verse\s*\d*$/i.test(lower)) return true;
  if (/^pre[- ]?chorus$/i.test(lower)) return true;
  if (resolveLabelAlias(label) !== label) return true;
  const colonIdx = lower.indexOf(":");
  if (colonIdx > 0) {
    const prefix = lower.slice(0, colonIdx).trim();
    if (sectionLabels.includes(prefix)) return true;
    if (sectionLabels.some((s) => new RegExp(`^${s}\\s*\\d*$`, "i").test(prefix))) return true;
    if (resolveLabelAlias(prefix) !== prefix) return true;
  }
  return false;
}

function normalizeSectionLabel(trimmed: string): string {
  let label = trimmed.replace(/^\[|\]$/g, "").replace(/:$/, "").trim();
  const colonIdx = label.indexOf(":");
  if (colonIdx > 0) {
    const prefix = label.slice(0, colonIdx).trim();
    const lowerPrefix = prefix.toLowerCase();
    if (sectionLabels.includes(lowerPrefix) || sectionLabels.some((s) => new RegExp(`^${s}\\s*\\d*$`, "i").test(lowerPrefix))) {
      label = prefix;
    }
    if (resolveLabelAlias(prefix) !== prefix) label = prefix;
  }
  const aliasResolved = resolveLabelAlias(label);
  if (aliasResolved !== label) return capitalize(aliasResolved);
  const lower = label.toLowerCase();
  if (/^pre[- ]?chorus$/i.test(lower)) return "Pre-Chorus";
  if (/^verse\s*\d*$/i.test(lower)) {
    const num = label.match(/\d+/);
    return "Verse " + (num ? num[0] : "");
  }
  for (const s of sectionLabels) {
    const m = lower.match(new RegExp(`^${s}\\s*(\\d+)?$`, "i"));
    if (m) {
      const n = s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();
      return m[1] ? `${n} ${m[1]}` : n;
    }
  }
  return label.charAt(0).toUpperCase() + label.slice(1).toLowerCase();
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function extractBracketedLabel(trimmed: string): string | null {
  const m = trimmed.match(/\[([^\]]+)\]/);
  if (m && matchesSectionLabel(`[${m[1].trim()}]`)) {
    const full = `[${m[1].trim()}]`;
    const before = trimmed.slice(0, m.index).trim();
    const after = trimmed.slice(m.index! + m[0].length).trim();
    if (!before || matchesSectionLabel(full)) {
      return full;
    }
  }
  return null;
}

const instructionWords = new Set([
  "repeat", "refrain", "interlude", "instrumental", "chants",
  "lead", "bgv", "unison", "harmony",
]);

const noiseWords = new Set([
  "a", "an", "the", "and", "or", "but", "in", "on", "at", "to",
  "for", "of", "with", "by", "from", "into", "through", "like",
  "things", "as", "if", "so", "than", "then", "just", "very",
]);

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

export interface CleanResult {
  text: string;
  sections: string[];
}

export function cleanLyrics(raw: string): CleanResult {
  if (!raw || !raw.trim()) return { text: "", sections: [] };

  const text = stripANSI(raw);
  const lines = text.split("\n");
  const result: string[] = [];
  const foundSections: string[] = [];

  for (const line of lines) {
    const originalEmpty = line.trim() === "";
    let cleaned = removeEmoji(line);

    if (cleaned === "" && originalEmpty) {
      result.push("");
      continue;
    }
    if (cleaned === "") continue;

    let trimmed = cleaned.trim();

    if (isFillerLine(trimmed)) continue;

    const bracketed = extractBracketedLabel(trimmed);
    if (bracketed) {
      const normalized = normalizeSectionLabel(bracketed);
      result.push(normalized);
      if (!foundSections.includes(normalized)) {
        foundSections.push(normalized);
      }
      continue;
    }

    if (matchesSectionLabel(trimmed)) {
      const normalized = normalizeSectionLabel(trimmed);
      result.push(normalized);
      if (!foundSections.includes(normalized)) {
        foundSections.push(normalized);
      }
      continue;
    }

    // Pure bracket line that isn't a recognized section → filler
    if (/^\[.+\]$/.test(trimmed)) continue;

    const hasXNumber = /(?:\d+\s*x\s*\d*|x\d+)/i.test(trimmed);
    trimmed = trimmed.replace(
      /\s*[\[\(]?\s*(?:(?:\d+\s*x\s*\d*|x\d+)|(?:repeat|refrain|instrumentals?|chants?)(?:\s+(?:\d+\s*x\s*\d*|x\d+))?)\s*[\]\)]?\s*$/i,
      "",
    );
    if (hasXNumber) {
      trimmed = trimmed.replace(/\s*(?:lead|bgv|unison|harmony)\s*$/i, "");
    }
    trimmed = trimmed.replace(
      /\s*[\[\(]?\s*(?:\d+\s*x\s*\d*|x\d+)\s*[\]\)]?\s*$/i,
      "",
    );

    trimmed = trimmed.replace(/^\s*\d+[.)]\s*/, "");
    trimmed = trimmed.replace(/^\s*[-•·‣⁃]\s*/, "");
    trimmed = trimmed.replace(/^(Call|Response):\s*/i, "");

    trimmed = trimmed.trim();
    if (!trimmed) continue;

    result.push(trimmed);
  }

  const final: string[] = [];
  let prevBlank = false;
  for (const line of result) {
    if (line === "") {
      if (prevBlank) continue;
      prevBlank = true;
    } else {
      prevBlank = false;
    }
    final.push(line);
  }

  if (final.length > 0 && final[final.length - 1] === "") final.pop();
  if (final.length > 0 && final[0] === "") final.shift();

  return { text: final.join("\n"), sections: foundSections };
}

export function applyLineBreaks(text: string, lpb: number): string {
  if (!lpb || lpb <= 0 || !text) return text;

  const paragraphs = text.split("\n\n");
  const sectionPattern =
    /^(Verse\s*\d*|Chorus(?:\s+\d+)?|Bridge(?:\s+\d+)?|Intro(?:\s+\d+)?|Outro(?:\s+\d+)?|Pre-Chorus|Refrain|Hook|Tag|Interlude|Chants|Instrumental(?:\s+\d+)?)$/i;
  const result: string[] = [];

  for (const para of paragraphs) {
    if (!para.trim()) continue;
    const lines = para.split("\n");
    let header: string | null = null;
    let content = lines;

    if (sectionPattern.test(lines[0].trim())) {
      header = lines[0];
      content = lines.slice(1);
    }

    if (content.length === 0) {
      if (header) result.push(header);
      continue;
    }

    const groups: string[][] = [];
    for (let i = 0; i < content.length; i += lpb) {
      groups.push(content.slice(i, i + lpb));
    }

    const formatted = groups.map((g) => g.join("\n")).join("\n\n");
    result.push(header ? header + "\n" + formatted : formatted);
  }

  return result.join("\n\n");
}
