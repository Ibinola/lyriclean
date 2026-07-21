# Shipping Log

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
