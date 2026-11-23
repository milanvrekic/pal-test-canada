import { Link, type Href } from 'expo-router';
import type { Metadata } from 'expo-router/server';

import { page } from '@/lib/seo';
import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Svg, { Defs, RadialGradient, Rect, Stop } from 'react-native-svg';

import { HandoffCards } from '@/components/handoff-cards';
import { TryScene } from '@/components/try-scene';
import { ThemedText } from '@/components/themed-text';
import { Button, Col, Eyebrow, LinkCard, Ring, Screen, Split } from '@/components/ui';
import { Glass, Radius, RadiusControl, Spacing, TINTS } from '@/constants/theme';
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
      <View style={styles.hero}>
        <HeroGlow />
        <Split gap={Spacing.five} style={{ alignItems: 'center' }}>
          <Col basis={420} grow={5} style={{ gap: Spacing.four }}>
            <View style={[styles.chip, Glass]}>
              <View style={[styles.dot, { backgroundColor: '#4ADE80' }]} />
              <ThemedText type="smallBold" style={{ color: '#E6E7EB' }}>
                Free · Instructor-reviewed
              </ThemedText>
            </View>
            <ThemedText type="display" accessibilityRole="header" style={{ color: '#FFFFFF' }}>
              Pass your PAL course <ThemedText type="display" style={{ color: '#FF8A7A' }}>the first time.</ThemedText>
            </ThemedText>
            <ThemedText style={{ color: '#B4B8C2', fontSize: 18, lineHeight: 28, maxWidth: 520 }}>
              Practice tests for the CFSC and CRFSC, written from the student handbook. No account, no ads. Your progress
              stays on this device.
            </ThemedText>

            <View style={[styles.segment, Glass]} accessibilityRole="radiogroup" accessibilityLabel="Which course are you taking?">
              {COURSES.map((c) => {
                const active = c.id === course;
                return (
                  <Pressable
                    key={c.id}
                    accessibilityRole="radio"
                    accessibilityState={{ checked: active }}
                    onPress={() => setCourse(c.id)}
                    style={[styles.segmentItem, active ? styles.segmentActive : null]}
                  >
                    <ThemedText type="bold" style={{ color: active ? '#0A0B0E' : '#FFFFFF' }}>
                      {c.label}
                    </ThemedText>
                    <ThemedText type="small" style={{ color: active ? '#5B5F69' : '#A3A7B2' }}>
                      {c.sub}
                    </ThemedText>
                  </Pressable>
                );
              })}
            </View>

            <View style={styles.ctaRow}>
              <Button size="lg" variant="inverse" label="Start practice exam" href={{ pathname: '/quiz', params: { course, mode: 'exam' } }} />
              <Button size="lg" variant="glass" label="Quick practice" href={{ pathname: '/quiz', params: { course, mode: 'practice' } }} />
            </View>
            <View style={styles.facts}>
              {[`${questions.length} questions`, `${drills.length} photo drills`, `${examSize}-question exams`, 'No sign-up'].map((f) => (
                <ThemedText key={f} type="small" style={{ color: '#A3A7B2' }}>
                  <ThemedText type="smallBold" style={{ color: '#4ADE80' }}>✓ </ThemedText>
                  {f}
                </ThemedText>
              ))}
            </View>
          </Col>
          <Col basis={360} grow={4}>
            <TryScene />
          </Col>
        </Split>
      </View>

      {due > 0 ? (
        <Button variant="secondary" label={`Review ${due} missed question${due === 1 ? '' : 's'}`} href={{ pathname: '/quiz', params: { course, mode: 'review' } }} />
      ) : null}

      <Split>
        <Col basis={380} grow={3}>
          <ReadinessPanel loaded={loaded} hasHistory={hasHistory} ready={ready} exams={exams} />
        </Col>
        <Col basis={240} grow={2}>
          <BentoTile
            href="/wait-times"
            tint="tintBlue"
            eyebrow={tracking ? 'Your licence tracker' : 'Licence wait times'}
            stat="28"
            statNote="day legal minimum"
            body={tracking ? 'See how your wait compares with other applicants.' : 'How long applicants wait for a PAL, plus a tracker for yours.'}
          />
        </Col>
        <Col basis={240} grow={2}>
          <BentoTile
            href="/guides/what-fails-people"
            tint="tintSand"
            eyebrow="What fails people"
            stat="80%"
            statNote="to pass each test"
            body="Most failures are handling habits, not missing knowledge. How to fix them."
          />
        </Col>
      </Split>

      <View style={{ gap: Spacing.three }}>
        <ThemedText type="heading" accessibilityRole="header">
          Study tools
        </ThemedText>
        <Split gap={Spacing.two + 4}>
          {[
            { href: '/practical' as Href, title: 'Practical trainer', body: 'Put PROVE and handling steps in order, then say them out loud.', tint: 'tintRed' as const },
            { href: { pathname: '/quiz', params: { course, mode: 'mock' } } as Href, title: 'Test-day mock', body: `${examSize} questions against a 60-minute clock, then the practical.`, tint: 'tintLilac' as const },
            { href: '/flashcards' as Href, title: 'Flashcards', body: 'Question on the front, answer and handbook page on the back.', tint: 'tintGreen' as const },
            { href: '/rules' as Href, title: 'Storage and transport rules', body: 'Pick the firearm and situation, see what the law requires.', tint: 'tintSand' as const },
          ].map((t) => (
            <Col key={t.title} basis={240}>
              <Link href={t.href} asChild>
                <Pressable accessibilityRole="link" style={{ flexGrow: 1 }}>
                  {({ pressed }) => (
                    <View style={[styles.toolTile, { backgroundColor: theme[t.tint] }, pressed ? { transform: [{ scale: 0.98 }] } : null]}>
                      <ThemedText type="heading">{t.title}</ThemedText>
                      <ThemedText type="small" themeColor="textSecondary">
                        {t.body}
                      </ThemedText>
                      <ThemedText type="smallBold" style={{ marginTop: 'auto' }}>
                        Open →
                      </ThemedText>
                    </View>
                  )}
                </Pressable>
              </Link>
            </Col>
          ))}
        </Split>
      </View>

      <View style={{ gap: Spacing.three }}>
        <View style={styles.sectionHead}>
          <ThemedText type="heading" accessibilityRole="header">
            {hasHistory ? 'Your topics, weakest first' : 'Practice by topic'}
          </ThemedText>
          <ThemedText type="small" themeColor="textSecondary">
            {course.toUpperCase()} · {bank.length} questions
          </ThemedText>
        </View>
        <Split gap={Spacing.two + 4}>
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

/** A tinted bento tile that links somewhere, with one big number. */
function BentoTile({ href, tint, eyebrow, stat, statNote, body }: { href: Href; tint: (typeof TINTS)[number]; eyebrow: string; stat: string; statNote: string; body: string }) {
  const theme = useTheme();
  return (
    <Link href={href} asChild>
      <Pressable accessibilityRole="link" style={{ flexGrow: 1 }}>
        {({ pressed }) => (
          <View style={[styles.tile, { backgroundColor: theme[tint] }, pressed ? { transform: [{ scale: 0.98 }] } : null]}>
            <View style={styles.tileHead}>
              <ThemedText type="eyebrow">{eyebrow}</ThemedText>
              <View style={[styles.arrow, { backgroundColor: theme.backgroundElement }]}>
                <ThemedText type="bold" style={{ lineHeight: 18 }}>
                  →
                </ThemedText>
              </View>
            </View>
            <View style={{ marginTop: 'auto', gap: Spacing.one }}>
              <View style={styles.bandStat}>
                <ThemedText type="stat">{stat}</ThemedText>
                <ThemedText type="smallBold" themeColor="textSecondary" style={{ flex: 1, paddingBottom: 8 }}>
                  {statNote}
                </ThemedText>
              </View>
              <ThemedText type="small" themeColor="textSecondary">
                {body}
              </ThemedText>
            </View>
          </View>
        )}
      </Pressable>
    </Link>
  );
}

/** Soft red and amber light on the dark hero (SVG radial gradients render the same on web and native). */
function HeroGlow() {
  return (
    <Svg style={StyleSheet.absoluteFill} width="100%" height="100%" preserveAspectRatio="none" viewBox="0 0 100 100" accessibilityElementsHidden importantForAccessibility="no">
      <Defs>
        <RadialGradient id="g1" cx="85%" cy="10%" rx="55%" ry="70%" fx="85%" fy="10%">
          <Stop offset="0" stopColor="#E5322D" stopOpacity={0.55} />
          <Stop offset="1" stopColor="#E5322D" stopOpacity={0} />
        </RadialGradient>
        <RadialGradient id="g2" cx="5%" cy="100%" rx="55%" ry="60%" fx="5%" fy="100%">
          <Stop offset="0" stopColor="#F59E0B" stopOpacity={0.28} />
          <Stop offset="1" stopColor="#F59E0B" stopOpacity={0} />
        </RadialGradient>
      </Defs>
      <Rect x="0" y="0" width="100" height="100" fill="url(#g1)" />
      <Rect x="0" y="0" width="100" height="100" fill="url(#g2)" />
    </Svg>
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
        : 'Score 90% or better on three practice exams in a row, with no weak topic. The real written test needs 80%.';
  return (
    <View style={[styles.panel, { backgroundColor: theme.backgroundElement, borderColor: theme.border }]}>
      <View style={styles.panelTop}>
        <Ring
          value={strong / READY_EXAMS}
          size={96}
          stroke={9}
          color={theme.success}
          label={`${strong}/${READY_EXAMS}`}
        />
        <View style={{ flex: 1, gap: Spacing.one }}>
          <ThemedText type="eyebrow" themeColor="textSecondary">Readiness</ThemedText>
          <ThemedText type="heading">{status}</ThemedText>
          <ThemedText type="small" themeColor="textSecondary">
            {detail}
          </ThemedText>
        </View>
      </View>
      <View style={styles.ticks} accessibilityLabel={`${strong} of ${READY_EXAMS} recent exams at 90% or better`}>
        {Array.from({ length: READY_EXAMS }, (_, i) => {
          const e = recent[i];
          const ok = e ? e.correct / e.total >= READY_MARK : false;
          return (
            <View
              key={i}
              style={[
                styles.tick,
                { borderColor: ok ? theme.success : theme.border, backgroundColor: ok ? theme.successBg : e ? theme.dangerBg : theme.background },
              ]}>
              <ThemedText type="smallBold" style={{ color: ok ? theme.successDark : theme.textSecondary, fontVariant: ['tabular-nums'] }}>
                {e ? `${Math.round((e.correct / e.total) * 100)}%` : `Exam ${i + 1}`}
              </ThemedText>
            </View>
          );
        })}
      </View>
      {last ? null : (
        <ThemedText type="small" themeColor="textSecondary">
          Your practice exam scores will fill these in.
        </ThemedText>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  drillPhoto: { width: '100%', aspectRatio: 16 / 9, overflow: 'hidden' },
  fill: { width: '100%', height: '100%' },
  band: { height: 132, padding: Spacing.three + 4, justifyContent: 'space-between' },
  bandStat: { flexDirection: 'row', alignItems: 'flex-end', gap: Spacing.two },
  switch: { flexDirection: 'row', gap: Spacing.two },
  switchItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two + 4,
    borderWidth: 2,
    borderBottomWidth: 4,
    borderRadius: RadiusControl,
    paddingVertical: Spacing.two + 4,
    paddingHorizontal: Spacing.three,
  },
  radio: { width: 20, height: 20, borderRadius: 10, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  radioDot: { width: 10, height: 10, borderRadius: 5 },
  panel: { borderRadius: 28, borderWidth: 1, padding: Spacing.four, gap: Spacing.three, flexGrow: 1 },
  panelTop: { flexDirection: 'row', alignItems: 'center', gap: Spacing.three },
  ticks: { flexDirection: 'row', gap: Spacing.two },
  tick: { flex: 1, height: 40, borderRadius: 999, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  hero: { backgroundColor: '#0A0B0E', borderRadius: 32, overflow: 'hidden', padding: Spacing.four, paddingVertical: Spacing.five },
  chip: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two, alignSelf: 'flex-start', borderRadius: 999, borderWidth: 1, borderColor: 'rgba(255,255,255,0.14)', backgroundColor: 'rgba(255,255,255,0.06)', paddingHorizontal: Spacing.three, paddingVertical: 6 },
  dot: { width: 8, height: 8, borderRadius: 4 },
  segment: { flexDirection: 'row', borderRadius: 20, borderWidth: 1, borderColor: 'rgba(255,255,255,0.14)', backgroundColor: 'rgba(255,255,255,0.06)', padding: 4, gap: 4, maxWidth: 460 },
  segmentItem: { flex: 1, borderRadius: 16, paddingVertical: Spacing.two + 2, paddingHorizontal: Spacing.three },
  segmentActive: { backgroundColor: '#FFFFFF' },
  ctaRow: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.two + 4 },
  toolTile: { borderRadius: 24, padding: Spacing.four, gap: Spacing.two, flexGrow: 1, minHeight: 170 },
  tile: { borderRadius: 28, padding: Spacing.four, gap: Spacing.three, flexGrow: 1, minHeight: 230 },
  tileHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: Spacing.two },
  arrow: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  facts: { flexDirection: 'row', flexWrap: 'wrap', columnGap: Spacing.four, rowGap: Spacing.one },
  fact: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two },
  factTick: { width: 20, height: 20, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  sectionHead: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between', flexWrap: 'wrap', gap: Spacing.two },
  topicCard: { flexDirection: 'row', alignItems: 'center', gap: Spacing.three, borderRadius: Radius, paddingVertical: Spacing.three, paddingHorizontal: Spacing.three + 4, minHeight: 80 },
  topicRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: Spacing.two },
});
