import { Pressable, StyleSheet, View } from 'react-native';

import { RadiusControl, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

import { ThemedText } from './themed-text';
import { Card } from './ui';

/** One answer row: a letter chip, the answer, and after answering a note saying what it was. */
export function AnswerOption({
  letter,
  label,
  state,
  dimmed,
  notes = { correct: 'Correct answer', wrong: 'Your answer' },
  onPress,
}: {
  letter: string;
  label: string;
  state: 'idle' | 'selected' | 'correct' | 'wrong';
  dimmed?: boolean;
  notes?: { correct: string; wrong: string };
  onPress: () => void;
}) {
  const theme = useTheme();
  const look = {
    idle: { borderColor: theme.border, backgroundColor: theme.backgroundElement },
    selected: { borderColor: theme.accent, backgroundColor: theme.accentSoft },
    correct: { borderColor: theme.success, backgroundColor: theme.successBg },
    wrong: { borderColor: theme.danger, backgroundColor: theme.dangerBg },
  }[state];
  const chip = {
    idle: { backgroundColor: theme.backgroundSelected, color: theme.textSecondary },
    selected: { backgroundColor: theme.accent, color: theme.onAccent },
    correct: { backgroundColor: theme.success, color: theme.onAccent },
    wrong: { backgroundColor: theme.danger, color: theme.onAccent },
  }[state];
  const suffix = state === 'correct' ? ` (${notes.correct})` : state === 'wrong' ? ` (${notes.wrong})` : '';
  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityState={{ checked: state === 'selected' || state === 'wrong' }}
      accessibilityLabel={`${letter}. ${label}${suffix}`}
      onPress={onPress}
      style={({ pressed }) => [styles.option, look, dimmed ? { opacity: 0.78 } : null, pressed && state === 'idle' ? { borderColor: theme.accent } : null]}>
      <View style={[styles.chip, { backgroundColor: chip.backgroundColor }]}>
        <ThemedText type="smallBold" style={{ color: chip.color }}>
          {state === 'correct' ? '✓' : state === 'wrong' ? '✕' : letter}
        </ThemedText>
      </View>
      <View style={{ flex: 1, gap: Spacing.half }}>
        <ThemedText>{label}</ThemedText>
        {suffix ? (
          <ThemedText type="smallBold" themeColor={state === 'correct' ? 'success' : 'danger'}>
            {state === 'correct' ? notes.correct : notes.wrong}
          </ThemedText>
        ) : null}
      </View>
    </Pressable>
  );
}

/** The explanation shown after answering, with the handbook source as a tab. */
export function Feedback({ good, title, explanation, source }: { good: boolean; title: string; explanation: string; source?: string }) {
  const theme = useTheme();
  return (
    <Card style={[styles.explain, { borderLeftColor: good ? theme.success : theme.danger }]}>
      <ThemedText type="heading" themeColor={good ? 'success' : 'danger'} style={{ fontSize: 24, lineHeight: 28 }}>
        {title}
      </ThemedText>
      <ThemedText>{explanation}</ThemedText>
      {source ? (
        <View style={[styles.cite, { backgroundColor: theme.backgroundSelected }]}>
          <ThemedText type="eyebrow" themeColor="textSecondary">
            Source
          </ThemedText>
          <ThemedText type="small">{source}</ThemedText>
        </View>
      ) : null}
    </Card>
  );
}

export function sourceLine(src: { section?: string | null; edition?: string | null; page?: string | number | null }): string {
  return [src.section, src.edition ? `Handbook ${src.edition}` : null, src.page ? `p. ${src.page}` : null].filter(Boolean).join(' · ');
}

const styles = StyleSheet.create({
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    borderWidth: 2,
    borderRadius: RadiusControl,
    paddingVertical: Spacing.three - 2,
    paddingHorizontal: Spacing.three,
    minHeight: 56,
  },
  chip: { width: 32, height: 32, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  explain: { borderLeftWidth: 4, borderRadius: RadiusControl },
  cite: { borderRadius: 8, paddingVertical: Spacing.two, paddingHorizontal: Spacing.two + 4, gap: Spacing.half, alignSelf: 'flex-start' },
});
