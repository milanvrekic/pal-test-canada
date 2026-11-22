import { useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { HandoffCards } from '@/components/handoff-cards';
import { ThemedText } from '@/components/themed-text';
import { Button, Card, Notice, ProgressBar, Screen } from '@/components/ui';
import { Radius, Spacing } from '@/constants/theme';
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

type Mode = 'practice' | 'exam' | 'review';

const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);

export default function Quiz() {
  const params = useLocalSearchParams();
  const course: Course = one(params.course) === 'crfsc' ? 'crfsc' : 'cfsc';
  const rawMode = one(params.mode);
  const mode: Mode = rawMode === 'exam' || rawMode === 'review' ? rawMode : 'practice';
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

  // Build the question set once, after saved progress has loaded.
  useEffect(() => {
    if (!loaded || set) return;
    if (mode === 'exam') setSet(buildExam(questions, course));
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

  const title = mode === 'exam' ? 'Practice exam' : mode === 'review' ? 'Review' : topic ? topicLabel(topic) : 'Quick practice';
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
  const showFeedback = mode !== 'exam' && selected !== null;

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
      if (mode === 'exam') updateProgress((p) => recordExam(p, { course, date: today(), correct, total: set.length }));
      track({ name: 'test_completed', course, mode, correct, total: set.length });
    }
    setPicks(allPicks);
    setSelected(null);
    setIndex(index + 1);
  };

  return (
    <Screen>
      <View style={{ gap: Spacing.two }}>
        <ThemedText type="smallBold" themeColor="textSecondary">
          {heading} · Question {index + 1} of {set.length}
        </ThemedText>
        <ProgressBar value={index / set.length} />
      </View>

      <ThemedText type="subheading" accessibilityRole="header">
        {q.question}
      </ThemedText>

      <View style={{ gap: Spacing.two }}>
        {q.options.map((opt, i) => (
          <Option
            key={opt}
            label={opt}
            state={
              showFeedback ? (i === q.answer ? 'correct' : i === selected ? 'wrong' : 'idle') : i === selected ? 'selected' : 'idle'
            }
            onPress={() => choose(i)}
          />
        ))}
      </View>

      {showFeedback ? <Explanation q={q} wasCorrect={selected === q.answer} /> : null}

      <Button label={index + 1 === set.length ? 'Finish' : 'Next'} onPress={next} disabled={selected === null} />
    </Screen>
  );
}

function Option({ label, state, onPress }: { label: string; state: 'idle' | 'selected' | 'correct' | 'wrong'; onPress: () => void }) {
  const theme = useTheme();
  const look = {
    idle: { borderColor: theme.border, backgroundColor: theme.background },
    selected: { borderColor: theme.accent, backgroundColor: theme.backgroundElement },
    correct: { borderColor: theme.success, backgroundColor: theme.successBg },
    wrong: { borderColor: theme.danger, backgroundColor: theme.dangerBg },
  }[state];
  const suffix = state === 'correct' ? ' (correct answer)' : state === 'wrong' ? ' (your answer)' : '';
  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityState={{ selected: state === 'selected' || state === 'wrong' }}
      accessibilityLabel={label + suffix}
      onPress={onPress}
      style={[styles.option, look]}>
      <ThemedText>{label}</ThemedText>
      {suffix ? (
        <ThemedText type="small" themeColor={state === 'correct' ? 'success' : 'danger'}>
          {state === 'correct' ? 'Correct answer' : 'Your answer'}
        </ThemedText>
      ) : null}
    </Pressable>
  );
}

function Explanation({ q, wasCorrect }: { q: Question; wasCorrect: boolean }) {
  const cite = [q.source.section, q.source.edition ? `Handbook ${q.source.edition}` : null, q.source.page ? `p. ${q.source.page}` : null]
    .filter(Boolean)
    .join(' · ');
  return (
    <Card>
      <ThemedText type="bold" themeColor={wasCorrect ? 'success' : 'danger'}>
        {wasCorrect ? 'Correct' : 'Not quite'}
      </ThemedText>
      <ThemedText>{q.explanation}</ThemedText>
      {cite ? (
        <ThemedText type="small" themeColor="textSecondary">
          {cite}
        </ThemedText>
      ) : null}
    </Card>
  );
}

function Results({ heading, set, picks, mode, course }: { heading: string; set: Question[]; picks: number[]; mode: Mode; course: Course }) {
  const correct = set.filter((q, i) => picks[i] === q.answer).length;
  const score = correct / set.length;
  const passed = score >= PASS_MARK;
  const missed = set.map((q, i) => ({ q, pick: picks[i] })).filter(({ q, pick }) => pick !== q.answer);
  return (
    <Screen>
      <ThemedText type="smallBold" themeColor="textSecondary">
        {heading}
      </ThemedText>
      <ThemedText type="title" accessibilityRole="header">
        {correct} of {set.length} ({Math.round(score * 100)}%)
      </ThemedText>
      {mode === 'exam' ? (
        <Notice tone={passed ? 'success' : 'danger'}>
          {passed
            ? 'That is a pass. The real tests need 80% on both the written and the practical.'
            : `The pass mark is ${Math.round(PASS_MARK * 100)}%. Review the questions below and try again.`}
        </Notice>
      ) : null}

      <View style={{ gap: Spacing.two }}>
        <Button label="Back to home" href="/" />
        <Button variant="secondary" label="Go again" href={{ pathname: '/quiz', params: { course, mode, t: String(Date.now()) } }} />
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
            <Card key={q.id}>
              <ThemedText type="bold">{q.question}</ThemedText>
              <ThemedText type="small" themeColor="danger">
                Your answer: {q.options[pick]}
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

      {mode === 'exam' && passed ? <HandoffCards placement="exam_results" /> : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  option: { borderWidth: 2, borderRadius: Radius, padding: Spacing.three, gap: Spacing.one, minHeight: 48, justifyContent: 'center' },
});
