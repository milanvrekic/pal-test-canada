import { useLocalSearchParams, useRouter } from 'expo-router';
import type { Metadata } from 'expo-router/server';
import { useEffect, useRef, useState } from 'react';
import { Alert, Platform, Pressable, StyleSheet, View } from 'react-native';

import { AnswerOption, Feedback, sourceLine } from '@/components/answer';
import { FeaturedHandoff, HandoffCards } from '@/components/handoff-cards';
import { VerdictBar } from '@/components/verdict-bar';
import { ThemedText } from '@/components/themed-text';
import { APP_LAYOUT, Button, Card, Col, Eyebrow, Notice, ProgressBar, Ring, Screen, Split } from '@/components/ui';
import { Radius, RadiusControl, Spacing } from '@/constants/theme';
import {
  type Course,
  type Question,
  PASS_MARK,
  buildExam,
  buildPractice,
  dueForReview,
  shuffleOptions,
  recordAnswer,
  recordExam,
  today,
  topicLabel,
} from '@/features/quiz/engine';
import { useTheme } from '@/hooks/use-theme';
import { track } from '@/lib/analytics';
import { questions } from '@/lib/content';
import { updateProgress, useProgress } from '@/lib/progress';
import { page } from '@/lib/seo';

export function generateMetadata(): Metadata {
  return page('/quiz', {
    title: 'CFSC and CRFSC practice test | PAL Test Canada',
    description: 'Practice questions for the Canadian Firearms Safety Course, with handbook citations.',
    noindex: true,
  });
}

type Mode = 'practice' | 'exam' | 'review' | 'mock';

/** Practice time limit for the test-day mock. Not the official limit: instructors set the real one. */
const MOCK_MINUTES = 60;

const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);

export default function Quiz() {
  const params = useLocalSearchParams();
  const course: Course = one(params.course) === 'crfsc' ? 'crfsc' : 'cfsc';
  const rawMode = one(params.mode);
  const mode: Mode = rawMode === 'exam' || rawMode === 'review' || rawMode === 'mock' ? rawMode : 'practice';
  const topic = one(params.topic);
  // A new key starts a fresh session when "Go again" changes the t parameter.
  return <Session key={`${course}:${mode}:${topic ?? ''}:${one(params.t) ?? ''}`} course={course} mode={mode} topic={topic} />;
}

function Session({ course, mode, topic }: { course: Course; mode: Mode; topic: string | undefined }) {

  const { progress, loaded } = useProgress();
  const [set, setSet] = useState<Question[] | null>(null);
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [picks, setPicks] = useState<number[]>([]);
  const [quitting, setQuitting] = useState(false);
  const [deadline, setDeadline] = useState<number | null>(null);
  const [now, setNow] = useState(() => Date.now());
  // Keyboard answering on the web: A–F or 1–6 picks an answer, Enter goes on. The handlers change every render, so the
  // listener (added once) calls whatever the latest render stored here.
  const keys = useRef<{ choose?: (i: number) => void; next?: () => void; count: number }>({ count: 0 });
  useEffect(() => {
    if (Platform.OS !== 'web' || typeof window === 'undefined') return;
    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey || (e.key.length !== 1 && e.key !== 'Enter')) return;
      const target = e.target as HTMLElement | null;
      if (target?.tagName === 'INPUT' || target?.tagName === 'TEXTAREA') return;
      const k = e.key.toLowerCase();
      const i = Math.max('abcdef'.indexOf(k), '123456'.indexOf(k));
      if (e.key !== 'Enter' && i >= 0 && i < keys.current.count && keys.current.choose) {
        e.preventDefault();
        keys.current.choose(i);
      } else if (e.key === 'Enter' && keys.current.next) {
        // Enter on a focused button already presses it; don't press Next a second time.
        if (target?.closest?.('button,a,[role="button"],[role="link"],[role="radio"]')) return;
        e.preventDefault();
        keys.current.next();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  // Test-day mock: start the clock once the questions are ready, tick every second.
  useEffect(() => {
    if (mode !== 'mock' || !set || deadline) return;
    setDeadline(Date.now() + MOCK_MINUTES * 60_000);
  }, [mode, set, deadline]);
  useEffect(() => {
    if (!deadline) return;
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, [deadline]);
  const remaining = deadline ? Math.max(0, deadline - now) : null;
  const timeUp = remaining === 0 && !!set && index < set.length;
  useEffect(() => {
    if (!timeUp || !set) return;
    // Unanswered questions count as wrong, as on a real test.
    const allPicks = [...picks, ...Array(set.length - picks.length).fill(-1)];
    const correct = set.filter((item, i) => allPicks[i] === item.answer).length;
    updateProgress((p) => recordExam(p, { course, date: today(), correct, total: set.length }));
    track({ name: 'test_completed', course, mode, correct, total: set.length });
    setPicks(allPicks);
    setIndex(set.length);
  }, [timeUp]); // eslint-disable-line react-hooks/exhaustive-deps
  const router = useRouter();

  // Build the question set once, after saved progress has loaded.
  useEffect(() => {
    if (!loaded || set) return;
    if (mode === 'exam' || mode === 'mock') setSet(buildExam(questions, course));
    else if (mode === 'review') setSet(dueForReview(questions, progress, course, today()).map((q) => shuffleOptions(q)));
    else setSet(buildPractice(questions, progress, { course, topic }));
  }, [loaded, set, mode, course, topic, progress]);

  if (!set) {
    return (
      <Screen>
        <ThemedText themeColor="textSecondary">Loading questions…</ThemedText>
      </Screen>
    );
  }

  const title = mode === 'mock' ? 'Test-day mock' : mode === 'exam' ? 'Practice exam' : mode === 'review' ? 'Review' : topic ? topicLabel(topic) : 'Quick practice';
  const heading = `${course.toUpperCase()} · ${title}`;

  if (set.length === 0) {
    return (
      <Screen>
        <ThemedText type="heading">{heading}</ThemedText>
        <ThemedText themeColor="textSecondary">Nothing to review right now. Missed questions come back here when they are due.</ThemedText>
        <Button label="Back to home" href="/" />
      </Screen>
    );
  }

  if (index >= set.length) return <Results heading={heading} set={set} picks={picks} mode={mode} course={course} />;

  const q = set[index];
  const showFeedback = mode !== 'exam' && mode !== 'mock' && selected !== null;

  const choose = (i: number) => {
    if (showFeedback) return;
    setSelected(i);
  };

  const next = () => {
    if (selected === null) return;
    const allPicks = [...picks, selected];
    updateProgress((p) => recordAnswer(p, q.id, selected === q.answer, today()));
    if (index + 1 === set.length) {
      const correct = set.filter((item, i) => allPicks[i] === item.answer).length;
      if (mode === 'exam' || mode === 'mock') updateProgress((p) => recordExam(p, { course, date: today(), correct, total: set.length }));
      track({ name: 'test_completed', course, mode, correct, total: set.length });
    }
    setPicks(allPicks);
    setSelected(null);
    setIndex(index + 1);
  };
  keys.current = quitting ? { count: 0 } : { choose, next, count: q.options.length };

  const isLast = index + 1 === set.length;
  const verdict = showFeedback ? (selected === q.answer ? 'correct' : 'wrong') : null;
  const nextBar = (
    <VerdictBar
      verdict={verdict}
      hint={(mode === 'exam' || mode === 'mock') && selected !== null ? 'Saved' : 'Pick an answer'}
      detail={verdict === 'wrong' ? `Correct answer: ${q.options[q.answer]}` : undefined}
      label={isLast ? 'Finish' : verdict ? 'Continue' : 'Next'}
      onPress={next}
      disabled={selected === null}
    />
  );

  const isExam = mode === 'exam' || mode === 'mock';
  // Leave the quiz the same way every other pushed screen does. dismissTo('/') was reported to do nothing on iOS,
  // likely because Home sits inside the tabs, not directly in the root stack.
  const leave = () => (router.canGoBack() ? router.back() : router.replace('/'));
  // Back and Quit both ask first. In the apps that is a native alert, always on screen; an inline card above the
  // question was out of view whenever the page was scrolled, so the buttons seemed to do nothing.
  const askQuit = () => {
    if (Platform.OS === 'web') return setQuitting(true);
    Alert.alert(
      `Quit this ${isExam ? 'exam' : 'session'}?`,
      isExam
        ? 'Answers so far are kept for review, but this exam will not count toward your readiness score.'
        : 'Answers so far are kept for review.',
      [
        { text: 'Keep going', style: 'cancel' },
        { text: 'Quit', style: 'destructive', onPress: leave },
      ],
    );
  };

  return (
    <Screen onBack={askQuit} bottomBar={nextBar} bottomTone={verdict === 'correct' ? 'success' : verdict === 'wrong' ? 'danger' : null}>
      <View style={{ gap: Spacing.two }}>
        <View style={styles.headRow}>
          <Eyebrow>{heading}</Eyebrow>
          <View style={{ flex: 1 }} />
          {remaining !== null ? (
            <ThemedText type="statSmall" themeColor={remaining < 5 * 60_000 ? 'danger' : 'textSecondary'} accessibilityLabel={`${Math.ceil(remaining / 60_000)} minutes left`}>
              {String(Math.floor(remaining / 60_000)).padStart(2, '0')}:{String(Math.floor((remaining % 60_000) / 1000)).padStart(2, '0')}
            </ThemedText>
          ) : null}
          <ThemedText type="statSmall" style={styles.count}>
            {index + 1}
            <ThemedText type="statSmall" themeColor="textSecondary">
              {' '}/ {set.length}
            </ThemedText>
          </ThemedText>
          <Pressable accessibilityRole="button" accessibilityLabel="Quit" onPress={askQuit} hitSlop={8} style={styles.quit}>
            <ThemedText type="smallBold" themeColor="textSecondary">
              Quit
            </ThemedText>
          </Pressable>
        </View>
        <ProgressBar value={(index + 1) / set.length} height={12} />
      </View>

      {quitting ? (
        <Card>
          <ThemedText type="bold">Quit this {isExam ? 'exam' : 'session'}?</ThemedText>
          <ThemedText type="small" themeColor="textSecondary">
            {isExam
              ? 'Answers so far are kept for review, but this exam will not count toward your readiness score.'
              : 'Answers so far are kept for review.'}
          </ThemedText>
          <Split gap={Spacing.two}>
            <Col basis={160}>
              <Button variant="secondary" label="Keep going" onPress={() => setQuitting(false)} />
            </Col>
            <Col basis={160}>
              <Button label="Quit" onPress={leave} />
            </Col>
          </Split>
        </Card>
      ) : null}

      <ThemedText type="subheading" accessibilityRole="header" style={styles.question}>
        {q.question}
      </ThemedText>

      <View style={{ gap: Spacing.two }} accessibilityRole="radiogroup">
        {q.options.map((opt, i) => (
          <AnswerOption
            key={opt}
            letter={LETTERS[i] ?? String(i + 1)}
            label={opt}
            state={
              showFeedback ? (i === q.answer ? 'correct' : i === selected ? 'wrong' : 'idle') : i === selected ? 'selected' : 'idle'
            }
            dimmed={showFeedback && i !== q.answer && i !== selected}
            onPress={() => choose(i)}
          />
        ))}
      </View>

      {showFeedback ? (
        <Feedback good={selected === q.answer} title="Why" explanation={q.explanation} source={sourceLine(q.source)} />
      ) : null}
      {Platform.OS === 'web' && !APP_LAYOUT ? (
        <ThemedText type="small" themeColor="textSecondary">
          Keyboard: press A to {LETTERS[q.options.length - 1]} to answer, Enter for the next question.
        </ThemedText>
      ) : null}
    </Screen>
  );
}

const LETTERS = ['A', 'B', 'C', 'D', 'E', 'F'];

function Results({ heading, set, picks, mode, course }: { heading: string; set: Question[]; picks: number[]; mode: Mode; course: Course }) {
  const correct = set.filter((q, i) => picks[i] === q.answer).length;
  const score = correct / set.length;
  const passed = score >= PASS_MARK;
  const missed = set.map((q, i) => ({ q, pick: picks[i] })).filter(({ q, pick }) => pick !== q.answer);
  const theme = useTheme();
  return (
    <Screen>
      <ResultsHead heading={heading} correct={correct} total={set.length} score={score} passed={passed} exam={mode === 'exam' || mode === 'mock'} />
      {mode === 'exam' || mode === 'mock' ? (
        <Notice tone={passed ? 'success' : 'danger'}>
          {passed
            ? 'That is a pass. The real tests need 80% on both the written and the practical.'
            : `The pass mark is ${Math.round(PASS_MARK * 100)}%. Review the questions below and try again.`}
        </Notice>
      ) : null}

      <View style={{ gap: Spacing.two }}>
        <Split gap={Spacing.two}>
          <Col basis={200}>
            <Button variant="signal" label="Go again" href={{ pathname: '/quiz', params: { course, mode, t: String(Date.now()) } }} />
          </Col>
          <Col basis={200}>
            <Button variant="secondary" label="Back to home" href="/" />
          </Col>
        </Split>
      </View>

      {missed.length ? (
        <View style={{ gap: Spacing.two }}>
          <ThemedText type="heading" accessibilityRole="header">
            Questions to review
          </ThemedText>
          <ThemedText type="small" themeColor="textSecondary">
            These come back in Review tomorrow, then after 3 and 7 days, until you get them right each time.
          </ThemedText>
          {missed.map(({ q, pick }) => (
            <Card key={q.id} style={[styles.explain, { borderLeftColor: theme.danger }]}>
              <ThemedText type="bold">{q.question}</ThemedText>
              <ThemedText type="small" themeColor="danger">
                {pick >= 0 ? `Your answer: ${q.options[pick]}` : "Not answered: time ran out"}
              </ThemedText>
              <ThemedText type="small" themeColor="success">
                Correct answer: {q.options[q.answer]}
              </ThemedText>
              <ThemedText>{q.explanation}</ThemedText>
            </Card>
          ))}
        </View>
      ) : (
        <Notice tone="success">No missed questions.</Notice>
      )}

      {mode === 'mock' ? (
        <Card style={{ gap: Spacing.three }}>
          <ThemedText type="heading">Now the practical</ThemedText>
          <ThemedText themeColor="textSecondary">
            The real course ends with a handling test as well, and it needs 80% too. Run the practical trainer to finish your mock.
          </ThemedText>
          <Button label="Start the practical trainer" href="/practical" />
        </Card>
      ) : null}
      {passed ? (
        // A success moment: one app, picked for the course they're studying.
        <FeaturedHandoff
          placement={mode === 'exam' || mode === 'mock' ? 'exam_pass' : 'practice_results'}
          app={course === 'crfsc' ? 'shootable' : 'huntable'}
          headline={course === 'crfsc' ? 'Where will you shoot once you have your RPAL?' : "Planning to hunt once you're licensed?"}
          more={course === 'crfsc' ? ['huntable', 'fishable'] : ['fishable', 'campable']}
        />
      ) : mode === 'exam' || mode === 'mock' ? (
        <HandoffCards placement="exam_fail" title="For when you pass" lead="Free apps from the same team, for after your licence arrives." />
      ) : (
        <HandoffCards placement="practice_results" title="After your course" />
      )}
    </Screen>
  );
}

function ResultsHead({ heading, correct, total, score, passed, exam }: { heading: string; correct: number; total: number; score: number; passed: boolean; exam: boolean }) {
  const theme = useTheme();
  const good = !exam || passed;
  return (
    <View style={[styles.resultHead, { backgroundColor: good ? theme.successBg : theme.tintSand }]}>
      <Ring value={score} size={132} stroke={12} color={good ? theme.success : theme.danger} track="rgba(0,0,0,0.07)" label={`${Math.round(score * 100)}%`} />
      <View style={{ alignItems: 'center', gap: Spacing.one }}>
        <Eyebrow>{heading}</Eyebrow>
        <ThemedText type="title" accessibilityRole="header" style={{ textAlign: 'center' }}>
          {exam ? (passed ? 'That’s a pass' : 'Not a pass yet') : 'Round complete'}
        </ThemedText>
        <ThemedText themeColor="textSecondary" style={{ textAlign: 'center' }}>
          {correct} of {total} correct{exam ? ` · pass mark ${Math.round(PASS_MARK * 100)}%` : ''}
        </ThemedText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  headRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.three },
  count: { fontVariant: ['tabular-nums'] },
  quit: { minHeight: 44, minWidth: 44, alignItems: 'flex-end', justifyContent: 'center' },
  question: { marginTop: Spacing.two, fontSize: 21, lineHeight: 29 },
  explain: { borderLeftWidth: 4 },
  barRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', gap: Spacing.three },
  barHint: { flex: 1 },
  resultHead: { borderRadius: Radius + 4, padding: Spacing.five, gap: Spacing.three, alignItems: 'center' },
  resultRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.three },
  track: { height: 8, borderRadius: 4, overflow: 'visible', position: 'relative' },
  fill: { height: 8, borderRadius: 4 },
  passLine: { position: 'absolute', top: -4, width: 2, height: 16 },
});
