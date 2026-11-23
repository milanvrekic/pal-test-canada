import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useSyncExternalStore } from 'react';

// The licence tracker: the day the application went in, the day the licence arrived, and the "while you wait" checklist.
// Device only, like quiz progress.
export type Tracker = { submittedOn: string | null; arrivedOn: string | null; done: Record<string, boolean> };

const KEY = 'paltest.tracker.v1';
const empty = (): Tracker => ({ submittedOn: null, arrivedOn: null, done: {} });

let state: Tracker = empty();
let loaded = false;
let loading: Promise<void> | null = null;
const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());

function load(): Promise<void> {
  loading ??= AsyncStorage.getItem(KEY)
    .then((raw) => {
      if (raw) state = { ...empty(), ...(JSON.parse(raw) as Partial<Tracker>) };
    })
    .catch(() => {})
    .finally(() => {
      loaded = true;
      emit();
    });
  return loading;
}

export function updateTracker(fn: (t: Tracker) => Tracker): void {
  state = fn(state);
  emit();
  AsyncStorage.setItem(KEY, JSON.stringify(state)).catch(() => {});
}

export function resetTracker(): void {
  state = empty();
  emit();
  AsyncStorage.removeItem(KEY).catch(() => {});
}

const subscribe = (l: () => void) => {
  listeners.add(l);
  return () => listeners.delete(l);
};

export function useTracker(): { tracker: Tracker; loaded: boolean } {
  const tracker = useSyncExternalStore(subscribe, () => state, () => state);
  const isLoaded = useSyncExternalStore(subscribe, () => loaded, () => false);
  useEffect(() => {
    void load();
  }, []);
  return { tracker, loaded: isLoaded };
}
