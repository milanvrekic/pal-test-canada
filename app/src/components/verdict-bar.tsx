import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';

import { haptic } from '@/lib/haptics';

import { Glass, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

import { ThemedText } from './themed-text';
import { Button } from './ui';

/**
 * Floating bottom bar for quiz and drill screens. After answering it turns into a tinted glass pill with the verdict;
 * the button stays the same ink "go" colour either way. Details live in the page, not here.
 */
export function VerdictBar({
  verdict,
  hint,
  label,
  onPress,
  disabled,
}: {
  verdict: 'correct' | 'wrong' | null;
  hint: string;
  detail?: string;
  label: string;
  onPress: () => void;
  disabled?: boolean;
}) {
  const theme = useTheme();
  const good = verdict === 'correct';
  // A buzz for the verdict on the native apps.
  useEffect(() => {
    if (verdict === 'correct') haptic.correct();
    else if (verdict === 'wrong') haptic.wrong();
  }, [verdict]);
  const tone = verdict ? (good ? { backgroundColor: `${theme.successBg}E6`, borderColor: `${theme.success}55` } : { backgroundColor: `${theme.dangerBg}E6`, borderColor: `${theme.danger}55` }) : { backgroundColor: `${theme.backgroundElement}E6`, borderColor: theme.border };
  return (
    <View style={[styles.pill, tone, Glass, styles.shadow]}>
      {verdict ? (
        <View style={styles.verdict}>
          <View style={[styles.badge, { backgroundColor: good ? theme.success : theme.danger }]}>
            <ThemedText style={styles.badgeText}>{good ? '✓' : '✕'}</ThemedText>
          </View>
          <ThemedText type="heading" themeColor={good ? 'successDark' : 'dangerDark'} numberOfLines={1}>
            {good ? 'Nice work' : 'Not quite'}
          </ThemedText>
        </View>
      ) : (
        <ThemedText type="smallBold" themeColor="textSecondary" style={styles.verdict} numberOfLines={1}>
          {hint}
        </ThemedText>
      )}
      <View style={styles.button}>
        <Button label={label} onPress={onPress} disabled={disabled} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  pill: { flexDirection: 'row', alignItems: 'center', gap: Spacing.three, borderWidth: 1, borderRadius: 999, paddingVertical: Spacing.two, paddingLeft: Spacing.three, paddingRight: Spacing.two },
  shadow: { boxShadow: '0 10px 30px -10px rgba(10, 11, 14, 0.25)' },
  verdict: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two + 2, flex: 1, minWidth: 0 },
  badge: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  badgeText: { color: '#FFFFFF', fontSize: 16, lineHeight: 20, fontWeight: '800' },
  button: { width: 170 },
});
