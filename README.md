# lyriclean

**Clean lyrics. Clear worship. Open source.**

Turn raw song lyrics into presentation-ready slides in seconds. Built for worship teams who want to spend less time formatting and more time leading.

[lyriclean.vercel.app](https://lyriclean.vercel.app) → Paste → Clean → Export

## Usage

- **`/`** — Landing page with live demo of the cleaning pipeline
- **`/tool`** — The actual LyriClean tool: paste, clean, reorder, export

## Tech Stack

- [Next.js 15](https://nextjs.org) (App Router + server components)
- [TypeScript](https://typescriptlang.org)
- [Tailwind CSS v4](https://tailwindcss.com)
- [shadcn/ui](https://ui.shadcn.com)

## Quick Start

```bash
npm install
npm run dev        # → http://localhost:3000
npm run test       # 75+ tests
npm run build      # typecheck + lint + compile
```

## Features

| Feature | Description |
|---|---|
| **Smart Section Detection** | Automatically identifies verses, choruses, bridges, and more |
| **Spellcheck for Worship** | Built-in correction map catches common worship lyric typos |
| **Filler Line Removal** | Strips instructions, voice annotations, and meta-comments |
| **Duplicate Detection** | Finds nearly-identical slides and lets you remove or rename them |
| **Slide Reordering** | Drag and drop to reorder sections |
| **Export Anywhere** | EasyWorship XML, ProPresenter text, or PowerPoint |
| **Lyrics Lookup** | Search Genius + LRCLIB and auto-fill lyrics |
| **Lines per Slide** | Split lyrics into groups for slide breaks |
| **Search & Replace** | Batch-fix repeated typos |

## Deploy

**Vercel** (recommended — free):

```bash
npm i -g vercel
vercel
```

Or connect your GitHub repo at [vercel.com/new](https://vercel.com/new).

## License

MIT — free forever.
