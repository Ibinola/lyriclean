export interface CleaningOptions {
  removeFillerLines: boolean;
  removeRepeatMarkers: boolean;
  removeEmoji: boolean;
  removeStageDirections: boolean;
  removeLeaderCues: boolean;
  removeBGV: boolean;
  removeInstrumentalSections: boolean;
  stripVoiceAnnotations: boolean;
  stripNumberPrefixes: boolean;
  stripBulletPrefixes: boolean;
  stripCallResponse: boolean;
  normalizeSectionLabels: boolean;
  spellcheck: boolean;
  collapseEmptyLines: boolean;
}

export interface CleaningReport {
  fillerLinesRemoved: number;
  emojiRemoved: number;
  stageDirectionsRemoved: number;
  repeatMarkersStripped: number;
  spellcheckCorrections: number;
  sectionsDetected: number;
  totalLinesBefore: number;
  totalLinesAfter: number;
}

const STORAGE_KEY = "lyriclean:cleaningOptions";

export const defaultOptions: CleaningOptions = {
  removeFillerLines: true,
  removeRepeatMarkers: true,
  removeEmoji: true,
  removeStageDirections: true,
  removeLeaderCues: true,
  removeBGV: true,
  removeInstrumentalSections: true,
  stripVoiceAnnotations: true,
  stripNumberPrefixes: true,
  stripBulletPrefixes: true,
  stripCallResponse: true,
  normalizeSectionLabels: true,
  spellcheck: true,
  collapseEmptyLines: true,
};

export function loadOptions(): CleaningOptions {
  if (typeof window === "undefined") return { ...defaultOptions };
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...defaultOptions };
    const parsed = JSON.parse(raw);
    return { ...defaultOptions, ...parsed };
  } catch {
    return { ...defaultOptions };
  }
}

export function saveOptions(options: CleaningOptions): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(options));
  } catch {}
}

export const optionLabels: Record<keyof CleaningOptions, string> = {
  removeFillerLines: "Remove filler lines (Repeat, Refrain, Lead, etc.)",
  removeRepeatMarkers: "Remove repeat markers (x2, (Repeat x2))",
  removeEmoji: "Remove emoji",
  removeStageDirections: "Remove stage directions ([instrument only], (Sung in))",
  removeLeaderCues: "Remove leader cues (Lead, Leader, Pastor)",
  removeBGV: "Remove BGV/Choir notes",
  removeInstrumentalSections: "Remove [Instrumental] sections",
  stripVoiceAnnotations: "Strip voice annotations (lead, bgv, unison, harmony)",
  stripNumberPrefixes: "Strip line numbers (1., 2))",
  stripBulletPrefixes: "Strip bullet prefixes (-, •, ‣)",
  stripCallResponse: "Strip (Call/Response:) labels",
  normalizeSectionLabels: "Normalize section labels (verse→Verse, refrén→Chorus)",
  spellcheck: "Spellcheck (80+ worship corrections)",
  collapseEmptyLines: "Collapse consecutive empty lines",
};
