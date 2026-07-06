# lyriclean

**Clean lyrics. Clear worship. Open source.**

Paste raw lyrics → get a clean, structured version ready for EasyWorship and other projection software. Strips fillers (`x2`, `(Repeat)`, `(Refrain)`, emoji, numbering), normalizes section headers, and splits lyrics into slides.

Built for church media teams who get song lyrics late and need them projection-ready in seconds.

## Tech Stack

- [Next.js 15](https://nextjs.org) (App Router)
- [TypeScript](https://typescriptlang.org)
- [Tailwind CSS v4](https://tailwindcss.com)
- [shadcn/ui](https://ui.shadcn.com)

## Quick Start

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Deploy

**Vercel** (recommended — free):

```bash
npm i -g vercel
vercel
```

Or connect your GitHub repo at [vercel.com/new](https://vercel.com/new) — it detects Next.js automatically.

## Features

- **Paste & Clean** — WhatsApp lyrics → cleaned output
- **Filler Removal** — strips `x2`, `(Repeat)`, `(Refrain)`, emoji, numbering, bullets
- **Section Detection** — normalizes `Verse 1:`, `[Chorus]`, `Refrain:` into clean headers
- **Lines per Slide** — splits lyrics into groups for EasyWorship slide breaks
- **Search & Replace** — batch-fix repeated typos across the whole song
- **One-Click Copy** — copy plain text, paste directly into projection software

## License

MIT — free forever.
