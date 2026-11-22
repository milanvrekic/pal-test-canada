// One place for analytics. Three events only, no user profiles, no accounts.
// The provider is not chosen yet: until it is, events are logged in development and dropped in production.
export type AnalyticsEvent =
  | { name: 'session_start' }
  | { name: 'test_completed'; course: string; mode: string; correct: number; total: number }
  | { name: 'handoff_click'; destination: string; placement: string };

export function track(event: AnalyticsEvent): void {
  if (__DEV__) console.log('[analytics]', event);
}
