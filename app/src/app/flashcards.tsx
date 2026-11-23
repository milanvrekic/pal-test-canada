import type { Metadata } from 'expo-router/server';
import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { sourceLine } from '@/components/answer';
import { ThemedText } from '@/components/themed-text';
import { Button, Col, Eyebrow, ProgressBar, Screen, Split } from '@/components/ui';
import { Spacing } from '@/constants/theme';
import { type Course, type Question, buildPractice, recordAnswer, today } from '@/features/quiz/engine';
import { useTheme } from '@/hooks/use-theme';
import { questions } from '@/lib/content';
import { updateProgress, useProgress } from '@/lib/progress';
import { page } from '@/lib/seo';

export function generateMetadata(): Metadata {
  return page('/flashcards', {
    title: 'CFSC and CRFSC flashcards | PAL Test Canada',
    description: 'Flip through PAL course flashcards: the question on the front, the answer, explanation and handbook page on the back.',
  });
}

const DECK = 20;

export default function Flashcards() {
  const theme = useTheme();
  const { progress, loaded } = useProgress();
  const [course, setCourse] = useState<Course>('cfsc');
  const [deck, setDeck] = useState<Question[] | null>(null);
  const [i, setI] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [known, setKnown] = useState(0);

  // Build after progress loads (weakest and unseen first), on the client only.
  useEffect(() => {
    if (!loaded) return;
    setDeck(buildPractice(questions, progress, { course, size: DECK }));
    setI(0);
    setFlipped(false);
    setKnown(0);
  }, [loaded, course]); // eslint-disable-line react-hooks/exhaustive-deps

  const q = deck?.[i];
  const answer = (gotIt: boolean) => {
    if (!q) return;
    updateProgress((p) => recordAnswer(p, q.id, gotIt, today()));
    if (gotIt) setKnown(known + 1);
    setFlipped(false);
    setI(i + 1);
  };

  return (
    <Screen>
      <View style={{ gap: Spacing.two }}>
        <Eyebrow tone="signal">Flashcards</Eyebrow>
        <ThemedText type="title" accessibilityRole="header">
          Flip, check, repeat
        </ThemedText>
        <View style={styles.seg} accessibilityRole="radiogroup">
          {(['cfsc', 'crfsc'] as const).map((c) => (
            <Pressable
              key={c}
              accessibilityRole="radio"
              accessibilityState={{ checked: course === c }}
              onPress={() => setCourse(c)}
              style={[styles.segItem, course === c ? { backgroundColor: theme.accent } : { backgroundColor: theme.backgroundSelected }]}>
              <ThemedText type="smallBold" style={{ color: course === c ? theme.onAccent : theme.text }}>
                {c.toUpperCase()}
              </ThemedText>
            </Pressable>
          ))}
        </View>
      </View>

      {!deck ? (
        <ThemedText themeColor="textSecondary">Shuffling cards…</ThemedText>
      ) : q ? (
        <View style={{ gap: Spacing.three }}>
          <View style={styles.meta}>
            <ThemedText type="smallBold" themeColor="textSecondary">
              Card {i + 1} of {deck.length}
            </ThemedText>
            <ThemedText type="smallBold" themeColor="textSecondary">
              {known} known
            </ThemedText>
          </View>
          <ProgressBar value={i / deck.length} height={10} />
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={flipped ? 'Answer side. Tap to see the question.' : 'Question side. Tap to see the answer.'}
            onPress={() => setFlipped(!flipped)}
            style={({ pressed }) => [styles.card, { backgroundColor: flipped ? theme.tintBlue : theme.backgroundElement, borderColor: theme.border }, pressed ? { transform: [{ scale: 0.99 }] } : null]}>
            {flipped ? (
              <View style={{ gap: Spacing.three }}>
                <ThemedText type="eyebrow" themeColor="textSecondary">
                  Answer
                </ThemedText>
                <ThemedText type="heading">{q.options[q.answer]}</ThemedText>
                <ThemedText>{q.explanation}</ThemedText>
                <ThemedText type="small" themeColor="textSecondary">
                  {sourceLine(q.source)}
                </ThemedText>
              </View>
            ) : (
              <View style={{ gap: Spacing.three }}>
                <ThemedText type="eyebrow" themeColor="textSecondary">
                  Question
                </ThemedText>
                <ThemedText type="subheading" style={{ fontSize: 22, lineHeight: 31 }}>
                  {q.question}
                </ThemedText>
                <ThemedText type="smallBold" themeColor="textSecondary">
                  Tap to flip
                </ThemedText>
              </View>
            )}
          </Pressable>
          {flipped ? (
            <Split gap={Spacing.two}>
              <Col basis={160}>
                <Button variant="secondary" label="Again" onPress={() => answer(false)} />
              </Col>
              <Col basis={160}>
                <Button label="Got it" onPress={() => answer(true)} />
              </Col>
            </Split>
          ) : (
            <Button variant="secondary" label="Show the answer" onPress={() => setFlipped(true)} />
          )}
        </View>
      ) : (
        <View style={{ gap: Spacing.three }}>
          <ThemedText type="heading">
            Deck done: {known} of {deck.length} known
          </ThemedText>
          <ThemedText themeColor="textSecondary">Cards you marked "Again" come back in Review, on the home screen.</ThemedText>
          <Split gap={Spacing.two}>
            <Col basis={180}>
              <Button
                label="New deck"
                onPress={() => {
                  setDeck(buildPractice(questions, progress, { course, size: DECK }));
                  setI(0);
                  setKnown(0);
                }}
              />
            </Col>
            <Col basis={180}>
              <Button variant="secondary" label="Take a practice exam" href={{ pathname: '/quiz', params: { course, mode: 'exam' } }} />
            </Col>
          </Split>
        </View>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  seg: { flexDirection: 'row', gap: Spacing.two },
  segItem: { borderRadius: 999, paddingHorizontal: Spacing.three + 4, minHeight: 40, justifyContent: 'center' },
  meta: { flexDirection: 'row', justifyContent: 'space-between' },
  card: { borderWidth: 1, borderRadius: 28, padding: Spacing.five, minHeight: 300, justifyContent: 'center' },
});
