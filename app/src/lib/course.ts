import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useSyncExternalStore } from 'react';

import type { Course } from '@/features/quiz/engine';

// The course the person studies (CFSC or CRFSC), remembered on this device so the app reopens on it.
const KEY = 'paltest.course.v1';

let state: Course = 'cfsc';
let loading: Promise<void> | null = null;
const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());

function load(): Promise<void> {
  loading ??= AsyncStorage.getItem(KEY)
    .then((raw) => {
      if (raw === 'cfsc' || raw === 'crfsc') {
        state = raw;
        emit();
      }
    })
    .catch(() => {});
  return loading;
}

export function setCourse(course: Course): void {
  state = course;
  emit();
  AsyncStorage.setItem(KEY, course).catch(() => {});
}

const subscribe = (l: () => void) => {
  listeners.add(l);
  return () => listeners.delete(l);
};

export function useCourse(): [Course, (c: Course) => void] {
  const course = useSyncExternalStore(subscribe, () => state, () => 'cfsc' as Course);
  useEffect(() => {
    void load();
  }, []);
  return [course, setCourse];
}
