import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // AudD standard endpoint cap

export async function POST(request: NextRequest) {
  const token = process.env.AUDD_API_TOKEN;
  if (!token) {
    return NextResponse.json(
      { error: "Song identification is not configured (missing AUDD_API_TOKEN)" },
      { status: 503 },
    );
  }

  const form = await request.formData();
  const file = form.get("audio");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "No audio file received" }, { status: 400 });
  }
  if (file.size > MAX_FILE_SIZE) {
    return NextResponse.json({ error: "Audio clip too large (max 10MB)" }, { status: 400 });
  }

  const body = new FormData();
  body.append("api_token", token);
  body.append("file", file, file.name || "clip.webm");

  let data: any;
  try {
    const res = await fetch("https://api.audd.io/", {
      method: "POST",
      body,
      signal: AbortSignal.timeout(15000),
    });
    data = await res.json();
  } catch {
    return NextResponse.json({ error: "Recognition service unreachable" }, { status: 502 });
  }

  if (data.status === "success" && data.result) {
    return NextResponse.json({
      title: data.result.title,
      artist: data.result.artist,
      album: data.result.album ?? null,
      songLink: data.result.song_link ?? null,
    });
  }

  if (data.status === "success" && !data.result) {
    return NextResponse.json({ error: "No matching song found" }, { status: 404 });
  }

  const code = data.error?.error_code ?? "unknown";
  return NextResponse.json({ error: `Recognition error (${code})` }, { status: 502 });
}
