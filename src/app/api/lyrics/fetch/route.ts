import { NextRequest, NextResponse } from "next/server";

async function fetchFromGenius(url: string) {
  const pageRes = await fetch(url, {
    headers: { "User-Agent": "lyriclean/1.0" },
    signal: AbortSignal.timeout(8000),
  });

  if (!pageRes.ok) return null;

  const html = await pageRes.text();
  const { load } = await import("cheerio");
  const $ = load(html);

  const lyricsContainers = $('[data-lyrics-container="true"]');
  if (lyricsContainers.length === 0) return null;

  let lyrics = "";
  lyricsContainers.each((_, el) => {
    $(el).find("br").replaceWith("\n");
    $(el)
      .find("i")
      .each((__, iEl) => {
        $(iEl).replaceWith($(iEl).text());
      });
    lyrics += $(el).text() + "\n";
  });

  lyrics = lyrics.replace(/\n{3,}/g, "\n\n").trim();
  return lyrics || null;
}

async function fetchFromLRCLIB(title: string, artist: string) {
  const url = `https://lrclib.net/api/get?track_name=${encodeURIComponent(title)}&artist_name=${encodeURIComponent(artist)}`;
  const res = await fetch(url, {
    headers: { "User-Agent": "lyriclean/1.0" },
    signal: AbortSignal.timeout(5000),
  });

  if (!res.ok) return null;

  const data = await res.json();
  const lyrics = (data.plainLyrics || "").trim();
  return lyrics || null;
}

async function fetchFromAfricanGospelLyrics(title: string) {
  const { load } = await import("cheerio");

  // Search the site with the song title
  const searchUrl = `https://africangospellyrics.com/?s=${encodeURIComponent(title)}`;
  const searchRes = await fetch(searchUrl, {
    headers: { "User-Agent": "lyriclean/1.0" },
    signal: AbortSignal.timeout(8000),
  });

  if (!searchRes.ok) return null;

  const searchHtml = await searchRes.text();
  const $ = load(searchHtml);

  const resultLink = $("h2 a, h3 a, .entry-title a").first().attr("href");
  if (!resultLink) return null;

  // Fetch the post page
  const postRes = await fetch(resultLink, {
    headers: { "User-Agent": "lyriclean/1.0" },
    signal: AbortSignal.timeout(8000),
  });

  if (!postRes.ok) return null;

  const postHtml = await postRes.text();
  const $$ = load(postHtml);

  const contentSelectors = [".entry-content", ".post-content", ".hentry", "article", ".entry"];

  let content = "";
  for (const selector of contentSelectors) {
    const el = $$(selector).first();
    if (el.length) {
      content = el.text();
      break;
    }
  }

  if (!content) return null;

  // Extract lyrics — they typically come before share/subscribe sections
  // Split on common post-ending markers
  const markers = [
    "Discover more from African Gospel Lyrics",
    "Share the Lyrics",
    "Share on Facebook",
    "Like Loading...",
    "Leave a Comment",
  ];

  for (const marker of markers) {
    const idx = content.indexOf(marker);
    if (idx !== -1) {
      content = content.slice(0, idx);
    }
  }

  content = content.replace(/\n{3,}/g, "\n\n").trim();

  return content || null;
}

export async function POST(request: NextRequest) {
  const { url, title, artist } = await request.json();

  if (!url && (!title || !artist)) {
    return NextResponse.json({ error: "URL or title+artist required" }, { status: 400 });
  }

  let lyrics: string | null = null;
  let source = "";

  if (url) {
    try {
      lyrics = await fetchFromGenius(url);
    } catch {}
    if (lyrics) source = "genius";
  }

  if (!lyrics && title && artist) {
    try {
      lyrics = await fetchFromLRCLIB(title, artist);
    } catch {}
    if (lyrics) source = "lrclib";
  }

  if (!lyrics && title) {
    try {
      lyrics = await fetchFromAfricanGospelLyrics(title);
    } catch {}
    if (lyrics) source = "agl";
  }

  if (!lyrics) {
    return NextResponse.json({ error: "Could not fetch lyrics from any source" }, { status: 500 });
  }

  return NextResponse.json({ lyrics, title: title || "", url: url || "", source });
}
