import { Pressable, StyleSheet, View } from 'react-native';

import { Radius, RadiusControl, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { haptic } from '@/lib/haptics';

import { ThemedText } from './themed-text';

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
    selected: { borderColor: theme.select, backgroundColor: theme.selectBg },
    correct: { borderColor: theme.success, backgroundColor: theme.successBg },
    wrong: { borderColor: theme.danger, backgroundColor: theme.dangerBg },
  }[state];
  const chip = {
    idle: { backgroundColor: theme.backgroundElement, borderColor: theme.borderStrong, color: theme.textSecondary },
    selected: { backgroundColor: theme.select, borderColor: theme.select, color: '#FFFFFF' },
    correct: { backgroundColor: theme.success, borderColor: theme.success, color: '#FFFFFF' },
    wrong: { backgroundColor: theme.danger, borderColor: theme.danger, color: '#FFFFFF' },
  }[state];
  const suffix = state === 'correct' ? ` (${notes.correct})` : state === 'wrong' ? ` (${notes.wrong})` : '';
  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityState={{ checked: state === 'selected' || state === 'wrong' }}
      accessibilityLabel={`${letter}. ${label}${suffix}`}
      onPress={() => {
        if (state === 'idle') haptic.tap();
        onPress();
      }}
      style={({ pressed, hovered }: { pressed: boolean; hovered?: boolean }) => [
        styles.option,
        look,
        state !== 'idle' ? { borderWidth: 2, paddingHorizontal: Spacing.three + 3 } : null,
        dimmed ? { opacity: 0.7 } : null,
        hovered && state === 'idle' ? { borderColor: theme.borderStrong, backgroundColor: theme.background } : null,
        pressed && state === 'idle' ? styles.optionPressed : null,
      ]}>
      <View style={[styles.chip, { backgroundColor: chip.backgroundColor, borderColor: chip.borderColor }]}>
        <ThemedText type="smallBold" style={{ color: chip.color }}>
          {state === 'correct' ? '✓' : state === 'wrong' ? '✕' : letter}
        </ThemedText>
      </View>
      <View style={{ flex: 1, gap: Spacing.half }}>
        <ThemedText>{label}</ThemedText>
        {suffix ? (
          <ThemedText type="smallBold" themeColor={state === 'correct' ? 'successDark' : 'textSecondary'}>
            {state === 'correct' ? notes.correct : notes.wrong}
          </ThemedText>
        ) : null}
      </View>
    </Pressable>
  );
}

/** The explanation shown after answering, with the handbook source as a tab. */
export function Feedback({ good, title, explanation, source, onReport }: { good: boolean; title: string; explanation: string; source?: string; onReport?: () => void }) {
  const theme = useTheme();
  return (
    <View style={[styles.explain, { backgroundColor: theme.backgroundElement, borderColor: theme.border }]}>
      <ThemedText type="heading">{title}</ThemedText>
      <ThemedText>{explanation}</ThemedText>
      {source ? (
        <View style={[styles.cite, { backgroundColor: theme.backgroundSelected }]}>
          <ThemedText type="eyebrow" themeColor="textSecondary">
            Source
          </ThemedText>
          <ThemedText type="small">{source}</ThemedText>
        </View>
      ) : null}
      {onReport ? <ReportLink onPress={onReport} /> : null}
    </View>
  );
}

/** "Report a problem": opens an email with the question already filled in (lib/report.ts). */
export function ReportLink({ onPress, label = 'Something wrong with this question? Report it' }: { onPress: () => void; label?: string }) {
  return (
    <Pressable accessibilityRole="link" onPress={onPress} hitSlop={6} style={styles.report}>
      <ThemedText type="small" themeColor="textSecondary" style={{ textDecorationLine: 'underline' }}>
        {label}
      </ThemedText>
    </Pressable>
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
    borderWidth: 1,
    borderRadius: RadiusControl,
    paddingVertical: Spacing.three - 2,
    paddingHorizontal: Spacing.three + 4,
    minHeight: 60,
  },
  optionPressed: { transform: [{ scale: 0.985 }] },
  chip: { width: 30, height: 30, borderRadius: 999, borderWidth: 1.5, alignItems: 'center', justifyContent: 'center' },
  report: { alignSelf: 'flex-start', minHeight: 32, justifyContent: 'center' },
  explain: { borderRadius: Radius, borderWidth: 1, padding: Spacing.four, gap: Spacing.two },
  cite: { borderRadius: 12, paddingVertical: Spacing.two, paddingHorizontal: Spacing.two + 4, gap: Spacing.half, alignSelf: 'flex-start' },
});
