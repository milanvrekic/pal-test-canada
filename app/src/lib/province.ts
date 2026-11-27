import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useSyncExternalStore } from 'react';

import { PROVINCES } from '@/features/wait/stats';

// The province the person lives in, chosen once and remembered on this device only. It tailors wait times, course
// listings, next steps and which of our other apps are suggested. Never sent anywhere on its own.
const KEY = 'paltest.province.v1';

let state: string | null = null;
let loading: Promise<void> | null = null;
const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());

function load(): Promise<void> {
  loading ??= AsyncStorage.getItem(KEY)
    .then((raw) => {
      if (raw && PROVINCES[raw]) {
        state = raw;
        emit();
      }
    })
    .catch(() => {});
  return loading;
}

export function setProvince(code: string | null): void {
  state = code && PROVINCES[code] ? code : null;
  emit();
  (state ? AsyncStorage.setItem(KEY, state) : AsyncStorage.removeItem(KEY)).catch(() => {});
}

const subscribe = (l: () => void) => {
  listeners.add(l);
  return () => listeners.delete(l);
};

/** The chosen province code (BC, ON, ...), or null until one is picked. Always null while the site is pre-rendered. */
export function useProvince(): string | null {
  const province = useSyncExternalStore(subscribe, () => state, () => null);
  useEffect(() => {
    void load();
  }, []);
  return province;
}
