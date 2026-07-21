const sectionLabels = [
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
  "chants",
  "instrumental",
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

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
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
  let label = text
    .replace(/^\[|\]$/g, "")
    .replace(/:$/, "")
    .trim();
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
  let label = trimmed
    .replace(/^\[|\]$/g, "")
    .replace(/:$/, "")
    .trim();
  const colonIdx = label.indexOf(":");
  if (colonIdx > 0) {
    const prefix = label.slice(0, colonIdx).trim();
    const lowerPrefix = prefix.toLowerCase();
    if (
      sectionLabels.includes(lowerPrefix) ||
      sectionLabels.some((s) => new RegExp(`^${s}\\s*\\d*$`, "i").test(lowerPrefix))
    ) {
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

export {
  sectionLabels,
  labelAliases,
  matchesSectionLabel,
  normalizeSectionLabel,
  extractBracketedLabel,
};
