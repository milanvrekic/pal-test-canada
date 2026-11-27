import { Platform } from 'react-native';

// One place for analytics. Three events only, no user profiles, no accounts, no device or install IDs.
// Events go to the Moment Engine (10ten-command: netlify/functions/pt-event.mts), which keeps one anonymous tally per
// event under its own keys, apart from the paid apps' click, install and revenue data.
export type AnalyticsEvent =
  | { name: 'session_start' }
  | { name: 'test_completed'; course: string; mode: string; correct: number; total: number }
  | { name: 'handoff_click'; destination: string; placement: string };

const ENDPOINT = 'https://command.10tenstudio.com/ev/paltest';
const os = Platform.OS === 'ios' || Platform.OS === 'android' ? Platform.OS : 'web';

export type WaitReport = { province: string | null; days: number; method: 'online' | 'mail' | null; licence: 'pal' | 'rpal' | null };

/**
 * A wait time the person chose to add to the reported numbers (the tracker's "Add my wait" button): days, province,
 * how they applied and the licence type. Nothing else, and never sent without that tap. Resolves to whether it arrived.
 */
export async function sendWaitReport(report: WaitReport): Promise<boolean> {
  if (__DEV__) {
    console.log('[wait report]', report);
    return true;
  }
  try {
    const res = await fetch(ENDPOINT, { method: 'POST', headers: { 'content-type': 'text/plain' }, body: JSON.stringify({ name: 'wait_report', os, ...report }) });
    return res.ok;
  } catch {
    return false;
  }
}

export function track(event: AnalyticsEvent): void {
  if (__DEV__) {
    console.log('[analytics]', event);
    return;
  }
  // Nothing to send while the website is pre-rendered at build time.
  if (typeof fetch !== 'function' || (Platform.OS === 'web' && typeof window === 'undefined')) return;
  try {
    // text/plain keeps the browser from sending a CORS preflight; keepalive lets a tap that leaves the page still count.
    void fetch(ENDPOINT, {
      method: 'POST',
      headers: { 'content-type': 'text/plain' },
      body: JSON.stringify({ ...event, os }),
      keepalive: true,
    }).catch(() => {});
  } catch {
    // Analytics must never break the app.
  }
}
