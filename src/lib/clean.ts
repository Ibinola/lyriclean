const sectionLabels = [
  "verse", "chorus", "bridge", "intro", "outro",
  "pre-chorus", "refrain", "hook", "tag", "interlude",
];

function removeEmoji(str: string): string {
  return str
    .replace(
      /[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F1E0}-\u{1F1FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{FE00}-\u{FE0F}\u{1F900}-\u{1F9FF}\u{1FA00}-\u{1FA6F}\u{1FA70}-\u{1FAFF}\u{200D}\u{20E3}\u{231A}-\u{231B}\u{23E9}-\u{23F3}\u{23F8}-\u{23FA}\u{25AA}-\u{25AB}\u{25B6}\u{25C0}\u{25FB}-\u{25FE}\u{2934}\u{2935}\u{2B05}-\u{2B07}\u{2B1B}-\u{2B1C}\u{2B50}\u{2B55}\u{3030}\u{303D}\u{3297}\u{3299}]/gu,
      "",
    )
    .trim();
}

function isSectionLabelLine(trimmed: string): boolean {
  const label = trimmed.replace(/^\[|\]$/g, "").replace(/:$/, "").trim();
  const lower = label.toLowerCase();
  if (sectionLabels.includes(lower)) return true;
  if (/^verse\s*\d*$/i.test(lower)) return true;
  if (/^pre[- ]?chorus$/i.test(lower)) return true;
  return false;
}

function normalizeSectionLabel(trimmed: string): string {
  let label = trimmed.replace(/^\[|\]$/g, "").replace(/:$/, "").trim();
  const lower = label.toLowerCase();
  if (/^pre[- ]?chorus$/i.test(lower)) return "Pre-Chorus";
  if (/^verse\s*\d*$/i.test(lower)) {
    const num = label.match(/\d+/);
    return "Verse " + (num ? num[0] : "");
  }
  return label.charAt(0).toUpperCase() + label.slice(1).toLowerCase();
}

function isFillerLine(trimmed: string): boolean {
  const lower = trimmed.toLowerCase();
  if (/^\(?\s*x\d+\s*\)?$/.test(trimmed)) return true;
  if (/^\(?\s*(?:repeat|refrain)\s*\)?$/.test(lower)) return true;
  if (/^\(?\s*instrumental\s*\)?$/.test(lower)) return true;
  if (/^\(?\s*interlude\s*\)?$/.test(lower)) return true;
  if (/^\d+\s*x\s*$/.test(trimmed)) return true;
  if (/^\[?(?:x\d+|repeat|refrain|instrumental|interlude)\]?$/.test(lower)) return true;
  if (/^2x$/.test(trimmed)) return true;
  if (removeEmoji(trimmed) === "" && trimmed.length > 0) return true;
  return false;
}

export interface CleanResult {
  text: string;
  sections: string[];
}

export function cleanLyrics(raw: string): CleanResult {
  if (!raw || !raw.trim()) return { text: "", sections: [] };

  const lines = raw.split("\n");
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

    if (isSectionLabelLine(trimmed)) {
      const normalized = normalizeSectionLabel(trimmed);
      result.push(normalized);
      if (!foundSections.includes(normalized)) {
        foundSections.push(normalized);
      }
      continue;
    }

    trimmed = trimmed.replace(/\s*\(?\s*x\d+\s*\)?\s*$/i, "");
    trimmed = trimmed.replace(/\s*\[x\d+\]\s*$/i, "");
    trimmed = trimmed.replace(/\s*\((?:Repeat|Refrain)\)\s*$/i, "");

    trimmed = trimmed.replace(/^\s*\d+[.)]\s*/, "");
    trimmed = trimmed.replace(/^\s*[-•·‣⁃]\s*/, "");

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
    /^(Verse\s*\d*|Chorus|Bridge|Intro|Outro|Pre-Chorus|Refrain|Hook|Tag|Interlude)$/i;
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
