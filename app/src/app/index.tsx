import { Link } from 'expo-router';
import type { Metadata } from 'expo-router/server';

import { page } from '@/lib/seo';
import { useState } from 'react';
import { Image, Pressable, StyleSheet, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';

import { HandoffCards } from '@/components/handoff-cards';
import { ThemedText } from '@/components/themed-text';
import { Button, Col, Eyebrow, LinkCard, Ring, Screen, Split } from '@/components/ui';
import { Radius, RadiusControl, Spacing, TINTS } from '@/constants/theme';
import { type Course, EXAM_SIZE, READY_EXAMS, READY_MARK, dueForReview, readiness, today, topicLabel, topicStats } from '@/features/quiz/engine';
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
  // The handover scene reads well cropped to 16:9; fall back to any scene with a photo.
  const drillPhoto = drills.find((d) => d.id === 'spot-pass-closed' && d.photo && drillPhotos[d.photo]) ?? drills.find((d) => d.photo && drillPhotos[d.photo]);

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

  const tracking = !!tracker.submittedOn && !tracker.arrivedOn;
  const exams = progress.exams.filter((e) => e.course === course);

  return (
    <Screen width="wide">
      <Split gap={Spacing.four}>
        <Col basis={460} grow={3} style={{ gap: Spacing.three }}>
          <View style={{ gap: Spacing.two }}>
            <Eyebrow tone="signal">Free · Reviewed by a certified instructor</Eyebrow>
            <ThemedText type="title" accessibilityRole="header" style={{ maxWidth: 580 }}>
              Pass your PAL course the first time
            </ThemedText>
            <ThemedText themeColor="textSecondary" style={{ maxWidth: 560 }}>
              Practice tests for the CFSC and CRFSC, written from the handbook. No account, no ads. Your progress stays on this
              device.
            </ThemedText>
          </View>

          <View style={{ gap: Spacing.two }}>
            <ThemedText type="smallBold" themeColor="textSecondary" nativeID="course-label">
              Which course are you taking?
            </ThemedText>
            <View style={styles.switch} accessibilityRole="radiogroup" aria-labelledby="course-label">
              {COURSES.map((c) => {
                const active = c.id === course;
                return (
                  <Pressable
                    key={c.id}
                    accessibilityRole="radio"
                    accessibilityState={{ checked: active }}
                    onPress={() => setCourse(c.id)}
                    style={[
                      styles.switchItem,
                      {
                        borderColor: active ? theme.accent : theme.border,
                        backgroundColor: active ? theme.accentSoft : theme.backgroundElement,
                      },
                    ]}
                  >
                    <View style={[styles.radio, { borderColor: active ? theme.accent : theme.border }]}>
                      {active ? <View style={[styles.radioDot, { backgroundColor: theme.accent }]} /> : null}
                    </View>
                    <View style={{ flex: 1 }}>
                      <ThemedText type="bold">{c.label}</ThemedText>
                      <ThemedText type="small" themeColor="textSecondary">
                        {c.sub}
                      </ThemedText>
                    </View>
                  </Pressable>
                );
              })}
            </View>
          </View>

          <View style={{ gap: Spacing.two }}>
            <Button
              variant="signal"
              label={`Start a practice exam · ${examSize} questions`}
              href={{ pathname: '/quiz', params: { course, mode: 'exam' } }}
            />
            <Split gap={Spacing.two}>
              <Col basis={200}>
                <Button
                  variant="secondary"
                  label="Quick practice · 10"
                  href={{ pathname: '/quiz', params: { course, mode: 'practice' } }}
                />
              </Col>
              {due > 0 ? (
                <Col basis={200}>
                  <Button
                    variant="secondary"
                    label={`Review ${due} missed`}
                    href={{ pathname: '/quiz', params: { course, mode: 'review' } }}
                  />
                </Col>
              ) : null}
            </Split>
          </View>
        </Col>

        <Col basis={300} grow={2} style={{ justifyContent: 'flex-start' }}>
          <ReadinessPanel loaded={loaded} hasHistory={hasHistory} ready={ready} exams={exams} />
        </Col>
      </Split>

      <Split>
        <Col basis={300}>
          <LinkCard
            href="/spot"
            title="Spot the mistake"
            body={`${drills.length} photo scenes for the practical test. Find the one handling mistake in each.`}
            cta="Start the drill"
          >
            {drillPhoto?.photo ? (
              <View style={styles.drillPhoto}>
                <Image
                  source={drillPhotos[drillPhoto.photo]}
                  style={styles.fill}
                  resizeMode="cover"
                  accessibilityIgnoresInvertColors
                />
              </View>
            ) : null}
          </LinkCard>
        </Col>
        <Col basis={300}>
          <LinkCard
            href="/guides/what-fails-people"
            title="What fails people"
            body="Most failures are handling habits, not missing knowledge. The common ones and how to fix them."
            cta="Read the guide"
          >
            <CardBand tint="tintSand" label="Guide" big="80%" small="pass mark on both tests" />
          </LinkCard>
        </Col>
        <Col basis={300}>
          <LinkCard
            href="/wait-times"
            title={tracking ? 'Your licence tracker' : 'Licence wait times'}
            body={
              tracking
                ? 'See how your wait compares with what other applicants report.'
                : 'How long applicants report waiting for their PAL, and a tracker for yours.'
            }
            cta={tracking ? 'Open the tracker' : 'See wait times'}
          >
            <CardBand tint="tintGreen" label="Wait times" big="28" small="day legal minimum for a first licence" />
          </LinkCard>
        </Col>
      </Split>

      <View style={{ gap: Spacing.three }}>
        <View style={styles.sectionHead}>
          <ThemedText type="heading" accessibilityRole="header">
            {hasHistory ? 'Your topics, weakest first' : 'Practice by topic'}
          </ThemedText>
          <ThemedText type="small" themeColor="textSecondary">
            {course.toUpperCase()} · {bank.length} questions
          </ThemedText>
        </View>
        <Split gap={Spacing.two}>
          {shown.map((s, i) => (
            <Col key={s.topic} basis={320}>
              <Link href={{ pathname: '/quiz', params: { course, mode: 'practice', topic: s.topic } }} asChild>
                <Pressable accessibilityRole="link" accessibilityLabel={`${topicLabel(s.topic)}. ${s.accuracy === null ? `${s.total} questions` : `${Math.round(s.accuracy * 100)}% correct`}`}>
                  {({ pressed }) => (
                    <View style={[styles.topicCard, { backgroundColor: theme[TINTS[i % TINTS.length]] }, pressed ? { opacity: 0.85 } : null]}>
                      <View style={{ flex: 1, gap: Spacing.half }}>
                        <ThemedText type="bold">{topicLabel(s.topic)}</ThemedText>
                        <ThemedText type="small" themeColor="textSecondary">
                          {s.total} question{s.total === 1 ? '' : 's'}
                          {s.seen > 0 ? ` · ${s.seen} answered` : ''}
                        </ThemedText>
                      </View>
                      <Ring
                        value={s.accuracy}
                        size={48}
                        label={s.accuracy === null ? '–' : `${Math.round(s.accuracy * 100)}%`}
                        track="rgba(0,0,0,0.08)"
                        color={s.accuracy !== null && s.accuracy < 0.8 ? theme.signal : theme.success}
                      />
                    </View>
                  )}
                </Pressable>
              </Link>
            </Col>
          ))}
        </Split>
        {sorted.length > TOPICS_SHOWN ? (
          <View style={{ alignSelf: 'flex-start' }}>
            <Button
              variant="secondary"
              label={allTopics ? 'Show fewer topics' : `Show all ${sorted.length} topics`}
              onPress={() => setAllTopics(!allTopics)}
            />
          </View>
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

/** A tinted band at the top of a link card, so the three cards line up with the photo card. */
function CardBand({ label, big, small, tint }: { label: string; big: string; small: string; tint: (typeof TINTS)[number] }) {
  const theme = useTheme();
  return (
    <View style={[styles.band, { backgroundColor: theme[tint] }]}>
      <ThemedText type="eyebrow" themeColor="signal">
        {label}
      </ThemedText>
      <View style={styles.bandStat}>
        <ThemedText type="stat" style={{ fontSize: 52, lineHeight: 56 }}>
          {big}
        </ThemedText>
        <ThemedText type="small" themeColor="textSecondary" style={{ flex: 1, paddingBottom: 6 }}>
          {small}
        </ThemedText>
      </View>
    </View>
  );
}

function ReadinessPanel({
  loaded,
  hasHistory,
  ready,
  exams,
}: {
  loaded: boolean;
  hasHistory: boolean;
  ready: { ready: boolean; reasons: string[] };
  exams: { correct: number; total: number }[];
}) {
  const theme = useTheme();
  const recent = exams.slice(-READY_EXAMS);
  const last = exams.at(-1);
  const strong = recent.filter((e) => e.correct / e.total >= READY_MARK).length;
  const status = !loaded ? ' ' : ready.ready ? 'You look ready' : hasHistory ? 'Not ready yet' : 'How you know you’re ready';
  const detail = !loaded
    ? ' '
    : ready.ready
      ? 'Your last three practice exams were 90% or better and no topic is weak.'
      : hasHistory
        ? ready.reasons.join(' ')
        : 'Score 90% or better on three practice exams in a row with no weak topic. The real written test needs 80%.';
  return (
    <View style={[styles.panel, { backgroundColor: theme.cover }]}>
      <ThemedText type="eyebrow" style={{ color: theme.onCoverMuted }}>
        Readiness
      </ThemedText>
      <View style={styles.panelTop}>
        <ReadyRing value={strong / READY_EXAMS} done={ready.ready} />
        <View style={{ flex: 1, gap: Spacing.half }}>
          <ThemedText type="stat" style={{ color: theme.onCover }}>
            {last ? `${Math.round((last.correct / last.total) * 100)}%` : `${strong} / ${READY_EXAMS}`}
          </ThemedText>
          <ThemedText type="small" style={{ color: theme.onCoverMuted }}>
            {last ? 'your last practice exam' : 'practice exams at 90% or better'}
          </ThemedText>
        </View>
      </View>
      <View style={styles.ticks} accessibilityLabel={`${strong} of ${READY_EXAMS} recent exams at 90% or better`}>
        {Array.from({ length: READY_EXAMS }, (_, i) => {
          const e = recent[i];
          const ok = e ? e.correct / e.total >= READY_MARK : false;
          return (
            <View key={i} style={[styles.tick, { borderColor: theme.onCoverMuted }, e ? { backgroundColor: ok ? theme.onCover : 'transparent' } : null]}>
              <ThemedText type="smallBold" style={{ color: ok ? theme.cover : theme.onCoverMuted, fontVariant: ['tabular-nums'] }}>
                {e ? `${Math.round((e.correct / e.total) * 100)}` : i + 1}
              </ThemedText>
            </View>
          );
        })}
      </View>
      <View style={{ gap: Spacing.one }}>
        <ThemedText type="bold" style={{ color: theme.onCover }}>
          {status}
        </ThemedText>
        <ThemedText type="small" style={{ color: theme.onCoverMuted }}>
          {detail}
        </ThemedText>
      </View>
    </View>
  );
}

function ReadyRing({ value, done }: { value: number; done: boolean }) {
  const theme = useTheme();
  const size = 76;
  const stroke = 7;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  return (
    <Svg width={size} height={size} accessibilityElementsHidden importantForAccessibility="no">
      <Circle cx={size / 2} cy={size / 2} r={r} stroke={theme.onCoverMuted} strokeOpacity={0.35} strokeWidth={stroke} fill="none" />
      <Circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        stroke={done ? theme.onCover : theme.signal}
        strokeWidth={stroke}
        fill="none"
        strokeLinecap="round"
        strokeDasharray={`${c * value} ${c}`}
        strokeOpacity={value > 0 ? 1 : 0}
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
      />
    </Svg>
  );
}

const styles = StyleSheet.create({
  drillPhoto: { width: '100%', aspectRatio: 16 / 9, overflow: 'hidden' },
  fill: { width: '100%', height: '100%' },
  band: { aspectRatio: 16 / 9, padding: Spacing.three, justifyContent: 'space-between' },
  bandStat: { flexDirection: 'row', alignItems: 'flex-end', gap: Spacing.two },
  switch: { flexDirection: 'row', gap: Spacing.two },
  switchItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two + 4,
    borderWidth: 2,
    borderRadius: RadiusControl,
    paddingVertical: Spacing.two + 4,
    paddingHorizontal: Spacing.three,
  },
  radio: { width: 20, height: 20, borderRadius: 10, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  radioDot: { width: 10, height: 10, borderRadius: 5 },
  panel: { borderRadius: Radius, padding: Spacing.four, gap: Spacing.three },
  panelTop: { flexDirection: 'row', alignItems: 'center', gap: Spacing.three },
  ticks: { flexDirection: 'row', gap: Spacing.two },
  tick: { flex: 1, height: 36, borderRadius: 8, borderWidth: 1.5, alignItems: 'center', justifyContent: 'center' },
  sectionHead: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between', flexWrap: 'wrap', gap: Spacing.two },
  topicCard: { flexDirection: 'row', alignItems: 'center', gap: Spacing.three, borderRadius: Radius, paddingVertical: Spacing.three, paddingHorizontal: Spacing.three + 4, minHeight: 80 },
  topicRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: Spacing.two },
});
