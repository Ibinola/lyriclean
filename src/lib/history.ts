import { useCallback, useRef, useState } from "react";
import type { DuplicateGroup } from "./detectDuplicates";

export interface Snapshot {
  rawLyrics: string;
  cleanedLyrics: string;
  displayedLyrics: string;
  linesPerBreak: number;
  foundSections: string[];
  duplicates: DuplicateGroup[];
}

const MAX_HISTORY = 50;
const AUTOSAVE_KEY = "lyriclean:autosave";

interface UseHistoryReturn {
  push: (s: Snapshot) => void;
  undo: () => Snapshot | null;
  redo: () => Snapshot | null;
  canUndo: boolean;
  canRedo: boolean;
  saveToDisk: (s: Snapshot) => void;
  loadFromDisk: () => Snapshot | null;
  clearDisk: () => void;
}

export function useHistory(): UseHistoryReturn {
  const [snapshots, setSnapshots] = useState<Snapshot[]>([]);
  const indexRef = useRef(-1);

  const push = useCallback((s: Snapshot) => {
    setSnapshots((prev) => {
      const trimmed = prev.slice(0, indexRef.current + 1);
      trimmed.push(s);
      if (trimmed.length > MAX_HISTORY) trimmed.shift();
      indexRef.current = trimmed.length - 1;
      return trimmed;
    });
  }, []);

  const undo = useCallback((): Snapshot | null => {
    const newIdx = indexRef.current - 1;
    if (newIdx < 0) return null;
    indexRef.current = newIdx;
    return snapshots[newIdx] || null;
  }, [snapshots]);

  const redo = useCallback((): Snapshot | null => {
    const newIdx = indexRef.current + 1;
    if (newIdx >= snapshots.length) return null;
    indexRef.current = newIdx;
    return snapshots[newIdx] || null;
  }, [snapshots]);

  const canUndo = snapshots.length > 0 && indexRef.current > 0;
  const canRedo = snapshots.length > 0 && indexRef.current < snapshots.length - 1;

  const saveToDisk = useCallback((s: Snapshot) => {
    try {
      localStorage.setItem(AUTOSAVE_KEY, JSON.stringify(s));
    } catch {}
  }, []);

  const loadFromDisk = useCallback((): Snapshot | null => {
    try {
      const raw = localStorage.getItem(AUTOSAVE_KEY);
      if (!raw) return null;
      return JSON.parse(raw) as Snapshot;
    } catch {
      return null;
    }
  }, []);

  const clearDisk = useCallback(() => {
    try {
      localStorage.removeItem(AUTOSAVE_KEY);
    } catch {}
  }, []);

  return {
    push,
    undo,
    redo,
    canUndo,
    canRedo,
    saveToDisk,
    loadFromDisk,
    clearDisk,
  };
}
