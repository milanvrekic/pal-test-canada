import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useSyncExternalStore } from 'react';

import { type Progress, emptyProgress } from '@/features/quiz/engine';

// Progress lives on the device only. Browser storage on web, device storage on mobile.
const KEY = 'paltest.progress.v1';

let state: Progress = emptyProgress();
let loaded = false;
let loading: Promise<void> | null = null;
const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());

function load(): Promise<void> {
  loading ??= AsyncStorage.getItem(KEY)
    .then((raw) => {
      if (raw) {
        const parsed = JSON.parse(raw) as Partial<Progress>;
        state = { answers: parsed.answers ?? {}, exams: parsed.exams ?? [] };
      }
    })
    .catch(() => {
      // Storage unavailable (private browsing, quota): keep working in memory.
    })
    .finally(() => {
      loaded = true;
      emit();
    });
  return loading;
}

export function updateProgress(fn: (p: Progress) => Progress): void {
  state = fn(state);
  emit();
  AsyncStorage.setItem(KEY, JSON.stringify(state)).catch(() => {});
}

export function resetProgress(): void {
  state = emptyProgress();
  emit();
  AsyncStorage.removeItem(KEY).catch(() => {});
}

const subscribe = (l: () => void) => {
  listeners.add(l);
  return () => listeners.delete(l);
};
const snapshot = () => state;
const loadedSnapshot = () => loaded;
const serverLoaded = () => false;

export function useProgress(): { progress: Progress; loaded: boolean } {
  const progress = useSyncExternalStore(subscribe, snapshot, snapshot);
  const isLoaded = useSyncExternalStore(subscribe, loadedSnapshot, serverLoaded);
  useEffect(() => {
    void load();
  }, []);
  return { progress, loaded: isLoaded };
}
