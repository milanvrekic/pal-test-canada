import { useState } from 'react';
import { Linking, Pressable, StyleSheet, TextInput, View } from 'react-native';

import { HandoffCards } from '@/components/handoff-cards';
import { ThemedText } from '@/components/themed-text';
import { Button, Card, Notice } from '@/components/ui';
import { Radius, Spacing } from '@/constants/theme';
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
import { contentBuiltAt, waitRows } from '@/lib/content';
import { updateTracker, useTracker } from '@/lib/tracker';

const SCALE_DAYS = 180;
const SOURCE_URL = 'https://www.canadiangunnutz.com/forum/threads/shorten-pal-approval-times.464083/';

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
        <View style={[styles.band, { left: pct(s.p25), width: pct(s.p75 - s.p25), backgroundColor: theme.accent, opacity: 0.35 }]} />
        <View style={[styles.mark, { left: pct(s.median), backgroundColor: theme.accent }]} />
        <View style={[styles.min, { left: pct(MINIMUM_WAIT_DAYS), borderColor: theme.textSecondary }]} />
        {you !== undefined ? <View style={[styles.you, { left: pct(you), backgroundColor: theme.text }]} /> : null}
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
      <ThemedText type="bold">{title}</ThemedText>
      {s ? (
        <>
          <ThemedText>
            Typical wait <ThemedText type="bold">{s.median} days</ThemedText>. Half of reports fall between {s.p25} and {s.p75} days.
          </ThemedText>
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
        <HandoffCards placement="licence_arrived" title="Now you're licensed" lead="Find where you can legally hunt and shoot." />
        <Button variant="secondary" label="Undo: my licence hasn't arrived" onPress={() => updateTracker((t) => ({ ...t, arrivedOn: null }))} />
      </View>
    );
  }

  if (!tracker.submittedOn) {
    const save = (value: string) => {
      if (!isIsoDay(value)) return setError('Use the format YYYY-MM-DD, for example 2026-11-01.');
      if (value > day) return setError('That date is in the future.');
      setError(null);
      updateTracker((t) => ({ ...t, submittedOn: value }));
    };
    return (
      <Card>
        <ThemedText type="bold">Track your application</ThemedText>
        <ThemedText type="small" themeColor="textSecondary">
          Enter the day you sent your application. The date stays on this device.
        </ThemedText>
        <TextInput
          value={draft}
          onChangeText={setDraft}
          placeholder="YYYY-MM-DD"
          placeholderTextColor={theme.textSecondary}
          autoCapitalize="none"
          autoCorrect={false}
          keyboardType="numbers-and-punctuation"
          accessibilityLabel="Date you sent your application, YYYY-MM-DD"
          onSubmitEditing={() => save(draft.trim())}
          style={[styles.input, { borderColor: error ? theme.danger : theme.border, color: theme.text, backgroundColor: theme.background }]}
        />
        {error ? (
          <ThemedText type="small" themeColor="danger">
            {error}
          </ThemedText>
        ) : null}
        <Button label="Start tracking" onPress={() => save(draft.trim())} />
        <Button variant="secondary" label="I sent it today" onPress={() => save(day)} />
      </Card>
    );
  }

  const elapsed = Math.max(0, daysBetween(tracker.submittedOn, day));
  const minimumEnds = addDays(tracker.submittedOn, MINIMUM_WAIT_DAYS);
  const share = national ? Math.round(shareDoneBy(recent(typical(waitRows), contentBuiltAt).rows, elapsed) * 100) : null;
  return (
    <View style={{ gap: Spacing.three }}>
      <Card>
        <ThemedText type="bold">Day {elapsed} of your wait</ThemedText>
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
        <Button label="My licence arrived" onPress={() => updateTracker((t) => ({ ...t, arrivedOn: day }))} />
        <Pressable accessibilityRole="button" onPress={() => updateTracker((t) => ({ ...t, submittedOn: null }))} style={styles.linkBtn}>
          <ThemedText type="small" themeColor="textSecondary" style={{ textDecorationLine: 'underline' }}>
            Change the date
          </ThemedText>
        </Pressable>
      </Card>

      <Card>
        <ThemedText type="bold">While you wait</ThemedText>
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
      <HandoffCards placement="wait_times" title="Get ready for when it arrives" lead="Plan where you'll hunt and shoot while you wait." />
    </View>
  );
}

export function SourceNote({ total, first, last }: { total: number; first: string; last: string }) {
  return (
    <ThemedText type="small" themeColor="textSecondary">
      Where these numbers come from: {total} wait times that applicants posted publicly on the Canadian Gun Nutz forum between {first} and {last}
      .{' '}
      <ThemedText
        type="small"
        themeColor="accent"
        accessibilityRole="link"
        style={{ textDecorationLine: 'underline' }}
        onPress={() => void Linking.openURL(SOURCE_URL)}>
        Read the thread
      </ThemedText>
      . They are self-reported and not a random sample, so treat them as a rough guide. Renewals and files with a reported
      problem are left out of the typical wait. This app is not affiliated with the RCMP or the Canadian Firearms Program.
    </ThemedText>
  );
}

const styles = StyleSheet.create({
  bar: { height: 18, borderRadius: 9, overflow: 'hidden', position: 'relative', marginTop: Spacing.two },
  band: { position: 'absolute', top: 0, bottom: 0 },
  mark: { position: 'absolute', top: 0, bottom: 0, width: 3, marginLeft: -1 },
  min: { position: 'absolute', top: 0, bottom: 0, width: 0, borderLeftWidth: 2, borderStyle: 'dashed' },
  you: { position: 'absolute', top: -2, width: 14, height: 22, borderRadius: 7, marginLeft: -7 },
  axis: { flexDirection: 'row', justifyContent: 'space-between', marginTop: Spacing.one },
  tick: { fontSize: 12, lineHeight: 16 },
  input: { borderWidth: 1, borderRadius: Radius, minHeight: 48, paddingHorizontal: Spacing.three, fontSize: 16 },
  check: { flexDirection: 'row', gap: Spacing.three, alignItems: 'flex-start', minHeight: 44, paddingVertical: Spacing.one },
  box: { width: 22, height: 22, borderRadius: 6, borderWidth: 2, alignItems: 'center', justifyContent: 'center', marginTop: 1 },
  linkBtn: { minHeight: 44, justifyContent: 'center', alignSelf: 'flex-start' },
});

export type { WaitRow };
