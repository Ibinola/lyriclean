# lyriclean — Clean lyrics. Clear worship. Open source.

## Problem Statement
Church projection teams receive raw lyrics at the last minute — via email, messaging apps, song databases, or handwritten notes. These messages contain formatting noise (e.g., `(x2)`, `[chorus]`, `Chorus:`, `(repeat)`, stray numbering, emoji), inconsistent section labels, and sometimes outright errors. Cleaning these manually line-by-line before service is tedious, error-prone, and stressful under time pressure.

## Target User Profile
- Church media/projection/streaming volunteers (often non-technical)
- Typically work on Windows (EasyWorship), but access messaging on phone
- Comfortable with copy-paste; not with editing tools or scripting
- Need speed — turnaround is often <30 minutes before service

## Tech Stack
- **Frontend**: Next.js 15 (App Router) + TypeScript + Tailwind CSS v4 + shadcn/ui
- **Hosting**: Vercel (free tier)
- **API**: serverless functions (Genius OAuth, LRCLIB, cheerio-based scraper)
- **Current**: No database, no authentication

---

## v1 — Clean & Structure (shipped)

| # | Feature | Description |
|---|---------|-------------|
| 1 | **Paste & Clean** | Paste raw lyrics → cleaned, structured lyrics instantly |
| 2 | **Smart Filler Removal** | Strip `x2`, `(x2)`, `(Repeat)`, `(Refrain)`, emoji, numbering, bullets |
| 3 | **Structure Detection** | Normalize section headers (Verse 1, Chorus, Bridge, Refrain) |
| 4 | **Lines per Slide** | Split lyrics into groups of N lines with blank-line breaks |
| 5 | **Search & Replace** | Batch-fix repeated typos across the whole song |
| 6 | **One-Click Copy** | Copy cleaned plain text to clipboard |

---

## v2 — Polish & Practical (shipped)

| # | Feature | Description |
|---|---------|-------------|
| 1 | **Keyboard Shortcuts** | `Cmd+Enter` clean, `Cmd+Shift+C` copy, `Cmd+F` search, `Escape` close |
| 2 | **Dark Mode** | Follows `prefers-color-scheme`, no flash on load |
| 3 | **Section Reordering** | Drag-and-drop slide cards via dnd-kit; contentEditable for inline edits |
| 4 | **Export Formats** | EasyWorship `.ews`, ProPresenter `.pro`, PowerPoint `.pptx` |
| 5 | **Onboarding Tour** | Multi-step guided tour for first-time users |
| 6 | **Multi-language Labels** | Hungarian (`refrén`, `verze`), Italian (`strofa`, `ritornello`), etc. mapped to English |
| 7 | **Metadata Scrub** | Strip AGL-style `N Contributors...Lyrics[...]` lines, ANSI codes, `(Sung in ...)` |

---

## v3 — Productivity (shipped)

| # | Feature | Description |
|---|---------|-------------|
| 1 | **Smart Spellcheck** | 80+ worship-typo corrections (Halellujah → Hallelujah, Hosana → Hosanna) |
| 2 | **Section Expansion** | `(Refrain)` / `(Repeat)` references auto-expand with actual section content |
| 3 | **Auto Lyrics Lookup** | Search Genius + LRCLIB + African Gospel Lyrics; cascade fallback; modal UI with preview |

### Lyrics Lookup — Sources
| Source | Key | Type | Coverage |
|--------|-----|------|----------|
| **Genius** | `GENIUS_API_KEY` | API search + scrape `[data-lyrics-container]` | Broad, English-dominant |
| **LRCLIB** | None | Sync/plain lyrics fetch | Good for known track/artist combos |
| **African Gospel Lyrics** | None | WordPress scraper | Excellent for Nigerian gospel |

---

## v4 — Pipeline Hardening (shipped)

| # | Feature | Description |
|---|---------|-------------|
| 1 | **Duplicate Detection** | Jaccard similarity ≥75% flags similar sections; inline remove, rename, or keep |
| 2 | **Ratio-based Filler Detection** | Replaced fragile regex pile with principled classifier (≥80% instruction words = discard) |
| 3 | **Test Suite** | 75 unit tests across all pipeline modules (vitest) |
| 4 | **Error Boundary** | Catches uncaught React errors with "Try again" fallback |
| 5 | **Toast Notifications** | Success/error/info toasts for copy, export, clean, and lyrics-lookup |
| 6 | **Loading States** | Spinners and disabled states on Clean and Export buttons |
| 7 | **Changelog UI** | "What's New" modal in footer showing release notes |
| 8 | **CI/CD** | GitHub Actions (lint → test → build) on push/PR |
| 9 | **A11y** | `role="list"`, `aria-roledescription`, `aria-label`, `role="textbox"` on sortable cards |
| 10 | **Spellcheck Cleanup** | Removed 7 duplicate/correct-spelling entries from correction map |
| 11 | **Code Split** | `clean.ts` refactored into `sectionLabels.ts` + `fillerDetection.ts` |

---

## v5 — Pipeline Hardening (shipped)

| # | Feature | Description |
|---|---------|-------------|
| 1 | **Duplicate Detection** | Jaccard similarity ≥75% flags similar sections; inline remove, rename, or keep |
| 2 | **Ratio-based Filler Detection** | Replaced fragile regex pile with principled classifier (≥80% instruction words = discard) |
| 3 | **Test Suite** | 75 unit tests across all pipeline modules (vitest) |
| 4 | **Error Boundary** | Catches uncaught React errors with "Try again" fallback |
| 5 | **Toast Notifications** | Success/error/info toasts for copy, export, clean, and lyrics-lookup |
| 6 | **Loading States** | Spinners and disabled states on Clean and Export buttons |
| 7 | **Changelog UI** | "What's New" modal in footer showing release notes |
| 8 | **CI/CD** | GitHub Actions (lint → test → build) on push/PR |
| 9 | **A11y** | `role="list"`, `aria-roledescription`, `aria-label`, `role="textbox"` on sortable cards |
| 10 | **Spellcheck Cleanup** | Removed 7 duplicate/correct-spelling entries from correction map |
| 11 | **Code Split** | `clean.ts` refactored into `sectionLabels.ts` + `fillerDetection.ts` |

---

## v6 — Core UX (shipped)

| # | Feature | Description |
|---|---------|-------------|
| 1 | **Undo/Redo/Reset** | History stack (50 snapshots); `⌘+Z`, `⌘+Shift+Z`; Undo/Redo/Reset buttons in toolbar |
| 2 | **Auto-save** | Snapshot persisted to `localStorage` 1s after every change; restored on page load |
| 3 | **Toggleable cleaning rules** | 14 rules in 3 groups (Filler & Instructions, Annotations & Prefixes, Formatting); saved to `localStorage` |
| 4 | **TXT export** | Plain Text (.txt) download added to Export dropdown |
| 5 | **Auto-paste detection** | `onPaste` handler auto-triggers on pasted content >20 chars |
| 6 | **Cleaning report** | Post-clean banner: filler removed, spelling corrections, sections detected, line reduction |

---

## v7 — Future

| # | Feature | Description |
|---|---------|-------------|
| 1 | **PWA / Offline** | Service worker, installable, works without internet |
| 2 | **Account + Library** | Save songs, tag by date/service |
| 3 | **Team Sharing** | Choir director sends → projectionist receives cleaned version |
| 4 | **Song Versioning** | Track changes between Saturday night and Sunday morning |
| 5 | **Public Song Database** | Crowd-sourced corrections per song |
| 6 | **Manual Dark Mode Toggle** | Override system preference from the UI |
| 7 | **i18n** | UI translations beyond section label aliases |

### v5 — Dependencies & Risk
| Feature | New dependency | Risk |
|---------|---------------|------|
| PWA / Offline | `next-pwa` or similar | Low |
| Accounts + Library | Supabase (Postgres + Auth) | Medium — auth UX, migration |
| Team Sharing | Supabase Realtime | Medium — concurrency, access control |

---

## Competitive Comparison — Gizmo (gizmo-app.vercel.app)

| Feature | Gizmo | lyriclean |
|---|---|---|
| **Search lyrics** | ✅ Shazam API (hardcoded key) | ✅ Genius + LRCLIB + AGL |
| **Paste & clean** | Basic (no filler removal) | ✅ Full smart removal |
| **Section detection** | ❌ None | ✅ Verse/Chorus/Bridge/Intro/Outro + aliases |
| **Multi-language labels** | ❌ | ✅ Hungarian, Italian, English |
| **Filler stripping** | ❌ None | ✅ x2, Repeat, Refrain, emoji, bullets, numbering, annotations |
| **Section expansion** | ❌ | ✅ (Refrain) → full content |
| **Spellcheck** | ❌ | ✅ 80+ worship typos |
| **Lines-per-slide** | ✅ Line-count only | ✅ Line-count + section-aware |
| **Search & replace** | ❌ None | ✅ |
| **Dark mode** | ❌ None | ✅ |
| **Keyboard shortcuts** | ❌ None | ✅ |
| **Slide reordering** | ❌ | ✅ dnd-kit + contentEditable |
| **Export formats** | ❌ Copy only | ✅ EWS, ProPresenter, PPTX |
| **EasyWorship export** | ❌ | ✅ |
| **Duplicate detection** | ❌ | ✅ Jaccard similarity, inline actions |
| **Error handling** | ❌ | ✅ Error boundary + toasts |
| **Tests** | ❌ | ✅ 75 unit tests |
| **CI/CD** | ❌ | ✅ GitHub Actions |
| **API dependency** | ✅ Requires Shazam key | ⚠️ Genius key optional; LRCLIB/AGL keyless |
| **API key exposure** | ⚠️ Hardcoded in bundle | ✅ Server-side only |
| **Framework** | CRA (deprecated) | Next.js 15 App Router |

---

## Technical Backlog
- PWA / offline support
- E2E tests (Playwright) for the cleaning pipeline
- Manual dark mode toggle (currently system-only, no override)
- Postgres on Supabase for accounts + library
- OpenAPI spec for future API consumers
- Split `annotationStripper.ts` from `clean.ts`
- Strict TypeScript mode (`tsconfig.json` has `strict: true` but code has `any` types)
- Live cleaning while typing (debounced auto-clean)
- File drag-and-drop import (TXT)
- Diff/highlight changes view
- Presentation slide preview
- Custom removable keywords in filler detection

## Definition of Done (Current)
- [x] Paste raw lyrics → cleaned output in <500ms
- [x] Fillers (`x2`, `(Repeat)`, `(Refrain)`, emoji, numbering) stripped
- [x] Sections detected and labelled correctly for ≥90% of typical songs
- [x] Lines per slide control with live preview
- [x] Search & Replace works across full lyric text
- [x] Copy to clipboard produces clean, paste-ready text
- [x] Responsive — phone, tablet, desktop
- [x] Deployed at lyriclean.vercel.app
- [x] Open source on GitHub
- [x] Spellcheck — 80+ worship typos auto-corrected
- [x] Section expansion — `(Refrain)` / `(Repeat)` expand to full content
- [x] Lyrics lookup — search Genius, LRCLIB, African Gospel Lyrics
- [x] Export — EasyWorship, ProPresenter, PowerPoint, TXT
- [x] Slide reordering — dnd-kit drag-and-drop; contentEditable cards
- [x] Dark mode — no flash on load, follows system preference
- [x] Multi-language — Hungarian, Italian, English section labels
- [x] Metadata scrub — AGL headers, ANSI codes, annotations
- [x] Duplicate detection — Jaccard similarity ≥75%, inline warnings with remove/rename
- [x] Test suite — 75 unit tests (vitest)
- [x] Error boundary — catches uncaught React errors
- [x] Toast notifications — success/error/info feedback on actions
- [x] Loading states — Clean and Export buttons show spinners
- [x] Changelog UI — "What's New" modal with release notes
- [x] CI/CD — GitHub Actions (lint, test, build)
- [x] Accessibility — ARIA roles on sortable slide list
- [x] Code quality — Prettier formatting, spellcheck deduped, clean.ts modularized
- [x] Undo/Redo — 50-snapshot history stack with keyboard shortcuts
- [x] Reset to original — one-click clear of cleaned output
- [x] Auto-save — localStorage snapshot restored on page load
- [x] Toggleable cleaning rules — 14 rules in 3 groups with settings panel
- [x] TXT export — plain text download
- [x] Auto-paste detection — onPaste handler auto-triggers
- [x] Cleaning report — post-clean banner with per-category stats
