// The website has no tracker reminders: they are local notifications in the iOS and Android apps (reminders.ts).
export const remindersSupported = false;

export type ReminderResult = { ids: string[]; days: number[] } | 'denied' | 'past';

export async function scheduleWaitReminders(_submittedOn: string, _typicalDays: number | null): Promise<ReminderResult> {
  return 'denied';
}

export async function cancelWaitReminders(_ids: readonly string[]): Promise<void> {}
