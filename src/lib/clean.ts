import { removeEmoji, isFillerLine } from "./fillerDetection";
import {
  matchesSectionLabel,
  normalizeSectionLabel,
  extractBracketedLabel,
} from "./sectionLabels";

function stripANSI(str: string): string {
  return str.replace(/\x1b\[[\d;]*[a-zA-Z]/g, "");
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
