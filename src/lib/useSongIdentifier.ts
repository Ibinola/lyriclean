"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export type IdentifyState = "idle" | "recording" | "identifying";

export interface SongIdentifier {
  supported: boolean;
  state: IdentifyState;
  elapsed: number;
  error: string | null;
  start: () => void;
  stop: () => void;
}

export const CLIP_SECONDS = 12;
const MAX_CLIP_BYTES = 10 * 1024 * 1024;

function pickMimeType(): string | undefined {
  if (typeof window === "undefined") return undefined;
  const candidates = ["audio/webm;codecs=opus", "audio/webm", "audio/mp4"];
  for (const c of candidates) {
    if (typeof MediaRecorder !== "undefined" && MediaRecorder.isTypeSupported?.(c)) return c;
  }
  return undefined;
}

export function useSongIdentifier(onIdentified: (title: string, artist: string) => void): SongIdentifier {
  const [state, setState] = useState<IdentifyState>("idle");
  const [supported, setSupported] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const intervalRef = useRef<number | null>(null);
  const autoStopRef = useRef<number | null>(null);
  const onIdentifiedRef = useRef(onIdentified);
  onIdentifiedRef.current = onIdentified;

  const cleanup = useCallback(() => {
    if (intervalRef.current !== null) {
      window.clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    if (autoStopRef.current !== null) {
      window.clearTimeout(autoStopRef.current);
      autoStopRef.current = null;
    }
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    recorderRef.current = null;
    chunksRef.current = [];
  }, []);

  useEffect(() => {
    setSupported(
      typeof window !== "undefined" &&
        typeof navigator !== "undefined" &&
        Boolean(navigator.mediaDevices?.getUserMedia) &&
        typeof MediaRecorder !== "undefined",
    );
    return cleanup;
  }, [cleanup]);

  const sendClip = useCallback(
    async (blob: Blob) => {
      setState("identifying");
      setElapsed(0);
      try {
        const form = new FormData();
        form.append("audio", blob, "clip.webm");
        const res = await fetch("/api/lyrics/identify", { method: "POST", body: form });
        const data = await res.json().catch(() => ({}));
        if (res.ok && data.title) {
          onIdentifiedRef.current(data.title, data.artist ?? "");
        } else {
          setError(data.error || "Could not identify the song");
        }
      } catch {
        setError("Network error while identifying");
      } finally {
        setState("idle");
      }
    },
    [],
  );

  const stop = useCallback(() => {
    const recorder = recorderRef.current;
    cleanup();
    if (!recorder || recorder.state === "inactive") return;
    recorder.onstop = () => {
      const type = pickMimeType() || "";
      const blob = new Blob(chunksRef.current, { type });
      if (blob.size === 0 || blob.size > MAX_CLIP_BYTES) {
        setError("Recording was empty or too large");
        setState("idle");
        return;
      }
      sendClip(blob);
    };
    try {
      recorder.stop();
    } catch {
      cleanup();
      setState("idle");
    }
  }, [cleanup, sendClip]);

  const start = useCallback(async () => {
    if (state === "recording" || state === "identifying") return;
    setError(null);
    setElapsed(0);
    chunksRef.current = [];
    let stream: MediaStream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch {
      setError("Microphone access denied");
      return;
    }
    streamRef.current = stream;
    let recorder: MediaRecorder;
    try {
      recorder = new MediaRecorder(stream, pickMimeType() ? { mimeType: pickMimeType() } : undefined);
    } catch {
      setError("Recording is not supported in this browser");
      stream.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
      return;
    }
    recorderRef.current = recorder;
    recorder.ondataavailable = (e) => {
      if (e.data && e.data.size > 0) chunksRef.current.push(e.data);
    };
    recorder.start(250);
    setState("recording");
    const startedAt = Date.now();
    intervalRef.current = window.setInterval(() => {
      setElapsed(Math.min(CLIP_SECONDS, Math.floor((Date.now() - startedAt) / 1000)));
    }, 1000);
    autoStopRef.current = window.setTimeout(() => stop(), CLIP_SECONDS * 1000);
  }, [state, stop]);

  return { supported, state, elapsed, error, start, stop };
}
