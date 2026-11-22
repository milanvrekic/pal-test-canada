import { Link } from 'expo-router';
import type { Metadata } from 'expo-router/server';
import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Button, Card, Notice, ProgressBar, Screen } from '@/components/ui';
import { Radius, Spacing } from '@/constants/theme';
import {
  type Course,
  EXAM_SIZE,
  dueForReview,
  readiness,
  today,
  topicLabel,
  topicStats,
} from '@/features/quiz/engine';
import { useTheme } from '@/hooks/use-theme';
import { questions } from '@/lib/content';
import { useProgress } from '@/lib/progress';

export function generateMetadata(): Metadata {
  return {
    title: 'PAL Test Canada: free CFSC and CRFSC practice tests',
    description:
      'Free practice tests for the Canadian Firearms Safety Course and the restricted course. Every question is written from the handbook and reviewed by a certified instructor.',
  };
}

const COURSES: { id: Course; label: string; sub: string }[] = [
  { id: 'cfsc', label: 'CFSC', sub: 'Non-restricted' },
  { id: 'crfsc', label: 'CRFSC', sub: 'Restricted' },
];

export default function Home() {
  const theme = useTheme();
  const [course, setCourse] = useState<Course>('cfsc');
  const { progress, loaded } = useProgress();

  const bank = questions.filter((q) => q.course === course);
  const examSize = Math.min(EXAM_SIZE, bank.length);
  const stats = topicStats(questions, progress, course);
  const due = loaded ? dueForReview(questions, progress, course, today()).length : 0;
  const ready = readiness(questions, progress, course);
  const hasHistory = stats.some((s) => s.seen > 0) || progress.exams.some((e) => e.course === course);

  return (
    <Screen>
      <View style={{ gap: Spacing.two }}>
        <ThemedText type="title" accessibilityRole="header">
          Pass your PAL course the first time
        </ThemedText>
        <ThemedText themeColor="textSecondary">
          Free practice tests for the CFSC and CRFSC. No account, no ads. Your progress stays on this device.
        </ThemedText>
      </View>

      <View style={styles.switch}>
        {COURSES.map((c) => {
          const active = c.id === course;
          return (
            <Pressable
              key={c.id}
              accessibilityRole="button"
              accessibilityState={{ selected: active }}
              onPress={() => setCourse(c.id)}
              style={[
                styles.switchItem,
                { borderColor: active ? theme.accent : theme.border, backgroundColor: active ? theme.backgroundElement : theme.background },
              ]}>
              <ThemedText type="bold">{c.label}</ThemedText>
              <ThemedText type="small" themeColor="textSecondary">
                {c.sub}
              </ThemedText>
            </Pressable>
          );
        })}
      </View>

      {loaded && hasHistory ? (
        ready.ready ? (
          <Notice tone="success">You look ready: your last three practice exams were 90% or better and no topic is weak.</Notice>
        ) : (
          <Card>
            <ThemedText type="bold">Not ready yet</ThemedText>
            {ready.reasons.map((r) => (
              <ThemedText key={r} type="small" themeColor="textSecondary">
                {r}
              </ThemedText>
            ))}
          </Card>
        )
      ) : null}

      <View style={{ gap: Spacing.two }}>
        <Button label={`Practice exam (${examSize} questions)`} href={{ pathname: '/quiz', params: { course, mode: 'exam' } }} />
        <Button variant="secondary" label="Quick practice (10 questions)" href={{ pathname: '/quiz', params: { course, mode: 'practice' } }} />
        {due > 0 ? (
          <Button
            variant="secondary"
            label={`Review ${due} missed question${due === 1 ? '' : 's'}`}
            href={{ pathname: '/quiz', params: { course, mode: 'review' } }}
          />
        ) : null}
      </View>

      <View style={{ gap: Spacing.two }}>
        <ThemedText type="heading" accessibilityRole="header">
          Practise by topic
        </ThemedText>
        {stats.map((s) => (
          <Link key={s.topic} href={{ pathname: '/quiz', params: { course, mode: 'practice', topic: s.topic } }} asChild>
            <Pressable accessibilityRole="link">
              <Card>
                <View style={styles.topicRow}>
                  <ThemedText type="bold">{topicLabel(s.topic)}</ThemedText>
                  <ThemedText type="small" themeColor="textSecondary">
                    {s.accuracy === null ? `${s.total} question${s.total === 1 ? '' : 's'}` : `${Math.round(s.accuracy * 100)}% correct`}
                  </ThemedText>
                </View>
                <ProgressBar value={s.accuracy ?? 0} />
              </Card>
            </Pressable>
          </Link>
        ))}
      </View>

      <Card>
        <ThemedText type="bold">Spot the mistake</ThemedText>
        <ThemedText themeColor="textSecondary">
          Practise for the practical test: look at each scene and find the handling mistake.
        </ThemedText>
        <Button variant="secondary" label="Start the drill" href="/spot" />
      </Card>

      <Card>
        <ThemedText type="bold">What fails people</ThemedText>
        <ThemedText themeColor="textSecondary">
          Most failures are handling habits, not missing knowledge. See the common ones and how to fix them.
        </ThemedText>
        <Button variant="secondary" label="Read the guide" href="/guides/what-fails-people" />
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  switch: { flexDirection: 'row', gap: Spacing.two },
  switchItem: { flex: 1, borderWidth: 2, borderRadius: Radius, padding: Spacing.three, gap: Spacing.half },
  topicRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: Spacing.two },
});
