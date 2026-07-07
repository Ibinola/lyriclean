export interface Section {
  id: string;
  header: string;
  lines: string[];
}

const sectionPattern =
  /^(Verse\s*\d*|Chorus|Bridge|Intro|Outro|Pre-Chorus|Refrain|Hook|Tag|Interlude)$/i;

export function parseSections(text: string): Section[] {
  const paragraphs = text.split("\n\n");
  const result: Section[] = [];

  for (const para of paragraphs) {
    if (!para.trim()) continue;
    const lines = para.split("\n");
    if (sectionPattern.test(lines[0].trim())) {
      result.push({
        id: crypto.randomUUID(),
        header: lines[0],
        lines: lines.slice(1),
      });
    } else {
      result.push({
        id: crypto.randomUUID(),
        header: "",
        lines,
      });
    }
  }

  return result;
}

export function sectionsToText(sections: Section[]): string {
  return sections
    .map((s) =>
      s.header
        ? [s.header, ...s.lines].join("\n")
        : s.lines.join("\n"),
    )
    .join("\n\n");
}

export function hasSectionHeaders(sections: Section[]): boolean {
  return sections.some((s) => s.header !== "");
}
