import { StyleSheet, View } from 'react-native';

import { HandoffCards } from '@/components/handoff-cards';
import { ThemedText } from '@/components/themed-text';
import { Button, Card, Screen } from '@/components/ui';
import { Radius, Spacing } from '@/constants/theme';
import { type Course, type Question, topicGroup, topicLabel } from '@/features/quiz/engine';
import { useTheme } from '@/hooks/use-theme';
import { questions } from '@/lib/content';

/**
 * Sample questions for a search landing page: approved questions only, spread across topics (round-robin by practice
 * group, then by id), so the page is stable between builds unless the bank changes.
 */
export function sampleQuestions(course: Course, n: number): Question[] {
  const byGroup = new Map<string, Question[]>();
  for (const q of questions.filter((x) => x.course === course && !x.draft).sort((a, b) => a.id.localeCompare(b.id))) {
    const g = topicGroup(q.topic);
    byGroup.set(g, [...(byGroup.get(g) ?? []), q]);
  }
  const groups = [...byGroup.keys()].sort();
  const out: Question[] = [];
  for (let round = 0; out.length < n; round++) {
    let added = false;
    for (const g of groups) {
      const q = byGroup.get(g)?.at(round);
      if (q && out.length < n) {
        out.push(q);
        added = true;
      }
    }
    if (!added) break;
  }
  return out;
}

export const bankSize = (course: Course) => questions.filter((q) => q.course === course && !q.draft).length;

function SampleQuestion({ q, n }: { q: Question; n: number }) {
  const theme = useTheme();
  return (
    <Card>
      <ThemedText type="small" themeColor="textSecondary">
        {n}. {topicLabel(topicGroup(q.topic))}
      </ThemedText>
      <ThemedText type="bold">{q.question}</ThemedText>
      <View style={{ gap: Spacing.one }}>
        {q.options.map((o, i) => (
          <View
            key={o}
            style={[
              styles.option,
              { borderColor: i === q.answer ? theme.accent : theme.border, backgroundColor: i === q.answer ? theme.backgroundSelected : 'transparent' },
            ]}>
            <ThemedText type={i === q.answer ? 'smallBold' : 'small'} style={{ flex: 1 }}>
              {String.fromCharCode(65 + i)}. {o}
            </ThemedText>
            {i === q.answer ? (
              <ThemedText type="smallBold" themeColor="accent">
                Correct
              </ThemedText>
            ) : null}
          </View>
        ))}
      </View>
      <ThemedText type="small">{q.explanation}</ThemedText>
      {q.source.page ? (
        <ThemedText type="small" themeColor="textSecondary">
          Student handbook (2014), {q.source.section ? `${q.source.section}, ` : ''}p. {q.source.page}
        </ThemedText>
      ) : null}
    </Card>
  );
}

export function PracticeLanding({
  title,
  intro,
  sections,
}: {
  title: string;
  intro: string;
  sections: { course: Course; heading: string; count: number }[];
}) {
  return (
    <Screen>
      <View style={{ gap: Spacing.two }}>
        <ThemedText type="title" accessibilityRole="header">
          {title}
        </ThemedText>
        <ThemedText themeColor="textSecondary">{intro}</ThemedText>
      </View>
      <View style={{ gap: Spacing.two }}>
        {sections.map((s) => (
          <Button
            key={s.course}
            variant={s === sections[0] ? 'primary' : 'secondary'}
            label={`Start a 50-question ${s.course.toUpperCase()} practice exam`}
            href={{ pathname: '/quiz', params: { course: s.course, mode: 'exam' } }}
          />
        ))}
      </View>
      {sections.map((s) => {
        const qs = sampleQuestions(s.course, s.count);
        return (
          <View key={s.course} style={{ gap: Spacing.three }}>
            <View style={{ gap: Spacing.one }}>
              <ThemedText type="heading" accessibilityRole="header">
                {s.heading}
              </ThemedText>
              <ThemedText type="small" themeColor="textSecondary">
                {qs.length} of {bankSize(s.course)} questions, each checked by a certified instructor and cited to the student
                handbook.
              </ThemedText>
            </View>
            {qs.map((q, i) => (
              <SampleQuestion key={q.id} q={q} n={i + 1} />
            ))}
            <Button
              label={`Practise all ${bankSize(s.course)} ${s.course.toUpperCase()} questions`}
              href={{ pathname: '/quiz', params: { course: s.course, mode: 'practice' } }}
            />
          </View>
        );
      })}
      <Card>
        <ThemedText type="bold">How the real test works</ThemedText>
        <ThemedText type="small" themeColor="textSecondary">
          Each course ends with a written test and a practical handling test, and you need 80% on each. The practical is where
          most marks are lost, so also try Spot the mistake.
        </ThemedText>
        <Button variant="secondary" label="Spot the mistake" href="/spot" />
        <Button variant="secondary" label="What to expect on test day" href="/guides/exam-day" />
      </Card>
      <HandoffCards placement="guide" title="After your course" />
    </Screen>
  );
}

const styles = StyleSheet.create({
  option: { flexDirection: 'row', gap: Spacing.two, alignItems: 'center', borderWidth: 1, borderRadius: Radius, padding: Spacing.two },
});
