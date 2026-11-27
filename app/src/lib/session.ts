import AsyncStorage from '@react-native-async-storage/async-storage';

import type { Course, Question } from '@/features/quiz/engine';

import { contentVersion } from './content';

// An exam or mock in progress, saved after every answer so it can be picked up again if the app or the tab is closed
// part-way through 50 questions. Device only, like the rest of the progress. One slot: the latest unfinished sitting.
export type SavedSession = {
  /** The content the questions came from; a saved sitting is dropped when the question bank has changed. */
  version: string;
  course: Course;
  mode: 'exam' | 'mock';
  /** The questions in order, with their options already shuffled. */
  set: Question[];
  /** The pick for each question answered so far. */
  picks: number[];
  /** Mock only: time left on the clock when it was saved. The clock pauses while the sitting is closed. */
  remainingMs: number | null;
  savedOn: string;
};

const KEY = 'paltest.session.v1';

export async function loadSession(course: Course, mode: 'exam' | 'mock'): Promise<SavedSession | null> {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    if (!raw) return null;
    const s = JSON.parse(raw) as SavedSession;
    const usable =
      s.version === contentVersion &&
      s.course === course &&
      s.mode === mode &&
      Array.isArray(s.set) &&
      Array.isArray(s.picks) &&
      s.picks.length > 0 &&
      s.picks.length < s.set.length &&
      (s.remainingMs === null || s.remainingMs > 0);
    return usable ? s : null;
  } catch {
    return null;
  }
}

export function saveSession(s: Omit<SavedSession, 'version'>): void {
  AsyncStorage.setItem(KEY, JSON.stringify({ ...s, version: contentVersion })).catch(() => {});
}

export function clearSession(): void {
  AsyncStorage.removeItem(KEY).catch(() => {});
}
