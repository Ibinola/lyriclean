import { removeEmoji, isFillerLine } from "./fillerDetection";
import { matchesSectionLabel, normalizeSectionLabel, extractBracketedLabel } from "./sectionLabels";
import { spellcheck } from "./spellcheck";
import type { CleaningOptions, CleaningReport } from "./cleaningOptions";
import { defaultOptions } from "./cleaningOptions";

function stripANSI(str: string): string {
  return str.replace(/\x1b\[[\d;]*[a-zA-Z]/g, "");
}

export interface CleanResult {
  text: string;
  sections: string[];
  report: CleaningReport;
}

export function cleanLyrics(raw: string, options?: Partial<CleaningOptions>): CleanResult {
  const opts = { ...defaultOptions, ...options };
  const report: CleaningReport = {
    fillerLinesRemoved: 0,
    emojiRemoved: 0,
    stageDirectionsRemoved: 0,
    repeatMarkersStripped: 0,
    spellcheckCorrections: 0,
    sectionsDetected: 0,
    totalLinesBefore: 0,
    totalLinesAfter: 0,
  };

  if (!raw || !raw.trim()) return { text: "", sections: [], report };

  const text = stripANSI(raw);
  const lines = text.split("\n");
  report.totalLinesBefore = lines.filter((l) => l.trim()).length;

  // Optional spellcheck pass
  let spellchecked = text;
  if (opts.spellcheck) {
    const before = spellchecked;
    spellchecked = spellcheck(text);
    if (spellchecked !== before) {
      // Count corrections by comparing word by word
      const beforeWords = before.split(/\s+/);
      const afterWords = spellchecked.split(/\s+/);
      let corrections = 0;
      for (let i = 0; i < Math.min(beforeWords.length, afterWords.length); i++) {
        if (beforeWords[i] !== afterWords[i]) corrections++;
      }
      report.spellcheckCorrections = corrections;
    }
  }

  const cleanLines = spellchecked.split("\n");
  const result: string[] = [];
  const foundSections: string[] = [];

  for (const line of cleanLines) {
    const originalEmpty = line.trim() === "";
    let cleaned = opts.removeEmoji ? removeEmoji(line) : line;

    if (cleaned === "" && originalEmpty) {
      result.push("");
      continue;
    }
    if (cleaned === "") {
      if (opts.removeEmoji) report.emojiRemoved++;
      continue;
    }

    let trimmed = cleaned.trim();

    // Filter lines
    if (opts.removeFillerLines && isFillerLine(trimmed)) {
      report.fillerLinesRemoved++;
      continue;
    }

    // Section label detection
    const bracketed = opts.normalizeSectionLabels ? extractBracketedLabel(trimmed) : null;
    if (bracketed) {
      const normalized = normalizeSectionLabel(bracketed);
      result.push(normalized);
      if (!foundSections.includes(normalized)) {
        foundSections.push(normalized);
        report.sectionsDetected++;
      }
      continue;
    }

    if (opts.normalizeSectionLabels && matchesSectionLabel(trimmed)) {
      const normalized = normalizeSectionLabel(trimmed);
      result.push(normalized);
      if (!foundSections.includes(normalized)) {
        foundSections.push(normalized);
        report.sectionsDetected++;
      }
      continue;
    }

    // Stage directions
    if (opts.removeStageDirections && /^\[.+\]$/.test(trimmed)) {
      report.stageDirectionsRemoved++;
      continue;
    }

    // Repeat markers
    if (opts.removeRepeatMarkers) {
      const hasXNumber = /(?:\d+\s*x\s*\d*|x\d+)/i.test(trimmed);
      trimmed = trimmed.replace(
        /\s*[\[\(]?\s*(?:(?:\d+\s*x\s*\d*|x\d+)|(?:repeat|refrain|instrumentals?|chants?)(?:\s+(?:\d+\s*x\s*\d*|x\d+))?)\s*[\]\)]?\s*$/i,
        "",
      );
      if (hasXNumber) report.repeatMarkersStripped++;

      // Voice annotations (only on x-number lines)
      if (opts.stripVoiceAnnotations && hasXNumber) {
        const before = trimmed;
        trimmed = trimmed.replace(/\s*(?:lead|bgv|unison|harmony)\s*$/i, "");
        if (trimmed !== before) report.repeatMarkersStripped++;
      }

      trimmed = trimmed.replace(/\s*[\[\(]?\s*(?:\d+\s*x\s*\d*|x\d+)\s*[\]\)]?\s*$/i, "");
    }

    // Number prefixes
    if (opts.stripNumberPrefixes) {
      trimmed = trimmed.replace(/^\s*\d+[.)]\s*/, "");
    }

    // Bullet prefixes
    if (opts.stripBulletPrefixes) {
      trimmed = trimmed.replace(/^\s*[-•·‣⁃]\s*/, "");
    }

    // Call/Response
    if (opts.stripCallResponse) {
      trimmed = trimmed.replace(/^(Call|Response):\s*/i, "");
    }

    trimmed = trimmed.trim();
    if (!trimmed) continue;

    result.push(trimmed);
  }

  // Collapse empty lines
  if (opts.collapseEmptyLines) {
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

    report.totalLinesAfter = final.filter((l) => l.trim()).length;
    return { text: final.join("\n"), sections: foundSections, report };
  }

  report.totalLinesAfter = result.filter((l) => l.trim()).length;
  return { text: result.join("\n"), sections: foundSections, report };
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
