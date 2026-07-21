import Link from "next/link";

const featureIcons = {
  sections: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <line x1="3" y1="9" x2="21" y2="9" />
      <line x1="9" y1="3" x2="9" y2="21" />
    </svg>
  ),
  spellcheck: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      <polyline points="9 12 11 14 15 10" />
    </svg>
  ),
  filler: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 6h18" />
      <path d="M3 12h18" />
      <path d="M3 18h12" />
    </svg>
  ),
  duplicate: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="8" y="8" width="13" height="13" rx="2" />
      <path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2" />
    </svg>
  ),
  reorder: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="8" y1="6" x2="21" y2="6" />
      <line x1="8" y1="12" x2="21" y2="12" />
      <line x1="8" y1="18" x2="21" y2="18" />
      <line x1="3" y1="6" x2="3.01" y2="6" />
      <line x1="3" y1="12" x2="3.01" y2="12" />
      <line x1="3" y1="18" x2="3.01" y2="18" />
    </svg>
  ),
  export: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" y1="15" x2="12" y2="3" />
    </svg>
  ),
};

const features = [
  {
    title: "Smart Section Detection",
    desc: "Automatically identifies verses, choruses, bridges, and more. No more manually tagging each slide.",
    icon: featureIcons.sections,
  },
  {
    title: "Spellcheck for Worship",
    desc: "Built-in correction map catches common worship lyric typos before they hit the screen.",
    icon: featureIcons.spellcheck,
  },
  {
    title: "Filler Line Removal",
    desc: "Strips instructions, voice annotations, and meta-comments so only the congregation sees lyrics.",
    icon: featureIcons.filler,
  },
  {
    title: "Duplicate Detection",
    desc: "Finds nearly-identical slides and lets you remove or rename them in one click.",
    icon: featureIcons.duplicate,
  },
  {
    title: "Slide Reordering",
    desc: "Drag and drop to reorder sections. Perfect for tweaking the song flow before Sunday.",
    icon: featureIcons.reorder,
  },
  {
    title: "Export Anywhere",
    desc: "Export to EasyWorship XML, ProPresenter text, or PowerPoint. Ready for your presentation software.",
    icon: featureIcons.export,
  },
];

const steps = [
  {
    num: "01",
    title: "Paste",
    desc: "Paste raw lyrics from WhatsApp, email, or anywhere. LyriClean handles the mess.",
  },
  {
    num: "02",
    title: "Clean",
    desc: "One click strips filler lines, fixes typos, detects duplicates, and structures sections.",
  },
  {
    num: "03",
    title: "Export",
    desc: "Download for EasyWorship, ProPresenter, or PowerPoint. Presentation-ready in seconds.",
  },
];

const messyInput = `Verse 1
Amazing grace, how sweet the sound
That saved a wretch like meee
I once was lost but now am found
Was blind but now I see

Lead: Amazing grace
BGV: harmony

(Repeat x2)

Chorus
Amazing grace how sweet the sound
My chains are gone ive been set free

[Interlude]

Verse 1
Amazing grace how sweet the sound
That saved a wretch like me
I once was lost but now am found
Was blind but now I see

Tag:
My chains are gone
My chains are gone`;

const cleanOutput = `Verse 1
Amazing grace, how sweet the sound
That saved a wretch like me
I once was lost but now am found
Was blind but now I see

Chorus
Amazing grace how sweet the sound
My chains are gone I've been set free

Verse 2
Amazing grace how sweet the sound
That saved a wretch like me
I once was lost but now am found
Was blind but now I see

Tag
My chains are gone
My chains are gone`;

const rawParagraphs = messyInput.split('\n\n');

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#f5f0eb]">
      <style>{`
        @keyframes waitState {
          0%, 8% { opacity: 0; }
          10% { opacity: 1; }
          28% { opacity: 1; }
          32% { opacity: 0; }
          100% { opacity: 0; }
        }
        @keyframes cleanState {
          0%, 32% { opacity: 0; transform: translateY(6px); }
          36% { opacity: 1; transform: translateY(0); }
          52% { opacity: 1; }
          56% { opacity: 0; transform: translateY(-3px); }
          100% { opacity: 0; }
        }
        @keyframes doneState {
          0%, 56% { opacity: 0; transform: translateY(6px); }
          60% { opacity: 1; transform: translateY(0); }
          88% { opacity: 1; }
          95% { opacity: 0; transform: translateY(-3px); }
          100% { opacity: 0; }
        }
        @keyframes dotBounce {
          0%, 60%, 100% { transform: translateY(0); }
          30% { transform: translateY(-4px); }
        }
        @keyframes cursorBlink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
        @keyframes paraIn {
          0% { opacity: 0; transform: translateY(4px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        .anim-para { opacity: 0; animation: paraIn 0.35s ease-out forwards; }
        .anim-waiting { animation: waitState 6s ease-in-out infinite; }
        .anim-cleaning { animation: cleanState 6s ease-in-out infinite; }
        .anim-done { animation: doneState 6s ease-in-out infinite; }
        .anim-dot { display: inline-block; animation: dotBounce 0.6s ease-in-out infinite; }
        .anim-cursor { animation: cursorBlink 1s step-end infinite; }
      `}</style>
      <header className="border-b border-black/5">
        <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link href="/" className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-lg text-white">
              &#9835;
            </span>
            <span className="text-lg font-bold text-indigo-600">lyriclean</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link
              href="/tool"
              className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-700"
            >
              Open App
            </Link>
            <a
              href="https://github.com/Ibinola/lyriclean"
              target="_blank"
              rel="noopener"
              className="rounded-lg border border-black/10 bg-white/80 px-4 py-2 text-sm font-medium text-neutral-700 transition-colors hover:bg-white"
            >
              <span className="flex items-center gap-1.5">
                <svg width="14" height="14" fill="currentColor" viewBox="0 0 16 16">
                  <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0 0 16 8c0-4.42-3.58-8-8-8z" />
                </svg>
                GitHub
              </span>
            </a>
          </div>
        </nav>
      </header>

      <main>
        {/* Hero */}
        <section className="mx-auto max-w-6xl px-6 pb-24 pt-16 sm:pt-24">
          <div className="mx-auto max-w-2xl text-center">
            <h1 className="font-[family-name:var(--font-newsreader)] text-5xl leading-tight tracking-tight text-neutral-900 sm:text-6xl">
              Clean Lyrics.
              <br />
              <span className="text-indigo-600">Clear Worship.</span>
            </h1>
            <p className="mt-6 text-lg leading-relaxed text-neutral-600">
              Turn raw song lyrics into presentation-ready slides in seconds. Built for worship
              teams who want to spend less time formatting and more time leading.
            </p>
            <div className="mt-8 flex items-center justify-center gap-4">
              <Link
                href="/tool"
                className="rounded-lg bg-indigo-600 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-indigo-700"
              >
                Open the App &rarr;
              </Link>
              <a
                href="https://github.com/Ibinola/lyriclean"
                target="_blank"
                rel="noopener"
                className="rounded-lg border border-black/10 bg-white/80 px-6 py-3 text-sm font-medium text-neutral-700 transition-colors hover:bg-white"
              >
                <span className="flex items-center gap-2">
                  <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                    <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0 0 16 8c0-4.42-3.58-8-8-8z" />
                  </svg>
                  Star on GitHub
                </span>
              </a>
            </div>
          </div>

          {/* Animated mockup */}
          <div className="mt-16 overflow-hidden rounded-2xl border border-black/10 bg-white shadow-xl shadow-black/5">
            <div className="grid grid-cols-1 divide-y divide-black/10 md:grid-cols-2 md:divide-x md:divide-y-0">
              <div className="p-6">
                <div className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-neutral-400">
                  <span className="h-2 w-2 rounded-full bg-red-400" />
                  <span className="h-2 w-2 rounded-full bg-amber-400" />
                  <span className="h-2 w-2 rounded-full bg-green-400" />
                  <span className="ml-2">Raw Lyrics</span>
                </div>
                <pre className="font-mono text-sm leading-relaxed text-neutral-600">
                  {rawParagraphs.map((p, i) => (
                    <span
                      key={i}
                      className="anim-para"
                      style={{ animationDelay: `${i * 0.25}s` }}
                    >
                      {p}{i < rawParagraphs.length - 1 ? '\n\n' : ''}
                    </span>
                  ))}
                </pre>
              </div>
              <div className="relative overflow-hidden bg-indigo-50/50 p-6">
                <div className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-indigo-500">
                  <span className="h-2 w-2 rounded-full bg-indigo-500" />
                  <span className="ml-2">Cleaned Output</span>
                </div>
                <div className="relative min-h-[14rem]">
                  <div className="invisible whitespace-pre-wrap font-mono text-sm leading-relaxed">{cleanOutput}</div>
                  <div className="anim-waiting absolute inset-0 flex items-center justify-center gap-1 font-mono text-sm text-neutral-400">
                    Paste lyrics here<span className="anim-cursor ml-0.5 inline-block h-4 w-[2px] bg-neutral-400" />
                  </div>
                  <div className="anim-cleaning absolute inset-0 flex items-center justify-center gap-0.5 font-mono text-sm text-indigo-500">
                    Cleaning
                    <span className="anim-dot" style={{ animationDelay: '0s' }}>.</span>
                    <span className="anim-dot" style={{ animationDelay: '0.15s' }}>.</span>
                    <span className="anim-dot" style={{ animationDelay: '0.3s' }}>.</span>
                  </div>
                  <div className="anim-done absolute inset-0 whitespace-pre-wrap font-mono text-sm leading-relaxed text-neutral-800">
                    {cleanOutput}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Pain point */}
        <section className="border-t border-black/5 bg-white py-20">
          <div className="mx-auto max-w-6xl px-6">
            <div className="mx-auto max-w-2xl text-center">
              <span className="inline-block rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-amber-700">
                The Problem
              </span>
              <h2 className="mt-4 font-[family-name:var(--font-newsreader)] text-3xl text-neutral-900">
                Lyrics arrive messy. You shouldn&apos;t have to clean them by hand.
              </h2>
              <p className="mt-3 text-neutral-500">
                Someone forwards a WhatsApp message. It&apos;s full of <span className="rounded bg-red-50 px-1 py-0.5 font-mono text-xs text-red-600">Lead:</span>,{" "}
                <span className="rounded bg-red-50 px-1 py-0.5 font-mono text-xs text-red-600">(Repeat x3)</span>,{" "}
                <span className="rounded bg-red-50 px-1 py-0.5 font-mono text-xs text-red-600">[Interlude]</span>, and that typo no one caught last Sunday. You spend 15 minutes turning it into something the congregation can actually sing along to.
              </p>
            </div>
            <div className="mt-10 grid gap-4 sm:grid-cols-3">
              {[
                { stat: "15+", label: "minutes saved per song" },
                { stat: "80%", label: "of filler lines stripped automatically" },
                { stat: "3", label: "clicks from paste to export" },
              ].map((item) => (
                <div key={item.stat} className="rounded-xl border border-black/5 bg-[#f5f0eb] p-6 text-center">
                  <span className="font-[family-name:var(--font-newsreader)] text-3xl font-semibold text-indigo-600">
                    {item.stat}
                  </span>
                  <p className="mt-1 text-sm text-neutral-500">{item.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* How it works */}
        <section className="py-20">
          <div className="mx-auto max-w-6xl px-6">
            <h2 className="font-[family-name:var(--font-newsreader)] text-center text-3xl text-neutral-900">
              How It Works
            </h2>
            <p className="mt-3 text-center text-neutral-500">
              Three steps from raw text to presentation-ready slides.
            </p>
            <div className="mt-12 grid gap-8 md:grid-cols-3">
              {steps.map((step, i) => (
                <div key={step.num} className="relative text-center">
                  <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-indigo-600 text-sm font-bold text-white">
                    {step.num}
                  </div>
                  {i < steps.length - 1 && (
                    <div className="absolute left-[calc(50%+28px)] top-5 hidden h-px w-[calc(100%-56px)] bg-indigo-200 md:block" />
                  )}
                  <h3 className="mt-5 text-lg font-semibold text-neutral-900">{step.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-neutral-500">{step.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="border-t border-black/5 bg-white py-20">
          <div className="mx-auto max-w-6xl px-6">
            <h2 className="font-[family-name:var(--font-newsreader)] text-center text-3xl text-neutral-900">
              Everything You Need
            </h2>
            <p className="mt-3 text-center text-neutral-500">
              A focused set of tools, built for the worship booth.
            </p>
            <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {features.map((f) => (
                <div
                  key={f.title}
                  className="group rounded-xl border border-black/5 bg-white p-6 transition-all hover:-translate-y-0.5 hover:border-indigo-200/50 hover:shadow-md"
                >
                  <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 transition-colors group-hover:bg-indigo-100">
                    {f.icon}
                  </div>
                  <h3 className="font-semibold text-neutral-900">{f.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-neutral-500">{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="bg-indigo-600 py-16">
          <div className="mx-auto max-w-2xl px-6 text-center">
            <h2 className="font-[family-name:var(--font-newsreader)] text-3xl text-white">
              Free. Open Source. Forever.
            </h2>
            <p className="mt-3 text-indigo-200">
              LyriClean is MIT-licensed and always will be. Built for worship teams, by someone who
              knows the pain.
            </p>
            <div className="mt-8 flex items-center justify-center gap-4">
              <Link
                href="/tool"
                className="rounded-lg bg-white px-6 py-3 text-sm font-medium text-indigo-600 transition-colors hover:bg-indigo-50"
              >
                Start Cleaning &rarr;
              </Link>
              <a
                href="https://github.com/Ibinola/lyriclean"
                target="_blank"
                rel="noopener"
                className="rounded-lg border border-indigo-400 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-indigo-700"
              >
                View Source
              </a>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-black/5 bg-white py-8 text-center text-sm text-neutral-400">
        <p>
          Built for worship teams, everywhere.{" "}
          <a
            href="https://github.com/Ibinola/lyriclean"
            target="_blank"
            rel="noopener"
            className="text-indigo-600 hover:underline"
          >
            Open source
          </a>{" "}
          &middot; Free forever
        </p>
      </footer>
    </div>
  );
}
