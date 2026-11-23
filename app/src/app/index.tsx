import { Link } from 'expo-router';
import type { Metadata } from 'expo-router/server';

import { page } from '@/lib/seo';
import { useState } from 'react';
import { Image, Pressable, StyleSheet, View, useWindowDimensions } from 'react-native';

import { HandoffCards } from '@/components/handoff-cards';
import { ThemedText } from '@/components/themed-text';
import { Button, Card, Notice, ProgressBar, Screen } from '@/components/ui';
import { Radius, Spacing } from '@/constants/theme';
import { type Course, EXAM_SIZE, dueForReview, readiness, today, topicLabel, topicStats } from '@/features/quiz/engine';
import { useTheme } from '@/hooks/use-theme';
import { drillPhotos } from '@/content/drill-photos';
import { drills, questions } from '@/lib/content';
import { useProgress } from '@/lib/progress';
import { useTracker } from '@/lib/tracker';

export function generateMetadata(): Metadata {
  return page('/', {
    title: 'PAL Test Canada: free CFSC and CRFSC practice tests',
    description:
      'Free practice tests for the Canadian Firearms Safety Course and the restricted course. Every question is written from the handbook and reviewed by a certified instructor.',
  });
}

const TOPICS_SHOWN = 5;

const COURSES: { id: Course; label: string; sub: string }[] = [
  { id: 'cfsc', label: 'CFSC', sub: 'Non-restricted' },
  { id: 'crfsc', label: 'CRFSC', sub: 'Restricted' },
];

export default function Home() {
  const theme = useTheme();
  const [course, setCourse] = useState<Course>('cfsc');
  const [allTopics, setAllTopics] = useState(false);
  const { progress, loaded } = useProgress();
  const { tracker } = useTracker();
  const drillPhoto = drills.find((d) => d.photo && drillPhotos[d.photo]);

  const bank = questions.filter((q) => q.course === course);
  const examSize = Math.min(EXAM_SIZE, bank.length);
  const stats = topicStats(questions, progress, course);
  const due = loaded ? dueForReview(questions, progress, course, today()).length : 0;
  const ready = readiness(questions, progress, course);
  const hasHistory = stats.some((s) => s.seen > 0) || progress.exams.some((e) => e.course === course);
  // Weakest first once there is history; biggest first before that.
  const sorted = [...stats].sort((a, b) =>
    hasHistory ? (a.accuracy ?? 2) - (b.accuracy ?? 2) || b.total - a.total : b.total - a.total || a.topic.localeCompare(b.topic),
  );
  const shown = allTopics ? sorted : sorted.slice(0, TOPICS_SHOWN);

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
                {
                  borderColor: active ? theme.accent : theme.border,
                  backgroundColor: active ? theme.backgroundElement : theme.background,
                },
              ]}
            >
              <ThemedText type="bold">{c.label}</ThemedText>
              <ThemedText type="small" themeColor="textSecondary">
                {c.sub}
              </ThemedText>
            </Pressable>
          );
        })}
      </View>

      <ReadinessCard loaded={loaded} hasHistory={hasHistory} ready={ready} />

      <View style={{ gap: Spacing.two }}>
        <Button label={`Practice exam (${examSize} questions)`} href={{ pathname: '/quiz', params: { course, mode: 'exam' } }} />
        <Button
          variant="secondary"
          label="Quick practice (10 questions)"
          href={{ pathname: '/quiz', params: { course, mode: 'practice' } }}
        />
        {due > 0 ? (
          <Button
            variant="secondary"
            label={`Review ${due} missed question${due === 1 ? '' : 's'}`}
            href={{ pathname: '/quiz', params: { course, mode: 'review' } }}
          />
        ) : null}
      </View>

      <View style={styles.grid}>
        <View style={styles.half}>
          <Link href="/spot" asChild>
            <Pressable accessibilityRole="link">
              <Card style={{ padding: 0, overflow: 'hidden' }}>
                {drillPhoto?.photo ? (
                  <View style={styles.drillPhoto}>
                    <Image
                      source={drillPhotos[drillPhoto.photo]}
                      style={StyleSheet.absoluteFill}
                      resizeMode="cover"
                      accessibilityIgnoresInvertColors
                    />
                  </View>
                ) : null}
                <View style={{ padding: Spacing.three, gap: Spacing.one }}>
                  <ThemedText type="bold">Spot the mistake</ThemedText>
                  <ThemedText type="small" themeColor="textSecondary">
                    {drills.length} photo scenes for the practical test. Find the one handling mistake in each.
                  </ThemedText>
                  <ThemedText type="smallBold" themeColor="accent">
                    Start the drill
                  </ThemedText>
                </View>
              </Card>
            </Pressable>
          </Link>
        </View>
        <View style={[{ gap: Spacing.three }, styles.half]}>
          <Link href="/guides/what-fails-people" asChild>
            <Pressable accessibilityRole="link">
              <Card>
                <ThemedText type="bold">What fails people</ThemedText>
                <ThemedText type="small" themeColor="textSecondary">
                  Most failures are handling habits, not missing knowledge. The common ones and how to fix them.
                </ThemedText>
                <ThemedText type="smallBold" themeColor="accent">
                  Read the guide
                </ThemedText>
              </Card>
            </Pressable>
          </Link>
          <Link href="/wait-times" asChild>
            <Pressable accessibilityRole="link">
              <Card>
                <ThemedText type="bold">
                  {tracker.submittedOn && !tracker.arrivedOn ? 'Your licence tracker' : 'Licence wait times'}
                </ThemedText>
                <ThemedText type="small" themeColor="textSecondary">
                  {tracker.submittedOn && !tracker.arrivedOn
                    ? 'See how your wait compares with what other applicants report.'
                    : 'How long applicants report waiting for their PAL, and a tracker for yours.'}
                </ThemedText>
                <ThemedText type="smallBold" themeColor="accent">
                  {tracker.submittedOn && !tracker.arrivedOn ? 'Open the tracker' : 'See wait times'}
                </ThemedText>
              </Card>
            </Pressable>
          </Link>
        </View>
      </View>

      <View style={{ gap: Spacing.two }}>
        <ThemedText type="heading" accessibilityRole="header">
          Topics
        </ThemedText>
        <View style={styles.grid}>
          {shown.map((s) => (
            <View key={s.topic} style={styles.half}>
              <Link
                href={{
                  pathname: '/quiz',
                  params: { course, mode: 'practice', topic: s.topic },
                }}
                asChild
              >
                <Pressable accessibilityRole="link">
                  <Card>
                    <View style={styles.topicRow}>
                      <ThemedText type="bold" style={{ flex: 1 }}>
                        {topicLabel(s.topic)}
                      </ThemedText>
                      <ThemedText type="small" themeColor="textSecondary">
                        {s.accuracy === null
                          ? `${s.total} question${s.total === 1 ? '' : 's'}`
                          : `${Math.round(s.accuracy * 100)}% correct`}
                      </ThemedText>
                    </View>
                    <ProgressBar value={s.accuracy ?? 0} />
                  </Card>
                </Pressable>
              </Link>
            </View>
          ))}
        </View>
        {sorted.length > TOPICS_SHOWN ? (
          <Button
            variant="secondary"
            label={allTopics ? 'Show fewer topics' : `Show all ${sorted.length} topics`}
            onPress={() => setAllTopics(!allTopics)}
          />
        ) : null}
      </View>

      <HandoffCards
        placement="home"
        title="After your course"
        lead="Licence on the way? These are made by the same team."
        order={course === 'crfsc' ? ['shootable', 'huntable'] : ['huntable', 'shootable']}
      />
    </Screen>
  );
}

function ReadinessCard({
  loaded,
  hasHistory,
  ready,
}: {
  loaded: boolean;
  hasHistory: boolean;
  ready: { ready: boolean; reasons: string[] };
}) {
  if (!loaded) return null;
  if (!hasHistory)
    return (
      <Card>
        <ThemedText type="bold">How you know you're ready</ThemedText>
        <ThemedText type="small" themeColor="textSecondary">
          Score 90% or better on three practice exams in a row with no weak topic, and this turns green. The real written test
          needs 80%.
        </ThemedText>
      </Card>
    );
  if (ready.ready)
    return (
      <Notice tone="success">You look ready: your last three practice exams were 90% or better and no topic is weak.</Notice>
    );
  return (
    <Card>
      <ThemedText type="bold">Not ready yet</ThemedText>
      {ready.reasons.map((r) => (
        <ThemedText key={r} type="small" themeColor="textSecondary">
          {r}
        </ThemedText>
      ))}
    </Card>
  );
}

const styles = StyleSheet.create({
  grid: { gap: Spacing.three },
  half: {},
  drillPhoto: { width: '100%', aspectRatio: 1024 / 637, overflow: 'hidden' },
  switch: { flexDirection: 'row', gap: Spacing.two },
  switchItem: {
    flex: 1,
    borderWidth: 2,
    borderRadius: Radius,
    padding: Spacing.three,
    gap: Spacing.half,
  },
  topicRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: Spacing.two,
  },
});
