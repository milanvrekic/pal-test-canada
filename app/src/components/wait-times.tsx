import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { DateField } from '@/components/date-field';
import { NextSteps } from '@/components/next-steps';
import { ProvincePicker } from '@/components/province-picker';
import { ThemedText } from '@/components/themed-text';
import { Button, Card, Notice } from '@/components/ui';
import { RadiusControl, Spacing } from '@/constants/theme';
import { addDays, today } from '@/features/quiz/engine';
import {
  MINIMUM_WAIT_DAYS,
  PROVINCES,
  type WaitRow,
  type WaitSummary,
  byMethod,
  byProvince,
  daysBetween,
  isIsoDay,
  recent,
  shareDoneBy,
  summarize,
  typical,
} from '@/features/wait/stats';
import { useTheme } from '@/hooks/use-theme';
import { sendWaitReport } from '@/lib/analytics';
import { contentBuiltAt, waitRows } from '@/lib/content';
import { useProvince } from '@/lib/province';
import { cancelWaitReminders, remindersSupported, scheduleWaitReminders } from '@/lib/reminders';
import { type Tracker as TrackerState, updateTracker, useTracker } from '@/lib/tracker';

const SCALE_DAYS = 180;

/** The province pages: every province with enough reports gets its own page. */
export function provincesWithData(): string[] {
  const rows = typical(waitRows);
  return Object.keys(PROVINCES).filter((p) => summarize(byProvince(rows, p)) !== null);
}

export function waitData(province?: string) {
  const { rows: pool, window } = recent(typical(waitRows), contentBuiltAt);
  const national = summarize(pool);
  const local = province ? summarize(byProvince(pool, province)) ?? summarize(byProvince(typical(waitRows), province)) : null;
  return {
    window,
    pool,
    national,
    local,
    online: summarize(byMethod(pool, 'online')),
    mail: summarize(byMethod(pool, 'mail')),
    complicated: waitRows.filter((r) => r.complication && r.application !== 'renewal'),
    renewals: summarize(waitRows.filter((r) => r.application === 'renewal')),
    total: waitRows.length,
    first: waitRows.reduce((m, r) => (r.date < m ? r.date : m), waitRows[0]?.date ?? ''),
    last: waitRows.reduce((m, r) => (r.date > m ? r.date : m), ''),
  };
}

/** A 0–180 day bar: the middle half of reports shaded, the median marked, and optionally "you are here". */
export function RangeBar({ s, you }: { s: WaitSummary; you?: number }) {
  const theme = useTheme();
  const pct = (d: number) => `${Math.min(100, (Math.min(d, SCALE_DAYS) / SCALE_DAYS) * 100)}%` as const;
  return (
    <View accessible accessibilityLabel={`Half of reports took between ${s.p25} and ${s.p75} days. Median ${s.median} days.`}>
      <View style={[styles.bar, { backgroundColor: theme.backgroundSelected }]}>
        <View style={[styles.band, { left: pct(s.p25), width: pct(s.p75 - s.p25), backgroundColor: theme.accent, opacity: 0.3 }]} />
        <View style={[styles.mark, { left: pct(s.median), backgroundColor: theme.accent }]} />
        <View style={[styles.min, { left: pct(MINIMUM_WAIT_DAYS), borderColor: theme.textSecondary }]} />
        {you !== undefined ? <View style={[styles.you, { left: pct(you), backgroundColor: theme.signal, borderColor: theme.backgroundElement }]} /> : null}
      </View>
      <View style={styles.axis}>
        {[0, 30, 60, 90, 120, 150, 180].map((d) => (
          <ThemedText key={d} type="small" themeColor="textSecondary" style={styles.tick}>
            {d === 180 ? '180+' : d}
          </ThemedText>
        ))}
      </View>
    </View>
  );
}

export function SummaryCard({ title, s, note, you }: { title: string; s: WaitSummary | null; note?: string; you?: number }) {
  return (
    <Card>
      <ThemedText type="eyebrow" themeColor="textSecondary">
        {title}
      </ThemedText>
      {s ? (
        <>
          <View style={styles.statRow}>
            <ThemedText type="stat">{s.median}</ThemedText>
            <View style={{ flex: 1 }}>
              <ThemedText type="bold">days, typical wait</ThemedText>
              <ThemedText type="small" themeColor="textSecondary">
                Half of reports fall between {s.p25} and {s.p75} days.
              </ThemedText>
            </View>
          </View>
          <RangeBar s={s} you={you} />
          <ThemedText type="small" themeColor="textSecondary">
            Based on {s.n} reports{note ? `. ${note}` : ''}. Dashed line: the 28-day legal minimum for new applicants.
          </ThemedText>
        </>
      ) : (
        <ThemedText type="small" themeColor="textSecondary">
          Not enough reports yet to show a typical wait.
        </ThemedText>
      )}
    </Card>
  );
}

const CHECKLIST: { id: string; text: string }[] = [
  { id: 'references', text: 'Tell your references, and your spouse or partner if you have one, that the Canadian Firearms Program may contact them.' },
  { id: 'mail', text: 'Watch your mail and phone. A missed call or letter asking for more information is a common cause of long waits.' },
  { id: 'call', text: 'Not heard back well after the typical wait? Call the Canadian Firearms Program at 1-800-731-4000.' },
  { id: 'hunting', text: 'Planning to hunt? Most provinces also need hunter education and a hunting licence. Start those now.' },
  { id: 'practise', text: 'Keep practising ACTS and PROVE so the habits stay sharp until you own a firearm.' },
];

export function Tracker({ national }: { national: WaitSummary | null }) {
  const theme = useTheme();
  const { tracker, loaded } = useTracker();
  const [draft, setDraft] = useState('');
  const [error, setError] = useState<string | null>(null);
  if (!loaded) return null;

  const day = today();
  if (tracker.arrivedOn) {
    const took = tracker.submittedOn ? daysBetween(tracker.submittedOn, tracker.arrivedOn) : null;
    return (
      <View style={{ gap: Spacing.three }}>
        <Notice tone="success">
          {took !== null ? `Your licence arrived after ${took} days. Congratulations.` : 'Your licence arrived. Congratulations.'}
        </Notice>
        <NextSteps placement="licence_arrived" title="Now you're licensed" lead="What most new licence holders do next." />
        {took !== null && took > 0 ? <ShareWait days={took} reported={!!tracker.reported} /> : null}
        <Button variant="secondary" label="Undo: my licence hasn't arrived" onPress={() => updateTracker((t) => ({ ...t, arrivedOn: null }))} />
      </View>
    );
  }

  if (!tracker.submittedOn) {
    const save = (value: string) => {
      if (!isIsoDay(value)) return setError('Pick the day you sent your application.');
      if (value > day) return setError('That date is in the future.');
      setError(null);
      updateTracker((t) => ({ ...t, submittedOn: value }));
    };
    return (
      <Card style={{ gap: Spacing.three }}>
        <ThemedText type="heading">Track your application</ThemedText>
        <ThemedText type="small" themeColor="textSecondary">
          Pick the day you sent your application. The date stays on this device.
        </ThemedText>
        <DateField
          value={draft}
          onChange={(v) => {
            setDraft(v);
            setError(null);
          }}
          max={day}
          label="Date you sent your application"
          shortLabel="Date sent"
          invalid={!!error}
        />
        {error ? (
          <ThemedText type="small" themeColor="danger">
            {error}
          </ThemedText>
        ) : null}
        <Button variant="signal" label="Start tracking" onPress={() => save(draft.trim())} />
        <Button variant="secondary" label="I sent it today" onPress={() => save(day)} />
        <Button variant="secondary" label="Not sent yet? Application checklist" href="/apply" />
      </Card>
    );
  }

  const elapsed = Math.max(0, daysBetween(tracker.submittedOn, day));
  const minimumEnds = addDays(tracker.submittedOn, MINIMUM_WAIT_DAYS);
  const share = national ? Math.round(shareDoneBy(recent(typical(waitRows), contentBuiltAt).rows, elapsed) * 100) : null;
  return (
    <View style={{ gap: Spacing.three }}>
      <Card style={{ gap: Spacing.three }}>
        <ThemedText type="eyebrow" themeColor="signal">
          Your application
        </ThemedText>
        <View style={styles.statRow}>
          <ThemedText type="stat">{elapsed}</ThemedText>
          <ThemedText type="bold" style={{ flex: 1 }}>
            {elapsed === 1 ? 'day' : 'days'} since you applied
          </ThemedText>
        </View>
        <ThemedText type="small" themeColor="textSecondary">
          Sent {tracker.submittedOn}.{' '}
          {day < minimumEnds
            ? `The 28-day minimum for new applicants ends on ${minimumEnds}.`
            : `The 28-day minimum for new applicants ended on ${minimumEnds}.`}
        </ThemedText>
        {national ? <RangeBar s={national} you={elapsed} /> : null}
        {share !== null ? (
          <ThemedText type="small">
            {share === 0
              ? 'No one who reported had their licence this early. Hang in there.'
              : `${share}% of reported first-time applicants had heard back by day ${elapsed}.`}
          </ThemedText>
        ) : null}
        <Button
          variant="signal"
          label="My licence arrived"
          onPress={() => {
            stopReminders(tracker);
            updateTracker((t) => ({ ...t, arrivedOn: day, reminders: null }));
          }}
        />
        {remindersSupported ? <Reminders tracker={tracker} typicalDays={national?.median ?? null} /> : null}
        <Pressable
          accessibilityRole="button"
          onPress={() => {
            stopReminders(tracker);
            updateTracker((t) => ({ ...t, submittedOn: null, reminders: null }));
          }}
          style={styles.linkBtn}>
          <ThemedText type="small" themeColor="textSecondary" style={{ textDecorationLine: 'underline' }}>
            Change the date
          </ThemedText>
        </Pressable>
      </Card>

      <Card style={{ gap: Spacing.two }}>
        <ThemedText type="heading">While you wait</ThemedText>
        {CHECKLIST.map((c) => {
          const done = !!tracker.done[c.id];
          return (
            <Pressable
              key={c.id}
              accessibilityRole="checkbox"
              accessibilityState={{ checked: done }}
              onPress={() => updateTracker((t) => ({ ...t, done: { ...t.done, [c.id]: !done } }))}
              style={styles.check}>
              <View style={[styles.box, { borderColor: done ? theme.accent : theme.border, backgroundColor: done ? theme.accent : 'transparent' }]}>
                {done ? (
                  <ThemedText type="smallBold" themeColor="onAccent" style={{ lineHeight: 18 }}>
                    ✓
                  </ThemedText>
                ) : null}
              </View>
              <ThemedText type="small" style={{ flex: 1 }} themeColor={done ? 'textSecondary' : 'text'}>
                {c.text}
              </ThemedText>
            </Pressable>
          );
        })}
      </Card>
    </View>
  );
}

const stopReminders = (t: TrackerState) => {
  if (t.reminders?.ids.length) void cancelWaitReminders(t.reminders.ids);
};

/** Native apps: a reminder on day 28 and on the day the typical reported wait is reached. Local notifications only. */
function Reminders({ tracker, typicalDays }: { tracker: TrackerState; typicalDays: number | null }) {
  const [note, setNote] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const on = tracker.reminders?.days.length ? tracker.reminders : null;
  if (on) {
    return (
      <View style={{ gap: Spacing.one }}>
        <ThemedText type="small" themeColor="textSecondary">
          Reminders are on for day {on.days.join(' and day ')}.
        </ThemedText>
        <Pressable
          accessibilityRole="button"
          onPress={() => {
            stopReminders(tracker);
            updateTracker((t) => ({ ...t, reminders: null }));
          }}
          style={styles.linkBtn}>
          <ThemedText type="small" themeColor="textSecondary" style={{ textDecorationLine: 'underline' }}>
            Turn reminders off
          </ThemedText>
        </Pressable>
      </View>
    );
  }
  const later = typicalDays && typicalDays > MINIMUM_WAIT_DAYS ? typicalDays : null;
  const turnOn = async () => {
    if (!tracker.submittedOn || busy) return;
    setBusy(true);
    const result = await scheduleWaitReminders(tracker.submittedOn, later);
    setBusy(false);
    if (result === 'denied') return setNote('Notifications are off for PAL Test Canada. Turn them on in your phone\'s Settings, then try again.');
    if (result === 'past') return setNote('Those days have already passed for this application.');
    setNote(null);
    updateTracker((t) => ({ ...t, reminders: result }));
  };
  return (
    <View style={{ gap: Spacing.one }}>
      <Button variant="secondary" label={`Remind me on day ${MINIMUM_WAIT_DAYS}${later ? ` and day ${later}` : ''}`} onPress={() => void turnOn()} disabled={busy} />
      {note ? (
        <ThemedText type="small" themeColor="textSecondary">
          {note}
        </ThemedText>
      ) : null}
    </View>
  );
}

const METHODS = [
  { id: 'online', label: 'Online' },
  { id: 'mail', label: 'By mail' },
] as const;
const LICENCES = [
  { id: 'pal', label: 'PAL' },
  { id: 'rpal', label: 'RPAL' },
] as const;

/**
 * After "My licence arrived": offer to add this wait to the reported numbers. Sends the day count, the province and the
 * two answers below, only when the button is tapped, with no name or ID. Reports are checked before they are added.
 */
function ShareWait({ days, reported }: { days: number; reported: boolean }) {
  const theme = useTheme();
  const province = useProvince();
  const [method, setMethod] = useState<'online' | 'mail' | null>(null);
  const [licence, setLicence] = useState<'pal' | 'rpal' | null>(null);
  const [state, setState] = useState<'idle' | 'sending' | 'failed'>('idle');
  if (reported) return <Notice tone="success">Thanks. Your wait was sent and will be added to the numbers once it has been checked.</Notice>;
  const send = async () => {
    setState('sending');
    const ok = await sendWaitReport({ province, days, method, licence });
    if (!ok) return setState('failed');
    updateTracker((t) => ({ ...t, reported: true }));
  };
  const chips = <T extends string>(label: string, options: readonly { id: T; label: string }[], value: T | null, set: (v: T | null) => void) => (
    <View style={{ gap: Spacing.one }}>
      <ThemedText type="smallBold">{label}</ThemedText>
      <View style={styles.chips} accessibilityRole="radiogroup" accessibilityLabel={label}>
        {options.map((o) => {
          const active = value === o.id;
          return (
            <Pressable
              key={o.id}
              accessibilityRole="radio"
              accessibilityState={{ checked: active }}
              onPress={() => set(active ? null : o.id)}
              style={[styles.chip, active ? { backgroundColor: theme.accent, borderColor: theme.accent } : { borderColor: theme.borderStrong }]}>
              <ThemedText type="smallBold" style={{ color: active ? theme.onAccent : theme.text }}>
                {o.label}
              </ThemedText>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
  return (
    <Card style={{ gap: Spacing.three }}>
      <ThemedText type="heading">Add your wait to the numbers</ThemedText>
      <ThemedText type="small" themeColor="textSecondary">
        The wait times here come from applicants' own reports. Yours helps the next person know what to expect. This sends your {days}-day
        wait, your province and the two answers below. No name, no dates, no ID.
      </ThemedText>
      <ProvincePicker hint="Optional. Wait times differ by province." />
      {chips('How did you apply?', METHODS, method, setMethod)}
      {chips('Which licence?', LICENCES, licence, setLicence)}
      <Button label={state === 'sending' ? 'Sending…' : `Send my ${days}-day wait`} onPress={() => void send()} disabled={state === 'sending'} />
      {state === 'failed' ? (
        <ThemedText type="small" themeColor="danger">
          That didn't send. Check your connection and try again.
        </ThemedText>
      ) : null}
    </Card>
  );
}

// Callers still pass the sample size and dates; the note no longer shows them.
export function SourceNote(_props: { total: number; first: string; last: string }) {
  return (
    <ThemedText type="small" themeColor="textSecondary">
      These numbers are self-reported and not a random sample, so treat them as a rough guide. Renewals and files with a
      reported problem are left out of the typical wait. This app is not affiliated with the RCMP or the Canadian Firearms
      Program.
    </ThemedText>
  );
}

const styles = StyleSheet.create({
  statRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.three },
  bar: { height: 18, borderRadius: 9, overflow: 'hidden', position: 'relative', marginTop: Spacing.two },
  band: { position: 'absolute', top: 0, bottom: 0 },
  mark: { position: 'absolute', top: 0, bottom: 0, width: 3, marginLeft: -1 },
  min: { position: 'absolute', top: 0, bottom: 0, width: 0, borderLeftWidth: 2, borderStyle: 'dashed' },
  you: { position: 'absolute', top: 0, width: 18, height: 18, borderRadius: 9, marginLeft: -9, borderWidth: 3 },
  axis: { flexDirection: 'row', justifyContent: 'space-between', marginTop: Spacing.one },
  tick: { fontSize: 12, lineHeight: 16 },
  check: { flexDirection: 'row', gap: Spacing.three, alignItems: 'flex-start', minHeight: 44, paddingVertical: Spacing.one },
  box: { width: 22, height: 22, borderRadius: 6, borderWidth: 2, alignItems: 'center', justifyContent: 'center', marginTop: 1 },
  linkBtn: { minHeight: 44, justifyContent: 'center', alignSelf: 'flex-start' },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.two },
  chip: { borderWidth: 1, borderRadius: 999, minHeight: 40, paddingHorizontal: Spacing.three, justifyContent: 'center' },
});

export type { WaitRow };
