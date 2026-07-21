# Shipping Log

## [v0.9] — 2026-07-21 — Phase 1: Core UX (Undo, Auto-save, Preferences, Report)

| Area | Change |
|------|--------|
| **Undo/Redo** | History stack with push/undo/redo; `⌘+Z` / `⌘+Shift+Z`; Undo/Redo buttons in ControlPanel |
| **Reset to original** | One-click button to clear cleaned output and start over |
| **Auto-save** | State persisted to `localStorage` 1s after every change, restored on page load |
| **Cleaning preferences** | Settings panel with 14 toggleable cleaning rules, organized into 3 groups with Enable/Disable All per group; persisted to `localStorage` |
| **Cleaning report** | Post-cleaning banner showing filler lines removed, spelling corrections, sections detected, line reduction |
| **TXT download** | Plain Text (.txt) option added to Export dropdown |
| **Auto-paste detection** | `onPaste` handler triggers when pasted content >20 chars |
| **Keyboard shortcuts** | Added `⌘+Z` (undo), `⌘+Shift+Z` (redo); shortcuts modal now lists all 6 shortcuts |

### Files
- `src/lib/cleaningOptions.ts` — new
- `src/lib/history.ts` — new
- `src/components/SettingsPanel.tsx` — new
- `src/lib/clean.ts` — refactored to accept `CleaningOptions`, return `CleaningReport`
- `src/app/tool/page.tsx` — wired history, auto-save, preferences, report, TXT export, auto-paste
- `src/components/ControlPanel.tsx` — added Undo/Redo/Reset, Rules, TXT export, cleaning report banner
- `src/components/LyricEditor.tsx` — added `onPaste` prop
- `src/components/KeyboardShortcuts.tsx` — updated to show all 6 shortcuts

---

## [v0.8] — 2026-07-21 — ESLint fix + CI green

| Area | Change |
|------|--------|
| **ESLint** | Rewrote `eslint.config.mjs` to use `FlatCompat` from `@eslint/eslintrc` — previous config was silently broken |
| **CI** | Lint now passes with 0 errors (was 8103 false positives from `.next/types/` + non-working config) |

---

## [v0.7] — 2026-07-21 — Prettier, CI, A11y, Spellcheck cleanup

| Area | Change |
|------|--------|
| **Prettier** | `.prettierrc` + `.prettierignore` + `npm run format` script, full source format pass |
| **CI/CD** | GitHub Actions workflow: `npm ci` → `npm run lint` → `npm test` → `npm run build` on push/PR |
| **A11y** | `role="list"`, `role="listitem"`, `aria-roledescription="sortable slide"`, `aria-label` on slides/drag handles, `role="textbox"` on contentEditable, `aria-hidden` on decorative SVGs |
| **Spellcheck** | Removed 6 duplicate map entries and the correct-spelling entry `praise` |

### Files
- `.prettierrc`, `.prettierignore` — new
- `.github/workflows/ci.yml` — new
- `src/components/SortableSections.tsx` — a11y attributes
- `src/lib/spellcheck.ts` — deduped

---

## [v0.6] — 2026-07-21 — Changelog UI

| Area | Change |
|------|--------|
| **Changelog modal** | "What's New" dialog in footer showing release notes from v0.1–v0.5 |
| **Data source** | Release data hardcoded in component, links to SHIPPED.md on GitHub |

### Files
- `src/components/Changelog.tsx` — new
- `src/app/page.tsx` — Changelog component added to footer

---

## [v0.5] — 2026-07-21 — Error Boundary, Toasts, Loading States

| Area | Change |
|------|--------|
| **ErrorBoundary** | Class component wrapping the app, catches uncaught React errors with a "Try again" fallback |
| **Toast system** | Context-based notifications (success/error/info), auto-dismiss 4s, zero dependencies |
| **Loading states** | Clean button spinner + disable; Export dropdown spinner per format + disable |
| **Toast feedback** | Copy, export, clean, and lyrics-lookup actions now surface success/failure toasts |
| **Bundle** | Page +46.3 kB (base 103 kB shared); minimal overhead |

### Files
- `src/components/ErrorBoundary.tsx` — new
- `src/components/Toaster.tsx` — new
- `src/app/layout.tsx` — wrapped with ErrorBoundary + ToastProvider
- `src/app/page.tsx` — cleaning/exporting state, toast hook, error wrapping on export/copy
- `src/components/ControlPanel.tsx` — cleaning/exporting props, Spinner component, button states

---

## [v0.4] — 2026-07-21 — Test Suite (75 tests)

| Area | Change |
|------|--------|
| **Test infra** | vitest + config with `@/` path alias |
| **clean.ts** | 28 tests: ANSI, emoji, sections, filler detection, annotations, line breaks |
| **spellcheck.ts** | 17 tests: 120-entry map, 3-branch casing, punctuation |
| **detectDuplicates.ts** | 11 tests: Jaccard similarity, threshold, indices |
| **expandSections.ts** | 9 tests: reference expansion, numbered refs, indirect refs |
| **parseSections.ts** | 9 tests: parsing, serialization, headers |

### Bug fix
- `expandSections.ts`: refPattern now supports numbered references like `(Verse 1)` (was only matching bare labels)

### Files
- `vitest.config.ts` — new
- `src/lib/*.test.ts` — 5 new test files

---

## [v0.3] — Duplicate Detection & Pipeline Hardening

| Area | Change |
|------|--------|
| **Duplicate detection** | Jaccard similarity ≥75%, inline remove/rename/keep actions |
| **Filler detection** | Ratio-based classifier: strip x-numbers, filter noise words, ≥80% instruction words = discard |
| **Meta-comment catch** | Lines with 3+ perf terms discarded |
| **Voice annotation fix** | Annotations (Lead/BGV/unison/harmony) only stripped when x-number present |

### Files
- `src/lib/detectDuplicates.ts` — new
- `src/lib/clean.ts` — refactored filler detection

---

## [v0.2] — Lyrics Lookup & Smarter Cleaning

| Area | Change |
|------|--------|
| **Lyrics search** | Modal with Genius API + cheerio scrape, LRCLIB REST API |
| **Lyrics fetch** | Cascading fallback: Genius → LRCLIB → African Gospel Lyrics scraper |
| **Spellcheck** | 80+ worship-typo correction map with case preservation |
| **Section expansion** | Two-pass reference expansion: `(Refrain)` → full section content |
| **Multi-language** | Hungarian (`refrén`→Chorus) and Italian (`ritornello`→Chorus) label aliases |

### Files
- `src/app/api/lyrics/search/route.ts` — new
- `src/app/api/lyrics/fetch/route.ts` — new
- `src/components/LyricsSearch.tsx` — new
- `src/lib/spellcheck.ts` — new
- `src/lib/expandSections.ts` — new

---

## [v0.1] — Core Pipeline & UI

| Area | Change |
|------|--------|
| **Text pipeline** | 7-stage normalization: ANSI → emoji → filler → sections → annotations → bullets → blanks |
| **Drag & drop** | dnd-kit sortable slide reordering |
| **Export** | EasyWorship XML, ProPresenter text, PowerPoint (pptxgenjs) |
| **Search/replace** | Zero-dependency find-and-replace with regex escaping |
| **Dark mode** | No-flash inline script before React hydration |
| **Onboarding** | Custom tour (replaced react-joyride) with responsive tooltip/modal |
| **Keyboard shortcuts** | Stale-safe ref pattern for event handlers |

### Tech
- Next.js 15 App Router + TypeScript + Tailwind v4 + shadcn/ui
- Deployed on Vercel free tier
- Open source MIT at github.com/Ibinola/lyriclean
