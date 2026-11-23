import type { Metadata } from 'expo-router/server';

import { page } from '@/lib/seo';
import { useEffect, useState } from 'react';
import { Image, StyleSheet, View } from 'react-native';
import { SvgXml } from 'react-native-svg';

import { HandoffCards } from '@/components/handoff-cards';
import { ThemedText } from '@/components/themed-text';
import { AnswerOption, Feedback, sourceLine } from '@/components/answer';
import { VerdictBar } from '@/components/verdict-bar';
import { Button, Col, Eyebrow, Notice, ProgressBar, Screen, Split } from '@/components/ui';
import { Radius, Spacing } from '@/constants/theme';
import { shuffle } from '@/features/quiz/engine';
import { useTheme } from '@/hooks/use-theme';
import { track } from '@/lib/analytics';
import { drillPhotos } from '@/content/drill-photos';
import { type Drill, drills } from '@/lib/content';

export function generateMetadata(): Metadata {
  return page('/spot', {
    title: 'Spot the mistake: PAL handling drill | PAL Test Canada',
    description: 'Look at each scene and find the handling mistake. Practise for the CFSC and CRFSC practical test.',
  });
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
  // Shuffle after mount: the page is pre-rendered, and a different order on the server breaks hydration.
  const [set, setSet] = useState<Drill[] | null>(null);
  useEffect(() => setSet(shuffle(drills).map(withShuffledOptions)), []);
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [correct, setCorrect] = useState(0);

  if (!set) {
    return (
      <Screen width="wide">
        <ThemedText themeColor="textSecondary">Loading scenes…</ThemedText>
      </Screen>
    );
  }

  if (index >= set.length) {
    return (
      <Screen>
        <View style={[styles.resultHead, { backgroundColor: theme.cover }]}>
          <ThemedText type="eyebrow" style={{ color: theme.onCoverMuted }}>
            Spot the mistake
          </ThemedText>
          <ThemedText type="stat" style={{ color: theme.onCover, fontSize: 72, lineHeight: 72 }} accessibilityRole="header">
            {correct} / {set.length}
          </ThemedText>
          <ThemedText type="bold" style={{ color: theme.onCover }}>
            mistakes spotted
          </ThemedText>
        </View>
        <ThemedText themeColor="textSecondary">
          On the practical test these mistakes cost the most marks. They are habits, so practise the safe version until it happens without
          thinking.
        </ThemedText>
        <Split gap={Spacing.two}>
          <Col basis={200}>
            <Button variant="signal" label="Try again" onPress={onRestart} />
          </Col>
          <Col basis={200}>
            <Button variant="secondary" label="Back to home" href="/" />
          </Col>
        </Split>
        <Button variant="secondary" label="Read: what fails people" href="/guides/what-fails-people" />
        <HandoffCards placement="drill_results" title="After your course" lead="Once your licence arrives, find where you can hunt and shoot." />
      </Screen>
    );
  }

  const d = set[index];
  const answered = selected !== null;

  const next = () => {
    if (index + 1 === set.length) track({ name: 'test_completed', course: 'all', mode: 'spot', correct, total: set.length });
    setSelected(null);
    setIndex(index + 1);
  };

  const isLast = index + 1 === set.length;
  const verdict = answered ? (selected === d.answer ? 'correct' : 'wrong') : null;
  const bar = (
    <VerdictBar
      verdict={verdict}
      hint="Find the mistake"
      detail={verdict === 'wrong' ? `The mistake: ${d.options[d.answer]}` : verdict === 'correct' ? 'You spotted the mistake.' : undefined}
      label={isLast ? 'Finish' : verdict ? 'Continue' : 'Next scene'}
      onPress={next}
      disabled={!answered}
    />
  );

  return (
    <Screen width="wide" bottomBar={bar} bottomTone={verdict === 'correct' ? 'success' : verdict === 'wrong' ? 'danger' : null}>
      <View style={{ gap: Spacing.two }}>
        <View style={styles.headRow}>
          <Eyebrow>Spot the mistake · {d.course.toUpperCase()}</Eyebrow>
          <View style={{ flex: 1 }} />
          <ThemedText type="statSmall" style={{ fontVariant: ['tabular-nums'] }}>
            {index + 1}
            <ThemedText type="statSmall" themeColor="textSecondary">
              {' '}/ {set.length}
            </ThemedText>
          </ThemedText>
        </View>
        <ProgressBar value={(index + (answered ? 1 : 0)) / set.length} height={12} />
      </View>

      <Split gap={Spacing.four}>
        <Col basis={480} grow={3}>
          <View style={[styles.scene, { borderColor: theme.border }]} accessibilityRole="image" accessibilityLabel={d.alt ?? `Scene ${index + 1}`}>
            {d.photo && drillPhotos[d.photo] ? (
              <Image source={drillPhotos[d.photo]} style={styles.photo} resizeMode="cover" accessibilityIgnoresInvertColors />
            ) : (
              <SvgXml xml={d.scene} width="100%" height="100%" />
            )}
          </View>
        </Col>
        <Col basis={340} grow={2} style={{ gap: Spacing.three }}>
          <ThemedText type="subheading" accessibilityRole="header" style={{ fontSize: 21, lineHeight: 29 }}>
            {d.question}
          </ThemedText>
          <View style={{ gap: Spacing.two }} accessibilityRole="radiogroup">
            {d.options.map((opt, i) => (
              <AnswerOption
                key={opt}
                letter={['A', 'B', 'C', 'D', 'E'][i] ?? String(i + 1)}
                label={opt}
                state={!answered ? 'idle' : i === d.answer ? 'correct' : i === selected ? 'wrong' : 'idle'}
                dimmed={answered && i !== d.answer && i !== selected}
                notes={{ correct: 'The mistake', wrong: 'Your pick: this part is safe' }}
                onPress={() => {
                  if (answered) return;
                  setSelected(i);
                  if (i === d.answer) setCorrect(correct + 1);
                }}
              />
            ))}
          </View>
          {answered ? (
            <Feedback
              good={selected === d.answer}
              title="Why"
              explanation={d.explanation}
              source={sourceLine(d.source)}
            />
          ) : null}
          {d.draft ? <Notice tone="warning">Draft scene. Not yet reviewed by the instructor.</Notice> : null}
        </Col>
      </Split>
    </Screen>
  );
}

const styles = StyleSheet.create({
  headRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.three },
  scene: { width: '100%', aspectRatio: 1024 / 637, borderRadius: Radius, overflow: 'hidden', borderWidth: 1 },
  photo: { width: '100%', height: '100%' },
  barRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.three },
  resultHead: { borderRadius: Radius, padding: Spacing.four, gap: Spacing.two },
});
