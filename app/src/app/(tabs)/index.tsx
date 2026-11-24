import { Link, type Href } from 'expo-router';
import type { Metadata } from 'expo-router/server';

import { page } from '@/lib/seo';
import { type ReactNode, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';

import { HandoffCards } from '@/components/handoff-cards';
import { TryScene } from '@/components/try-scene';
import { ThemedText } from '@/components/themed-text';
import { APP_LAYOUT, Button, Col, Ring, Screen, Split } from '@/components/ui';
import { Radius, RadiusControl, Shadow, Spacing } from '@/constants/theme';
import {
  type Course,
  EXAM_SIZE,
  PASS_MARK,
  READY_EXAMS,
  READY_MARK,
  dueForReview,
  readiness,
  today,
  topicLabel,
  topicStats,
} from '@/features/quiz/engine';
import { useTheme } from '@/hooks/use-theme';
import { drills, questions } from '@/lib/content';
import { useCourse } from '@/lib/course';
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
const QUICK_SIZE = 10;
const MOCK_MINUTES = 60;
const pct = (x: number) => `${Math.round(x * 100)}%`;

const COURSES: { id: Course; label: string; sub: string }[] = [
  { id: 'cfsc', label: 'CFSC', sub: 'Non-restricted' },
  { id: 'crfsc', label: 'CRFSC', sub: 'Restricted' },
];

type TopicStat = ReturnType<typeof topicStats>[number];
type ExamLite = { correct: number; total: number };

/**
 * The website home sells the course and lets people try a question; the app home (iOS, Android) starts with what to
 * study next, because people open it again and again and have already decided to use it.
 */
export default function Home() {
  const t = useTheme();
  const [course, setCourse] = useCourse();
  const [allTopics, setAllTopics] = useState(false);
  const { progress, loaded } = useProgress();
  const { tracker } = useTracker();

  const bank = questions.filter((q) => q.course === course);
  const examSize = Math.min(EXAM_SIZE, bank.length);
  const stats = topicStats(questions, progress, course);
  const due = loaded ? dueForReview(questions, progress, course, today()).length : 0;
  const ready = readiness(questions, progress, course);
  const exams = progress.exams.filter((e) => e.course === course);
  const hasHistory = stats.some((s) => s.seen > 0) || exams.length > 0;
  // Weakest first once there is history; biggest first before that.
  const sorted = [...stats].sort((a, b) =>
    hasHistory ? (a.accuracy ?? 2) - (b.accuracy ?? 2) || b.total - a.total : b.total - a.total || a.topic.localeCompare(b.topic),
  );
  const tracking = !!tracker.submittedOn && !tracker.arrivedOn;

  const picker = <CoursePicker course={course} onChange={setCourse} />;
  const start = <StartActions course={course} examSize={examSize} />;
  const readinessPanel = <ReadinessPanel loaded={loaded} hasHistory={hasHistory} ready={ready} exams={exams} />;
  const topics = (
    <TopicList
      course={course}
      total={bank.length}
      stats={sorted}
      hasHistory={hasHistory}
      all={allTopics}
      onToggle={() => setAllTopics(!allTopics)}
    />
  );
  const handoff = (
    <HandoffCards
      placement="home"
      title="After your course"
      lead="Licence on the way? These apps are made by the same team."
      order={course === 'crfsc' ? ['shootable', 'huntable'] : ['huntable', 'shootable']}
    />
  );

  if (APP_LAYOUT) {
    return (
      <Screen>
        {picker}
        {loaded ? <UpNext course={course} due={due} stats={sorted} exams={exams} ready={ready.ready} examSize={examSize} /> : null}
        <OtherWays course={course} examSize={examSize} />
        {readinessPanel}
        {topics}
        {handoff}
      </Screen>
    );
  }

  return (
    <Screen width="wide">
      <Split gap={Spacing.five} style={{ alignItems: 'center', paddingVertical: Spacing.three }}>
        <Col basis={420} grow={5} style={{ gap: Spacing.four }}>
          <ThemedText type="display" accessibilityRole="header">
            Pass your PAL course the first time.
          </ThemedText>
          <ThemedText themeColor="textSecondary" style={{ fontSize: 18, lineHeight: 28, maxWidth: 520 }}>
            Practice tests for the CFSC and CRFSC, written from the student handbook and reviewed by a certified instructor. Free, with no
            account and no ads. Your progress stays on this device.
          </ThemedText>
          {picker}
          {start}
          <View style={styles.facts}>
            {[`${questions.length} questions`, `${drills.length} photo scenes`, 'Handbook page on every answer', 'No sign-up'].map((f) => (
              <View key={f} style={styles.fact}>
                <Check color={t.textSecondary} />
                <ThemedText type="small" themeColor="textSecondary">
                  {f}
                </ThemedText>
              </View>
            ))}
          </View>
        </Col>
        <Col basis={360} grow={4}>
          <TryScene />
        </Col>
      </Split>

      {due > 0 ? (
        <View style={{ alignSelf: 'flex-start' }}>
          <Button
            variant="secondary"
            label={`Review ${due} missed question${due === 1 ? '' : 's'}`}
            href={{ pathname: '/quiz', params: { course, mode: 'review' } }}
          />
        </View>
      ) : null}

      <Split gap={Spacing.four}>
        <Col basis={380} grow={3}>
          {readinessPanel}
        </Col>
        <Col basis={300} grow={2}>
          <RowList
            title="Good to know"
            rows={[
              {
                href: '/wait-times',
                label: tracking ? 'Your licence tracker' : 'How long the licence takes',
                sub: tracking ? 'See how your wait compares with other applicants' : 'At least 28 days by law; see what applicants report',
              },
              {
                href: '/guides/what-fails-people',
                label: 'What fails people',
                sub: 'Mostly handling habits, not missing knowledge',
              },
              {
                href: '/pal-courses',
                label: 'Where to take the course',
                sub: 'Course providers by province',
              },
            ]}
          />
        </Col>
      </Split>

      <Split gap={Spacing.four} style={{ alignItems: 'flex-start' }}>
        <Col basis={420} grow={1}>
          {topics}
        </Col>
        <Col basis={420} grow={1}>
          <RowList
            title="Study tools"
            rows={[
              {
                href: '/practical',
                label: 'Practical trainer',
                sub: 'Put PROVE and the handling steps in order, then say them out loud',
              },
              {
                href: '/spot',
                label: 'Spot the mistake',
                sub: `${drills.length} photo scenes from the range and the field`,
              },
              {
                href: '/flashcards',
                label: 'Flashcards',
                sub: 'Question on the front, answer and handbook page on the back',
              },
              {
                href: '/rules',
                label: 'Storage and transport rules',
                sub: 'Pick the firearm and the situation, see what the law requires',
              },
            ]}
          />
        </Col>
      </Split>
      {handoff}
    </Screen>
  );
}

function Check({ color }: { color: string }) {
  return (
    <Svg width={14} height={14} viewBox="0 0 24 24" accessibilityElementsHidden importantForAccessibility="no">
      <Path d="M5 12.5l4.2 4.2L19 7" stroke={color} strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </Svg>
  );
}

function CoursePicker({ course, onChange }: { course: Course; onChange: (c: Course) => void }) {
  const t = useTheme();
  return (
    <View
      style={[styles.segment, { backgroundColor: t.backgroundSelected }]}
      accessibilityRole="radiogroup"
      accessibilityLabel="Which course are you taking?">
      {COURSES.map((c) => {
        const active = c.id === course;
        return (
          <Pressable
            key={c.id}
            accessibilityRole="radio"
            accessibilityState={{ checked: active }}
            onPress={() => onChange(c.id)}
            style={[styles.segmentItem, active ? [Shadow, { backgroundColor: t.backgroundElement }] : null]}>
            <ThemedText type="bold" themeColor={active ? 'accent' : 'text'}>
              {c.label}
            </ThemedText>
            <ThemedText type="small" themeColor="textSecondary">
              {c.sub}
            </ThemedText>
          </Pressable>
        );
      })}
    </View>
  );
}

/** One way in, explained: the practice exam is the main path; quick practice and the timed mock are quieter options. */
function StartActions({ course, examSize }: { course: Course; examSize: number }) {
  return (
    <View style={{ gap: Spacing.two + 4 }}>
      <View style={{ alignSelf: 'flex-start' }}>
        <Button size="lg" label="Start practice exam" href={{ pathname: '/quiz', params: { course, mode: 'exam' } }} />
      </View>
      <ThemedText type="small" themeColor="textSecondary" style={{ maxWidth: 520 }}>
        {examSize} questions like the real written test, with answers and handbook pages at the end. Or try{' '}
        <TextLink href={{ pathname: '/quiz', params: { course, mode: 'practice' } }}>{QUICK_SIZE} quick questions</TextLink> with answers as
        you go, or the <TextLink href={{ pathname: '/quiz', params: { course, mode: 'mock' } }}>timed {MOCK_MINUTES}-minute mock</TextLink>.
      </ThemedText>
    </View>
  );
}

function TextLink({ href, children }: { href: Href; children: ReactNode }) {
  return (
    <Link href={href}>
      <ThemedText type="smallBold" themeColor="accent" style={{ textDecorationLine: 'underline' }}>
        {children}
      </ThemedText>
    </Link>
  );
}

/** In the app, Up next carries the main button; the other ways in are a single line of links under it. */
function OtherWays({ course, examSize }: { course: Course; examSize: number }) {
  return (
    <ThemedText type="small" themeColor="textSecondary">
      Other ways to practise: a full{' '}
      <TextLink href={{ pathname: '/quiz', params: { course, mode: 'exam' } }}>{examSize}-question practice exam</TextLink>,{' '}
      <TextLink href={{ pathname: '/quiz', params: { course, mode: 'practice' } }}>{QUICK_SIZE} quick questions</TextLink> with answers as
      you go, or the <TextLink href={{ pathname: '/quiz', params: { course, mode: 'mock' } }}>timed {MOCK_MINUTES}-minute mock</TextLink>.
    </ThemedText>
  );
}

/** The app's first card: the single most useful thing to do now, from the learner's own history. */
function UpNext({
  course,
  due,
  stats,
  exams,
  ready,
  examSize,
}: {
  course: Course;
  due: number;
  stats: TopicStat[];
  exams: ExamLite[];
  ready: boolean;
  examSize: number;
}) {
  const t = useTheme();
  const weak = stats.find((s) => s.accuracy !== null && s.accuracy < PASS_MARK);
  const next: { title: string; body: string; label: string; href: Href } =
    due > 0
      ? {
          title: `Review ${due} missed question${due === 1 ? '' : 's'}`,
          body: 'Questions you got wrong come back after 1, 3 and 7 days until they stick.',
          label: 'Start review',
          href: { pathname: '/quiz', params: { course, mode: 'review' } },
        }
      : weak
        ? {
            title: `Work on ${topicLabel(weak.topic).toLowerCase()}`,
            body: `You're at ${pct(weak.accuracy ?? 0)} on this topic. The real test needs 80%.`,
            label: 'Practise this topic',
            href: {
              pathname: '/quiz',
              params: { course, mode: 'practice', topic: weak.topic },
            },
          }
        : exams.length === 0
          ? {
              title: 'Take your first practice exam',
              body: `${examSize} questions like the real written test. It shows where to focus.`,
              label: 'Start practice exam',
              href: { pathname: '/quiz', params: { course, mode: 'exam' } },
            }
          : ready
            ? {
                title: 'You look ready',
                body: `Keep it fresh with the timed ${MOCK_MINUTES}-minute mock before course day.`,
                label: 'Start timed mock',
                href: { pathname: '/quiz', params: { course, mode: 'mock' } },
              }
            : {
                title: 'Next practice exam',
                body: `Three in a row at 90% or better means you're ready.`,
                label: 'Start practice exam',
                href: { pathname: '/quiz', params: { course, mode: 'exam' } },
              };
  return (
    <View style={[styles.panel, { backgroundColor: t.backgroundElement, borderColor: t.border }]}>
      <ThemedText type="small" themeColor="textSecondary">
        Up next · {course.toUpperCase()}
      </ThemedText>
      <ThemedText type="heading">{next.title}</ThemedText>
      <ThemedText themeColor="textSecondary">{next.body}</ThemedText>
      <Button label={next.label} href={next.href} />
    </View>
  );
}

type RowItem = { href: Href; label: string; sub: string };

/** A titled, bordered list of links: one surface, rows divided by hairlines. */
function RowList({ title, rows }: { title: string; rows: RowItem[] }) {
  const t = useTheme();
  return (
    <View style={{ gap: Spacing.three, flexGrow: 1 }}>
      <ThemedText type="heading" accessibilityRole="header">
        {title}
      </ThemedText>
      <View style={[styles.list, { backgroundColor: t.backgroundElement, borderColor: t.border }]}>
        {rows.map((r, i) => (
          <Link key={r.label} href={r.href} asChild>
            <Pressable accessibilityRole="link">
              {({ pressed, hovered }: { pressed: boolean; hovered?: boolean }) => (
                <View
                  style={[
                    styles.row,
                    i > 0 ? { borderTopWidth: 1, borderTopColor: t.border } : null,
                    pressed || hovered ? { backgroundColor: t.background } : null,
                  ]}>
                  <View style={{ flex: 1, gap: 2 }}>
                    <ThemedText type="bold">{r.label}</ThemedText>
                    <ThemedText type="small" themeColor="textSecondary">
                      {r.sub}
                    </ThemedText>
                  </View>
                  <Chevron color={t.textSecondary} />
                </View>
              )}
            </Pressable>
          </Link>
        ))}
      </View>
    </View>
  );
}

function Chevron({ color }: { color: string }) {
  return (
    <Svg width={16} height={16} viewBox="0 0 24 24" accessibilityElementsHidden importantForAccessibility="no">
      <Path d="M9 5l7 7-7 7" stroke={color} strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </Svg>
  );
}

/** Topics as one list. The ring is the only colour: green at 80% or better, red below, grey before any answers. */
function TopicList({
  course,
  total,
  stats,
  hasHistory,
  all,
  onToggle,
}: {
  course: Course;
  total: number;
  stats: TopicStat[];
  hasHistory: boolean;
  all: boolean;
  onToggle: () => void;
}) {
  const t = useTheme();
  const shown = all ? stats : stats.slice(0, TOPICS_SHOWN);
  return (
    <View style={{ gap: Spacing.three }}>
      <View style={{ gap: Spacing.one }}>
        <ThemedText type="heading" accessibilityRole="header">
          {hasHistory ? 'Your topics, weakest first' : 'Practise by topic'}
        </ThemedText>
        <ThemedText type="small" themeColor="textSecondary">
          {course.toUpperCase()} · {total} questions. The ring shows your score on each topic; the real test needs 80%.
        </ThemedText>
      </View>
      <View style={[styles.list, { backgroundColor: t.backgroundElement, borderColor: t.border }]}>
        {shown.map((s, i) => {
          const label = s.accuracy === null ? 'New' : pct(s.accuracy);
          return (
            <Link
              key={s.topic}
              href={{
                pathname: '/quiz',
                params: { course, mode: 'practice', topic: s.topic },
              }}
              asChild>
              <Pressable
                accessibilityRole="link"
                accessibilityLabel={`${topicLabel(s.topic)}. ${s.total} questions. ${s.accuracy === null ? 'Not started' : `${pct(s.accuracy)} correct`}`}>
                {({ pressed, hovered }: { pressed: boolean; hovered?: boolean }) => (
                  <View
                    style={[
                      styles.row,
                      i > 0 ? { borderTopWidth: 1, borderTopColor: t.border } : null,
                      pressed || hovered ? { backgroundColor: t.background } : null,
                    ]}>
                    <View style={{ flex: 1, gap: 2 }}>
                      <ThemedText type="bold">{topicLabel(s.topic)}</ThemedText>
                      <ThemedText type="small" themeColor="textSecondary">
                        {s.total} question{s.total === 1 ? '' : 's'}
                        {s.seen > 0 ? ` · ${s.seen} answered` : ''}
                      </ThemedText>
                    </View>
                    <Ring
                      value={s.accuracy}
                      size={44}
                      label={label}
                      color={s.accuracy !== null && s.accuracy < PASS_MARK ? t.danger : t.success}
                    />
                  </View>
                )}
              </Pressable>
            </Link>
          );
        })}
      </View>
      {stats.length > TOPICS_SHOWN ? (
        <View style={{ alignSelf: 'flex-start' }}>
          <Button variant="secondary" label={all ? 'Show fewer topics' : `Show all ${stats.length} topics`} onPress={onToggle} />
        </View>
      ) : null}
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
  exams: ExamLite[];
}) {
  const t = useTheme();
  const recent = exams.slice(-READY_EXAMS);
  const strong = recent.filter((e) => e.correct / e.total >= READY_MARK).length;
  const status = !loaded ? ' ' : ready.ready ? 'You look ready' : hasHistory ? 'Not ready yet' : 'How you know you’re ready';
  const detail = !loaded
    ? ' '
    : ready.ready
      ? 'Your last three practice exams were 90% or better and no topic is weak.'
      : hasHistory
        ? ready.reasons.join(' ')
        : 'Score 90% or better on three practice exams in a row, with no weak topic. The real test needs 80%, so 90% gives you a 10-point buffer for nerves on the day.';
  return (
    <View style={{ gap: Spacing.three }}>
      <ThemedText type="heading" accessibilityRole="header">
        Readiness
      </ThemedText>
      <View
        style={[
          styles.panel,
          {
            backgroundColor: t.backgroundElement,
            borderColor: t.border,
          },
        ]}>
        <View style={styles.panelTop}>
          {hasHistory ? (
            <Ring value={strong / READY_EXAMS} size={84} stroke={8} color={t.success} label={`${strong}/${READY_EXAMS}`} />
          ) : null}
          <View style={{ flex: 1, gap: Spacing.one }}>
            <ThemedText type="subheading">{status}</ThemedText>
            <ThemedText type="small" themeColor="textSecondary">
              {detail}
            </ThemedText>
          </View>
        </View>
        {hasHistory ? (
          <View style={styles.ticks} accessibilityLabel={`${strong} of ${READY_EXAMS} recent exams at 90% or better`}>
            {Array.from({ length: READY_EXAMS }, (_, i) => {
              const e = recent[i];
              const ok = e ? e.correct / e.total >= READY_MARK : false;
              return (
                <View
                  key={i}
                  style={[
                    styles.tick,
                    {
                      borderColor: ok ? t.success : t.border,
                      backgroundColor: ok ? t.successBg : e ? t.dangerBg : t.background,
                    },
                  ]}>
                  <ThemedText
                    type="smallBold"
                    style={{
                      color: ok ? t.successDark : t.textSecondary,
                      fontVariant: ['tabular-nums'],
                    }}>
                    {e ? pct(e.correct / e.total) : 'Not taken'}
                  </ThemedText>
                </View>
              );
            })}
          </View>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  panel: {
    borderRadius: Radius,
    borderWidth: 1,
    padding: Spacing.four,
    gap: Spacing.three,
  },
  panelTop: { flexDirection: 'row', alignItems: 'center', gap: Spacing.three },
  ticks: { flexDirection: 'row', gap: Spacing.two },
  tick: {
    flex: 1,
    height: 40,
    borderRadius: 999,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  segment: {
    flexDirection: 'row',
    borderRadius: 20,
    padding: 4,
    gap: 4,
    maxWidth: 460,
  },
  segmentItem: {
    flex: 1,
    borderRadius: RadiusControl,
    paddingVertical: Spacing.two + 2,
    paddingHorizontal: Spacing.three,
  },
  facts: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    columnGap: Spacing.four,
    rowGap: Spacing.one,
  },
  fact: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  list: { borderRadius: Radius, borderWidth: 1, overflow: 'hidden' },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    paddingVertical: Spacing.three,
    paddingHorizontal: Spacing.three + 4,
    minHeight: 64,
  },
});
