"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type RecognitionState = "idle" | "listening" | "unsupported";

export interface LiveTranscription {
  supported: boolean;
  state: RecognitionState;
  interim: string;
  committed: string;
  error: string | null;
  start: () => void;
  stop: () => void;
}

interface Recognition {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onresult: (event: {
    resultIndex: number;
    results: ArrayLike<{ isFinal: boolean; 0: { transcript: string } }>;
  }) => void;
  onerror: (event: { error: string }) => void;
  onend: () => void;
}

type RecognitionCtor = new () => Recognition;

function getRecognitionCtor(): RecognitionCtor | null {
  if (typeof window === "undefined") return null;
  const w = window as unknown as Record<string, unknown>;
  return (w.SpeechRecognition ?? w.webkitSpeechRecognition) as RecognitionCtor | undefined ?? null;
}

export function useLiveTranscription(onLine: (line: string) => void): LiveTranscription {
  const [state, setState] = useState<RecognitionState>("idle");
  const [supported, setSupported] = useState(false);
  const [interim, setInterim] = useState("");
  const [committed, setCommitted] = useState("");
  const [error, setError] = useState<string | null>(null);
  const recRef = useRef<Recognition | null>(null);
  const shouldListenRef = useRef(false);
  const committedLinesRef = useRef<string[]>([]);
  const onLineRef = useRef(onLine);
  onLineRef.current = onLine;

  useEffect(() => {
    const Ctor = getRecognitionCtor();
    if (!Ctor) {
      setSupported(false);
      setState("unsupported");
      return;
    }
    setSupported(true);

    const rec = new Ctor();
    rec.continuous = true;
    rec.interimResults = true;
    rec.lang = "en-US";

    rec.onresult = (event) => {
      let interimText = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) {
          const line = result[0].transcript.trim();
          if (line) {
            committedLinesRef.current = [...committedLinesRef.current, line];
            setCommitted(committedLinesRef.current.join("\n"));
            onLineRef.current(line);
          }
        } else {
          interimText += result[0].transcript;
        }
      }
      setInterim(interimText.trim());
    };

    rec.onerror = (event) => {
      if (event.error === "not-allowed" || event.error === "service-not-allowed") {
        shouldListenRef.current = false;
        setState("idle");
        setError("Microphone permission denied");
      } else if (event.error === "network") {
        setError("Speech service unavailable (network)");
      }
    };

    rec.onend = () => {
      if (shouldListenRef.current) {
        try {
          rec.start();
        } catch {
          // ignore
        }
      } else {
        setState("idle");
        setInterim("");
      }
    };

    recRef.current = rec;
    return () => {
      shouldListenRef.current = false;
      try {
        rec.abort();
      } catch {
        // ignore
      }
    };
  }, []);

  const start = useCallback(() => {
    const rec = recRef.current;
    if (!rec) return;
    committedLinesRef.current = [];
    setCommitted("");
    setError(null);
    shouldListenRef.current = true;
    try {
      rec.start();
      setState("listening");
    } catch {
      // already started or unavailable
    }
  }, []);

  const stop = useCallback(() => {
    shouldListenRef.current = false;
    if (interim.trim()) {
      const line = interim.trim();
      committedLinesRef.current = [...committedLinesRef.current, line];
      onLineRef.current(line);
      setCommitted(committedLinesRef.current.join("\n"));
    }
    setInterim("");
    setState("idle");
    const rec = recRef.current;
    if (rec) {
      try {
        rec.stop();
      } catch {
        // ignore
      }
    }
  }, [interim]);

  return { supported, state, interim, committed, error, start, stop };
}
