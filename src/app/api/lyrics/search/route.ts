import { NextRequest, NextResponse } from "next/server";

async function searchGenius(query: string) {
  const apiKey = process.env.GENIUS_API_KEY;
  if (!apiKey) return [];

  const res = await fetch(
    `https://api.genius.com/search?q=${encodeURIComponent(query)}`,
    { headers: { Authorization: `Bearer ${apiKey}` } },
  );

  if (!res.ok || res.status === 429) return [];

  const data = await res.json();
  const hits = data.response?.hits || [];

  return hits.slice(0, 6).map((hit: any) => ({
    id: `genius-${hit.result.id}`,
    title: hit.result.title,
    artist: hit.result.primary_artist.name,
    albumArt: hit.result.song_art_image_thumbnail_url,
    url: hit.result.url,
    source: "genius" as const,
  }));
}

async function searchLRCLIB(query: string) {
  const res = await fetch(
    `https://lrclib.net/api/search?q=${encodeURIComponent(query)}`,
    { headers: { "User-Agent": "lyriclean/1.0" } },
  );

  if (!res.ok) return [];

  try {
    const results = await res.json();
    if (!Array.isArray(results)) return [];

    return results.slice(0, 6).map((r: any) => ({
      id: `lrclib-${r.id}`,
      title: r.trackName,
      artist: r.artistName,
      albumArt: null,
      url: "",
      source: "lrclib" as const,
    }));
  } catch {
    return [];
  }
}

export async function POST(request: NextRequest) {
  const { song } = await request.json();

  if (!song) {
    return NextResponse.json({ error: "Song title is required" }, { status: 400 });
  }

  const [geniusResults, lrclibResults] = await Promise.allSettled([
    searchGenius(song.trim()),
    searchLRCLIB(song.trim()),
  ]);

  const results = [
    ...(geniusResults.status === "fulfilled" ? geniusResults.value : []),
    ...(lrclibResults.status === "fulfilled" ? lrclibResults.value : []),
  ];

  return NextResponse.json({ results });
}
