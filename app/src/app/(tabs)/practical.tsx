import type { Metadata } from 'expo-router/server';
import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { sourceLine } from '@/components/answer';
import { HandoffCards } from '@/components/handoff-cards';
import { ThemedText } from '@/components/themed-text';
import { Button, Card, Col, Eyebrow, ProgressBar, Screen, Split } from '@/components/ui';
import { RadiusControl, Spacing } from '@/constants/theme';
import { shuffle } from '@/features/quiz/engine';
import { useTheme } from '@/hooks/use-theme';
import { track } from '@/lib/analytics';
import { haptic } from '@/lib/haptics';
import { type PracticalDrill, practicalDrills } from '@/lib/content';
import { page } from '@/lib/seo';

export function generateMetadata(): Metadata {
  return page('/practical', {
    title: 'PAL practical test trainer: PROVE and safe handling steps | PAL Test Canada',
    description:
      'Practise the handling sequences the CFSC and CRFSC practical tests look for: PROVE, passing a firearm, cease-fire, crossing a fence, unloading a pistol. Put the steps in order, then say them out loud.',
  });
}

type Phase = { kind: 'cards' } | { kind: 'pick' } | { kind: 'order'; drill: PracticalDrill } | { kind: 'recite'; drill: PracticalDrill };

export default function Practical() {
  const [phase, setPhase] = useState<Phase>({ kind: 'cards' });
  if (phase.kind === 'order') return <OrderDrill key={phase.drill.id} drill={phase.drill} onBack={() => setPhase({ kind: 'pick' })} onRecite={() => setPhase({ kind: 'recite', drill: phase.drill })} />;
  if (phase.kind === 'recite') return <Recite key={phase.drill.id} drill={phase.drill} onBack={() => setPhase({ kind: 'pick' })} />;
  if (phase.kind === 'pick') return <Picker onPick={(drill) => setPhase({ kind: 'order', drill })} onCards={() => setPhase({ kind: 'cards' })} />;
  return <DrillCards onOrder={(drill) => setPhase({ kind: 'order', drill })} onPick={() => setPhase({ kind: 'pick' })} />;
}

function ModeSwitch({ mode, onCards, onPick }: { mode: 'cards' | 'pick'; onCards: () => void; onPick: () => void }) {
  const theme = useTheme();
  return (
    <View style={[styles.seg, { backgroundColor: theme.backgroundSelected }]} accessibilityRole="tablist">
      {(
        [
          ['cards', 'Flashcards', onCards],
          ['pick', 'Put steps in order', onPick],
        ] as const
      ).map(([id, label, go]) => (
        <Pressable key={id} accessibilityRole="tab" accessibilityState={{ selected: mode === id }} onPress={go} style={[styles.segItem, mode === id ? { backgroundColor: theme.backgroundElement } : null]}>
          <ThemedText type="smallBold" themeColor={mode === id ? 'accent' : 'textSecondary'}>
            {label}
          </ThemedText>
        </Pressable>
      ))}
    </View>
  );
}

/** Flip cards: the situation as a question on the front, the steps in order on the back. */
function DrillCards({ onOrder, onPick }: { onOrder: (d: PracticalDrill) => void; onPick: () => void }) {
  const theme = useTheme();
  const [course, setCourse] = useState<'all' | 'cfsc' | 'crfsc'>('all');
  const [deck, setDeck] = useState<PracticalDrill[] | null>(null);
  const [i, setI] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [known, setKnown] = useState(0);
  // Shuffle after mount so the pre-rendered page and the app agree.
  useEffect(() => {
    setDeck(shuffle(practicalDrills.filter((d) => course === 'all' || d.course === course)));
    setI(0);
    setFlipped(false);
    setKnown(0);
  }, [course]);
  const d = deck?.[i];
  const next = (gotIt: boolean) => {
    if (gotIt) setKnown(known + 1);
    if (d) track({ name: 'test_completed', course: d.course, mode: `practical_card:${d.id}`, correct: gotIt ? 1 : 0, total: 1 });
    setFlipped(false);
    setI(i + 1);
  };

  return (
    <Screen>
      <View style={{ gap: Spacing.two }}>
        <Eyebrow tone="signal">Practical test trainer</Eyebrow>
        <ThemedText type="title" accessibilityRole="header">
          What do you do?
        </ThemedText>
        <ThemedText themeColor="textSecondary" style={{ fontSize: 18, lineHeight: 27 }}>
          Say the steps out loud, in order, then flip the card to check. The practical test is where most marks are lost.
        </ThemedText>
        <ModeSwitch mode="cards" onCards={() => {}} onPick={onPick} />
        <View style={styles.chips} accessibilityRole="radiogroup">
          {(['all', 'cfsc', 'crfsc'] as const).map((c) => (
            <Pressable key={c} accessibilityRole="radio" accessibilityState={{ checked: course === c }} onPress={() => setCourse(c)} style={[styles.chip, course === c ? { backgroundColor: theme.accent, borderColor: theme.accent } : { borderColor: theme.borderStrong }]}>
              <ThemedText type="smallBold" style={{ color: course === c ? theme.onAccent : theme.text }}>
                {c === 'all' ? 'All' : c === 'cfsc' ? 'Non-restricted' : 'Restricted'}
              </ThemedText>
            </Pressable>
          ))}
        </View>
      </View>

      {practicalDrills.length === 0 ? (
        <Card style={{ gap: Spacing.two }}>
          <ThemedText type="heading">Being reviewed</ThemedText>
          <ThemedText themeColor="textSecondary">The handling drills are with our certified instructor for review and will appear here once approved.</ThemedText>
        </Card>
      ) : !deck ? (
        <ThemedText themeColor="textSecondary">Shuffling cards…</ThemedText>
      ) : d ? (
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
            accessibilityLabel={flipped ? 'Answer side. Tap to see the question.' : 'Question side. Tap to see the steps.'}
            onPress={() => {
              haptic.tap();
              setFlipped(!flipped);
            }}
            style={({ pressed }) => [styles.card, { backgroundColor: flipped ? theme.backgroundElement : theme.tintBlue, borderColor: theme.border }, pressed ? { transform: [{ scale: 0.99 }] } : null]}>
            {flipped ? (
              <View style={{ gap: Spacing.three }}>
                <ThemedText type="eyebrow" themeColor="textSecondary">
                  {d.title} · {d.steps.length} steps
                </ThemedText>
                <View style={{ gap: Spacing.two }}>
                  {d.steps.map((step, n) => (
                    <View key={step} style={styles.stepRow}>
                      <View style={[styles.num, { backgroundColor: theme.accent }]}>
                        <ThemedText type="smallBold" style={{ color: theme.onAccent }}>
                          {n + 1}
                        </ThemedText>
                      </View>
                      <ThemedText style={{ flex: 1 }}>{step}</ThemedText>
                    </View>
                  ))}
                </View>
                <ThemedText type="small" themeColor="textSecondary">
                  {d.why}
                </ThemedText>
                <ThemedText type="small" themeColor="textSecondary">
                  {sourceLine(d.source)}
                </ThemedText>
              </View>
            ) : (
              <View style={{ gap: Spacing.three }}>
                <ThemedText type="eyebrow" themeColor="textSecondary">
                  {d.course === 'cfsc' ? 'Non-restricted' : 'Restricted'}
                </ThemedText>
                <ThemedText type="title" style={{ fontSize: 30, lineHeight: 36 }}>
                  {d.prompt}
                </ThemedText>
                <ThemedText type="smallBold" themeColor="textSecondary">
                  Say the {d.steps.length} steps, then tap to flip
                </ThemedText>
              </View>
            )}
          </Pressable>
          {flipped ? (
            <View style={{ gap: Spacing.two }}>
              <Split gap={Spacing.two}>
                <Col basis={150}>
                  <Button variant="secondary" label="Again" onPress={() => next(false)} />
                </Col>
                <Col basis={150}>
                  <Button label="Got it" onPress={() => next(true)} />
                </Col>
              </Split>
              <Pressable accessibilityRole="button" onPress={() => onOrder(d)} style={styles.back}>
                <ThemedText type="smallBold" themeColor="accent">
                  Practise putting these steps in order →
                </ThemedText>
              </Pressable>
            </View>
          ) : (
            <Button variant="secondary" label="Show the steps" onPress={() => setFlipped(true)} />
          )}
        </View>
      ) : (
        <View style={{ gap: Spacing.three }}>
          <ThemedText type="heading">
            Deck done: {known} of {deck.length} known
          </ThemedText>
          <Split gap={Spacing.two}>
            <Col basis={180}>
              <Button
                label="Shuffle again"
                onPress={() => {
                  setDeck(shuffle(deck));
                  setI(0);
                  setKnown(0);
                }}
              />
            </Col>
            <Col basis={180}>
              <Button variant="secondary" label="Spot the mistake" href="/spot" />
            </Col>
          </Split>
        </View>
      )}
    </Screen>
  );
}

function Picker({ onPick, onCards }: { onPick: (d: PracticalDrill) => void; onCards: () => void }) {
  const theme = useTheme();
  return (
    <Screen width="wide">
      <View style={{ gap: Spacing.two }}>
        <Eyebrow tone="signal">Practical test trainer</Eyebrow>
        <ThemedText type="title" accessibilityRole="header">
          Get the handling steps right, in order
        </ThemedText>
        <ThemedText themeColor="textSecondary" style={{ fontSize: 18, lineHeight: 27, maxWidth: 680 }}>
          The practical test is where most marks are lost. Pick a situation, put the steps in the right order, then say them out
          loud from memory. Do it with a real (unloaded) firearm only under an instructor.
        </ThemedText>
        <ModeSwitch mode="pick" onCards={onCards} onPick={() => {}} />
      </View>
      {practicalDrills.length === 0 ? (
        <Card style={{ gap: Spacing.two }}>
          <ThemedText type="heading">Being reviewed</ThemedText>
          <ThemedText themeColor="textSecondary">
            The handling drills are with our certified instructor for review and will appear here once approved. Meanwhile,
            the photo drill covers the same mistakes.
          </ThemedText>
        </Card>
      ) : null}
      {(['cfsc', 'crfsc'] as const).map((course) => {
        const list = practicalDrills.filter((d) => d.course === course);
        if (!list.length) return null;
        return (
          <View key={course} style={{ gap: Spacing.three }}>
            <ThemedText type="heading">{course === 'cfsc' ? 'Non-restricted (CFSC)' : 'Restricted (CRFSC)'}</ThemedText>
            <Split gap={Spacing.two + 4}>
              {list.map((d) => (
                <Col key={d.id} basis={300}>
                  <Pressable accessibilityRole="button" onPress={() => onPick(d)} style={{ flexGrow: 1 }}>
                    {({ pressed }) => (
                      <Card style={[{ flexGrow: 1, gap: Spacing.two }, pressed ? { transform: [{ scale: 0.98 }] } : null]}>
                        <ThemedText type="heading">{d.title}</ThemedText>
                        <ThemedText type="small" themeColor="textSecondary">
                          {d.situation}
                        </ThemedText>
                        <ThemedText type="smallBold" style={{ marginTop: 'auto' }}>
                          {d.steps.length} steps · Start →
                        </ThemedText>
                        {d.draft ? (
                          <ThemedText type="small" style={{ color: theme.warning }}>
                            Draft: not yet reviewed
                          </ThemedText>
                        ) : null}
                      </Card>
                    )}
                  </Pressable>
                </Col>
              ))}
            </Split>
          </View>
        );
      })}
      <Card style={{ gap: Spacing.three }}>
        <ThemedText type="heading">Then spot the mistakes</ThemedText>
        <ThemedText themeColor="textSecondary">Photo scenes of the handling errors that fail people on test day.</ThemedText>
        <Button variant="secondary" label="Spot the mistake" href="/spot" />
      </Card>
    </Screen>
  );
}

function OrderDrill({ drill, onBack, onRecite }: { drill: PracticalDrill; onBack: () => void; onRecite: () => void }) {
  const theme = useTheme();
  const [pool, setPool] = useState<number[] | null>(null);
  const [placed, setPlaced] = useState<number[]>([]);
  const [wrong, setWrong] = useState<number | null>(null);
  const [mistakes, setMistakes] = useState(0);
  // Shuffle after mount so the pre-rendered page and the app agree.
  useEffect(() => setPool(shuffle(drill.steps.map((_, i) => i))), [drill]);
  const done = placed.length === drill.steps.length;

  const tap = (i: number) => {
    if (i === placed.length) {
      haptic.tap();
      setPlaced([...placed, i]);
      setWrong(null);
      if (i === drill.steps.length - 1) track({ name: 'test_completed', course: drill.course, mode: `practical:${drill.id}`, correct: drill.steps.length - Math.min(mistakes, drill.steps.length), total: drill.steps.length });
    } else {
      haptic.wrong();
      setWrong(i);
      setMistakes(mistakes + 1);
    }
  };

  return (
    <Screen>
      <View style={{ gap: Spacing.two }}>
        <Pressable accessibilityRole="button" onPress={onBack} style={styles.back}>
          <ThemedText type="smallBold" themeColor="textSecondary">
            ← All situations
          </ThemedText>
        </Pressable>
        <ThemedText type="title" accessibilityRole="header">
          {drill.title}
        </ThemedText>
        <ThemedText themeColor="textSecondary" style={{ fontSize: 18, lineHeight: 27 }}>
          {drill.situation} Tap the steps in the order you would do them.
        </ThemedText>
        <ProgressBar value={placed.length / drill.steps.length} height={10} />
      </View>

      <View style={{ gap: Spacing.two }}>
        {drill.steps.map((step, i) => {
          const isPlaced = i < placed.length;
          return (
            <View key={step} style={[styles.slot, isPlaced ? { borderColor: theme.success, backgroundColor: theme.successBg } : { borderColor: theme.border, borderStyle: 'dashed' }]}>
              <View style={[styles.num, { backgroundColor: isPlaced ? theme.success : theme.backgroundSelected }]}>
                <ThemedText type="smallBold" style={{ color: isPlaced ? '#FFFFFF' : theme.textSecondary }}>
                  {i + 1}
                </ThemedText>
              </View>
              <ThemedText style={{ flex: 1 }} themeColor={isPlaced ? 'text' : 'textSecondary'}>
                {isPlaced ? step : i === placed.length ? 'What comes next?' : ''}
              </ThemedText>
            </View>
          );
        })}
      </View>

      {!done && pool ? (
        <View style={{ gap: Spacing.two }}>
          <ThemedText type="smallBold" themeColor="textSecondary">
            Steps to place
          </ThemedText>
          {pool
            .filter((i) => !placed.includes(i))
            .map((i) => (
              <Pressable
                key={i}
                accessibilityRole="button"
                accessibilityHint={wrong === i ? 'Not this one yet' : undefined}
                onPress={() => tap(i)}
                style={({ pressed }) => [
                  styles.tile,
                  { backgroundColor: theme.backgroundElement, borderColor: wrong === i ? theme.danger : theme.border },
                  wrong === i ? { backgroundColor: theme.dangerBg, borderWidth: 2 } : null,
                  pressed ? { transform: [{ scale: 0.98 }] } : null,
                ]}>
                <ThemedText>{drill.steps[i]}</ThemedText>
                {wrong === i ? (
                  <ThemedText type="smallBold" themeColor="dangerDark">
                    Not yet. What has to happen before this?
                  </ThemedText>
                ) : null}
              </Pressable>
            ))}
        </View>
      ) : null}

      {done ? (
        <View style={{ gap: Spacing.three }}>
          <View style={[styles.result, { backgroundColor: mistakes === 0 ? theme.successBg : theme.tintSand }]}>
            <ThemedText type="heading" themeColor={mistakes === 0 ? 'successDark' : 'text'}>
              {mistakes === 0 ? 'Perfect order' : `Done, with ${mistakes} wrong pick${mistakes === 1 ? '' : 's'}`}
            </ThemedText>
            <ThemedText>{drill.why}</ThemedText>
            <View style={[styles.cite, { backgroundColor: theme.backgroundElement }]}>
              <ThemedText type="small">{sourceLine(drill.source)}</ThemedText>
            </View>
          </View>
          <Split gap={Spacing.two}>
            <Col basis={200}>
              <Button label="Now say it out loud" onPress={onRecite} />
            </Col>
            <Col basis={200}>
              <Button variant="secondary" label="Another situation" onPress={onBack} />
            </Col>
          </Split>
        </View>
      ) : null}
    </Screen>
  );
}

/** Recite from memory: reveal one step at a time after saying it, with a stopwatch. */
function Recite({ drill, onBack }: { drill: PracticalDrill; onBack: () => void }) {
  const theme = useTheme();
  const [shown, setShown] = useState(0);
  const [start] = useState(() => Date.now());
  const [end, setEnd] = useState<number | null>(null);
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    if (end) return;
    const t = setInterval(() => setNow(Date.now()), 250);
    return () => clearInterval(t);
  }, [end]);
  const seconds = Math.round(((end ?? now) - start) / 1000);
  const next = () => {
    const n = shown + 1;
    setShown(n);
    if (n === drill.steps.length) setEnd(Date.now());
  };
  return (
    <Screen>
      <View style={{ gap: Spacing.two }}>
        <Pressable accessibilityRole="button" onPress={onBack} style={styles.back}>
          <ThemedText type="smallBold" themeColor="textSecondary">
            ← All situations
          </ThemedText>
        </Pressable>
        <Eyebrow tone="signal">Say it out loud</Eyebrow>
        <ThemedText type="title" accessibilityRole="header">
          {drill.title}
        </ThemedText>
        <ThemedText themeColor="textSecondary" style={{ fontSize: 18, lineHeight: 27 }}>
          {drill.situation} Say step {Math.min(shown + 1, drill.steps.length)} out loud, as you would explain it to the
          instructor, then reveal it to check.
        </ThemedText>
        <ThemedText type="statSmall" themeColor="textSecondary">
          {seconds}s
        </ThemedText>
      </View>
      <View style={{ gap: Spacing.two }}>
        {drill.steps.map((step, i) => (
          <View key={step} style={[styles.slot, i < shown ? { borderColor: theme.border, backgroundColor: theme.backgroundElement } : { borderColor: theme.border, borderStyle: 'dashed' }]}>
            <View style={[styles.num, { backgroundColor: i < shown ? theme.accent : theme.backgroundSelected }]}>
              <ThemedText type="smallBold" style={{ color: i < shown ? theme.onAccent : theme.textSecondary }}>
                {i + 1}
              </ThemedText>
            </View>
            <ThemedText style={{ flex: 1 }} themeColor={i < shown ? 'text' : 'textSecondary'}>
              {i < shown ? step : '…'}
            </ThemedText>
          </View>
        ))}
      </View>
      {end ? (
        <View style={{ gap: Spacing.three }}>
          <View style={[styles.result, { backgroundColor: theme.successBg }]}>
            <ThemedText type="heading" themeColor="successDark">
              All {drill.steps.length} steps in {seconds} seconds
            </ThemedText>
            <ThemedText>Run it again until you can say every step without hesitating. On test day, talk through each step as you do it.</ThemedText>
          </View>
          <Button variant="secondary" label="Another situation" onPress={onBack} />
        </View>
      ) : (
        <Button label={shown === 0 ? 'I said step 1: reveal it' : `I said step ${shown + 1}: reveal it`} onPress={next} />
      )}
      <HandoffCards placement="drill_results" title="After your course" lead="Once your licence arrives, find where you can hunt and shoot." />
    </Screen>
  );
}

const styles = StyleSheet.create({
  seg: { flexDirection: 'row', borderRadius: 999, padding: 4, gap: 4, alignSelf: 'flex-start', marginTop: Spacing.two },
  segItem: { borderRadius: 999, paddingHorizontal: Spacing.three + 2, minHeight: 38, justifyContent: 'center' },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.two },
  chip: { borderWidth: 1, borderRadius: 999, paddingHorizontal: Spacing.three, minHeight: 36, justifyContent: 'center' },
  meta: { flexDirection: 'row', justifyContent: 'space-between' },
  card: { borderWidth: 1, borderRadius: 28, padding: Spacing.five, minHeight: 320, justifyContent: 'center' },
  stepRow: { flexDirection: 'row', gap: Spacing.three, alignItems: 'flex-start' },
  back: { minHeight: 40, justifyContent: 'center', alignSelf: 'flex-start' },
  slot: { flexDirection: 'row', alignItems: 'center', gap: Spacing.three, borderWidth: 1.5, borderRadius: RadiusControl, paddingVertical: Spacing.two + 4, paddingHorizontal: Spacing.three, minHeight: 56 },
  num: { width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center', marginTop: -2 },
  tile: { borderWidth: 1, borderRadius: RadiusControl, paddingVertical: Spacing.three - 2, paddingHorizontal: Spacing.three + 4, minHeight: 56, justifyContent: 'center', gap: 2 },
  result: { borderRadius: 24, padding: Spacing.four, gap: Spacing.two },
  cite: { borderRadius: 12, paddingVertical: Spacing.two, paddingHorizontal: Spacing.three, alignSelf: 'flex-start' },
});
