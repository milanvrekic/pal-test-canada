import type { Metadata } from 'expo-router/server';
import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { SvgXml } from 'react-native-svg';

import { ThemedText } from '@/components/themed-text';
import { Button, Card, Notice, ProgressBar, Screen } from '@/components/ui';
import { Radius, Spacing } from '@/constants/theme';
import { shuffle } from '@/features/quiz/engine';
import { useTheme } from '@/hooks/use-theme';
import { track } from '@/lib/analytics';
import { type Drill, drills } from '@/lib/content';

export function generateMetadata(): Metadata {
  return {
    title: 'Spot the mistake: PAL handling drill | PAL Test Canada',
    description: 'Look at each scene and find the handling mistake. Practise for the CFSC and CRFSC practical test.',
  };
}

// The right answer moves around, so position gives nothing away.
function withShuffledOptions(d: Drill): Drill {
  const order = shuffle(d.options.map((_, i) => i));
  return { ...d, options: order.map((i) => d.options[i]), answer: order.indexOf(d.answer) };
}

export default function Spot() {
  const [run, setRun] = useState(0);
  return <SpotSession key={run} onRestart={() => setRun(run + 1)} />;
}

function SpotSession({ onRestart }: { onRestart: () => void }) {
  const theme = useTheme();
  const [set] = useState(() => shuffle(drills).map(withShuffledOptions));
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [correct, setCorrect] = useState(0);

  if (index >= set.length) {
    return (
      <Screen>
        <ThemedText type="title" accessibilityRole="header">
          {correct} of {set.length} spotted
        </ThemedText>
        <ThemedText themeColor="textSecondary">
          On the practical test these mistakes cost the most marks. They are habits, so practise the safe version until it happens without
          thinking.
        </ThemedText>
        <Button label="Try again" onPress={onRestart} />
        <Button variant="secondary" label="Read: what fails people" href="/guides/what-fails-people" />
        <Button variant="secondary" label="Back to home" href="/" />
      </Screen>
    );
  }

  const d = set[index];
  const answered = selected !== null;
  const cite = [d.source.section, d.source.edition ? `Handbook ${d.source.edition}` : null, d.source.page ? `p. ${d.source.page}` : null]
    .filter(Boolean)
    .join(' · ');

  const next = () => {
    if (index + 1 === set.length) track({ name: 'test_completed', course: 'all', mode: 'spot', correct, total: set.length });
    setSelected(null);
    setIndex(index + 1);
  };

  return (
    <Screen>
      <View style={{ gap: Spacing.two }}>
        <ThemedText type="smallBold" themeColor="textSecondary">
          Spot the mistake · {d.course.toUpperCase()} · Scene {index + 1} of {set.length}
        </ThemedText>
        <ProgressBar value={index / set.length} />
      </View>

      <View style={[styles.scene, { borderColor: theme.border }]} accessibilityRole="image" accessibilityLabel={`Scene ${index + 1}`}>
        <SvgXml xml={d.scene} width="100%" height="100%" />
      </View>

      <ThemedText type="subheading" accessibilityRole="header">
        {d.question}
      </ThemedText>

      <View style={{ gap: Spacing.two }}>
        {d.options.map((opt, i) => {
          const state = !answered ? 'idle' : i === d.answer ? 'correct' : i === selected ? 'wrong' : 'idle';
          const look = {
            idle: { borderColor: theme.border, backgroundColor: theme.background },
            correct: { borderColor: theme.success, backgroundColor: theme.successBg },
            wrong: { borderColor: theme.danger, backgroundColor: theme.dangerBg },
          }[state];
          return (
            <Pressable
              key={opt}
              accessibilityRole="radio"
              accessibilityState={{ selected: i === selected }}
              onPress={() => {
                if (answered) return;
                setSelected(i);
                if (i === d.answer) setCorrect(correct + 1);
              }}
              style={[styles.option, look]}>
              <ThemedText>{opt}</ThemedText>
              {state === 'correct' ? (
                <ThemedText type="small" themeColor="success">
                  The mistake
                </ThemedText>
              ) : state === 'wrong' ? (
                <ThemedText type="small" themeColor="danger">
                  This part is done correctly
                </ThemedText>
              ) : null}
            </Pressable>
          );
        })}
      </View>

      {answered ? (
        <Card>
          <ThemedText type="bold" themeColor={selected === d.answer ? 'success' : 'danger'}>
            {selected === d.answer ? 'Spotted it' : 'Not quite'}
          </ThemedText>
          <ThemedText>{d.explanation}</ThemedText>
          {cite ? (
            <ThemedText type="small" themeColor="textSecondary">
              {cite}
            </ThemedText>
          ) : null}
        </Card>
      ) : null}

      {d.draft ? <Notice tone="warning">Draft scene. Not yet reviewed by the instructor.</Notice> : null}

      <Button label={index + 1 === set.length ? 'Finish' : 'Next scene'} onPress={next} disabled={!answered} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  scene: { width: '100%', aspectRatio: 640 / 400, borderRadius: Radius, overflow: 'hidden', borderWidth: 1 },
  option: { borderWidth: 2, borderRadius: Radius, padding: Spacing.three, gap: Spacing.one, minHeight: 48, justifyContent: 'center' },
});
