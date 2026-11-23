import type { Metadata } from 'expo-router/server';
import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { sourceLine } from '@/components/answer';
import { HandoffCards } from '@/components/handoff-cards';
import { ThemedText } from '@/components/themed-text';
import { Button, Card, Eyebrow, Screen } from '@/components/ui';
import { Radius, Spacing } from '@/constants/theme';
import { CLASSES, type FirearmClass, RULES, SITUATIONS, type Situation } from '@/features/rules/rules';
import { useTheme } from '@/hooks/use-theme';
import { questions } from '@/lib/content';
import { page } from '@/lib/seo';

export function generateMetadata(): Metadata {
  return page('/rules', {
    title: 'Firearm storage, transport and display rules checker (Canada) | PAL Test Canada',
    description:
      'Pick the firearm class and the situation to see what the rules require for storage, display and transport, with the handbook page for each rule.',
  });
}

function Choice({ active, label, sub, onPress }: { active: boolean; label: string; sub?: string; onPress: () => void }) {
  const theme = useTheme();
  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityState={{ checked: active }}
      onPress={onPress}
      style={[styles.choice, active ? { borderColor: theme.select, backgroundColor: theme.selectBg, borderWidth: 2 } : { borderColor: theme.border, backgroundColor: theme.backgroundElement }]}>
      <ThemedText type="bold">{label}</ThemedText>
      {sub ? (
        <ThemedText type="small" themeColor="textSecondary">
          {sub}
        </ThemedText>
      ) : null}
    </Pressable>
  );
}

export default function Rules() {
  const theme = useTheme();
  const [cls, setCls] = useState<FirearmClass>('non-restricted');
  const [sit, setSit] = useState<Situation>('store');
  const situations = SITUATIONS.filter((s) => !s.only || s.only === cls);
  const current = situations.some((s) => s.id === sit) ? sit : 'store';
  const ids = RULES[cls][current] ?? [];
  const rules = ids.map((id) => questions.find((q) => q.id === id)).filter((q) => q && !q.draft);

  return (
    <Screen>
      <View style={{ gap: Spacing.two }}>
        <Eyebrow tone="signal">Rules checker</Eyebrow>
        <ThemedText type="title" accessibilityRole="header">
          Storage, transport and display: what does the law require?
        </ThemedText>
        <ThemedText themeColor="textSecondary" style={{ fontSize: 18, lineHeight: 27 }}>
          These rules come up on the written test, and they apply every day once you are licensed. Pick the firearm class and
          the situation.
        </ThemedText>
      </View>

      <View style={{ gap: Spacing.two }}>
        <ThemedText type="smallBold">1. Which class of firearm?</ThemedText>
        <View style={styles.row} accessibilityRole="radiogroup">
          {CLASSES.map((c) => (
            <View key={c.id} style={{ flex: 1 }}>
              <Choice active={cls === c.id} label={c.label} sub={c.sub} onPress={() => setCls(c.id)} />
            </View>
          ))}
        </View>
      </View>

      <View style={{ gap: Spacing.two }}>
        <ThemedText type="smallBold">2. What are you doing with it?</ThemedText>
        <View style={{ gap: Spacing.two }} accessibilityRole="radiogroup">
          {situations.map((s) => (
            <Choice key={s.id} active={current === s.id} label={s.label} onPress={() => setSit(s.id)} />
          ))}
        </View>
      </View>

      <View style={{ gap: Spacing.three }} accessibilityLiveRegion="polite">
        <ThemedText type="heading" accessibilityRole="header">
          What the rules say
        </ThemedText>
        {rules.map((q, i) => (
          <Card key={q!.id} style={{ gap: Spacing.two }}>
            <View style={styles.ruleHead}>
              <View style={[styles.num, { backgroundColor: theme.accent }]}>
                <ThemedText type="smallBold" style={{ color: theme.onAccent }}>
                  {i + 1}
                </ThemedText>
              </View>
              <ThemedText style={{ flex: 1 }}>{q!.explanation}</ThemedText>
            </View>
            <View style={[styles.cite, { backgroundColor: theme.backgroundSelected }]}>
              <ThemedText type="small">{sourceLine(q!.source)}</ThemedText>
            </View>
          </Card>
        ))}
        <ThemedText type="small" themeColor="textSecondary">
          Summarised from the student handbook for study. The law itself, and your province, may add detail: check the
          Canadian Firearms Program before relying on it.
        </ThemedText>
      </View>

      <Card style={{ gap: Spacing.three }}>
        <ThemedText type="heading">Test yourself on these rules</ThemedText>
        <Button label="Practise storage and transport questions" href={{ pathname: '/quiz', params: { course: cls === 'restricted' ? 'crfsc' : 'cfsc', mode: 'practice', topic: 'storage-transport-display' } }} />
      </Card>
      <HandoffCards placement="guide" title="After your course" />
    </Screen>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: Spacing.two },
  choice: { borderWidth: 1, borderRadius: 16, paddingVertical: Spacing.three - 2, paddingHorizontal: Spacing.three + 2, gap: 2, minHeight: 56, justifyContent: 'center' },
  ruleHead: { flexDirection: 'row', gap: Spacing.three, alignItems: 'flex-start' },
  num: { width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center', marginTop: 2 },
  cite: { borderRadius: 12, paddingVertical: Spacing.two, paddingHorizontal: Spacing.three, alignSelf: 'flex-start', marginLeft: 40 },
});
