import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

// Licence-tracker reminders on the native apps: local notifications scheduled on the device. Nothing is sent to a
// server and no push token is requested. The website has no reminders (see reminders.web.ts).
export const remindersSupported = true;

export type ReminderResult = { ids: string[]; days: number[] } | 'denied' | 'past';

const CHANNEL = 'licence-tracker';
const MINIMUM_DAY = 28;

// Show a reminder as a banner even when it arrives while the app is open.
Notifications.setNotificationHandler({
  handleNotification: async () => ({ shouldShowBanner: true, shouldShowList: true, shouldPlaySound: false, shouldSetBadge: false }),
});

/** 10:00 local time, `offset` days after the day the application was sent (YYYY-MM-DD). */
function at(submittedOn: string, offset: number): Date {
  const [y, m, d] = submittedOn.split('-').map(Number);
  return new Date(y, m - 1, d + offset, 10, 0, 0);
}

async function allowed(): Promise<boolean> {
  const ok = (p: Notifications.NotificationPermissionsStatus) =>
    p.granted || p.ios?.status === Notifications.IosAuthorizationStatus.PROVISIONAL;
  const now = await Notifications.getPermissionsAsync();
  if (ok(now)) return true;
  if (!now.canAskAgain) return false;
  return ok(await Notifications.requestPermissionsAsync());
}

/**
 * Two reminders: the day the 28-day minimum ends, and the day the typical reported wait is reached (when known and
 * later than day 28). Days already in the past are skipped. Asks for notification permission the first time.
 */
export async function scheduleWaitReminders(submittedOn: string, typicalDays: number | null): Promise<ReminderResult> {
  const plan = [
    {
      day: MINIMUM_DAY,
      title: 'Day 28 of your PAL wait',
      body: 'The 28-day minimum for new applicants is over. Watch your mail and phone for anything from the Canadian Firearms Program.',
    },
    ...(typicalDays && typicalDays > MINIMUM_DAY
      ? [
          {
            day: typicalDays,
            title: `Day ${typicalDays}: the typical PAL wait`,
            body: 'Half of the applicants who reported had heard back by now. Nothing yet? Open the tracker to see what to check.',
          },
        ]
      : []),
  ].filter((p) => at(submittedOn, p.day).getTime() > Date.now());
  if (!plan.length) return 'past';
  try {
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync(CHANNEL, { name: 'Licence tracker', importance: Notifications.AndroidImportance.DEFAULT });
    }
    if (!(await allowed())) return 'denied';
    const ids: string[] = [];
    for (const p of plan) {
      ids.push(
        await Notifications.scheduleNotificationAsync({
          content: { title: p.title, body: p.body },
          trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: at(submittedOn, p.day), channelId: CHANNEL },
        }),
      );
    }
    return { ids, days: plan.map((p) => p.day) };
  } catch {
    return 'denied';
  }
}

export async function cancelWaitReminders(ids: readonly string[]): Promise<void> {
  await Promise.all(ids.map((id) => Notifications.cancelScheduledNotificationAsync(id).catch(() => {})));
}
