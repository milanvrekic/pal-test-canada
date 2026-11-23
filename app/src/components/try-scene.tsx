import { useState } from 'react';
import { Image, StyleSheet, View } from 'react-native';

import { Spacing } from '@/constants/theme';
import { drillPhotos } from '@/content/drill-photos';
import { useTheme } from '@/hooks/use-theme';
import { track } from '@/lib/analytics';
import { type Drill, drills } from '@/lib/content';

import { AnswerOption } from './answer';
import { ThemedText } from './themed-text';
import { Button } from './ui';

// A fixed order (not random) so the pre-rendered page and the app agree; the answer is not in first place.
const ORDER = [1, 0, 3, 2];

/** "Try one now": a real Spot-the-mistake scene in the home hero, answerable in place (Zutobi-style). */
export function TryScene() {
  const theme = useTheme();
  const [picked, setPicked] = useState<number | null>(null);
  const d: Drill | undefined =
    drills.find((x) => x.id === 'spot-pass-closed' && x.photo && drillPhotos[x.photo]) ?? drills.find((x) => x.photo && drillPhotos[x.photo]);
  if (!d?.photo) return null;
  const order = ORDER.filter((i) => i < d.options.length);
  const answered = picked !== null;
  const right = picked === d.answer;

  return (
    <View style={[styles.card, { backgroundColor: theme.backgroundElement, borderColor: theme.border }]}>
      <View style={styles.photo} accessibilityRole="image" accessibilityLabel={d.alt ?? 'Practice scene'}>
        <Image source={drillPhotos[d.photo]} style={styles.fill} resizeMode="cover" accessibilityIgnoresInvertColors />
        <View style={[styles.tag, { backgroundColor: 'rgba(10,11,14,0.55)' }]}>
          <ThemedText type="eyebrow" style={{ color: '#FFFFFF' }}>
            Try one now
          </ThemedText>
        </View>
      </View>
      <View style={styles.body}>
        <ThemedText type="subheading" style={{ fontSize: 19, lineHeight: 26 }}>
          {d.question}
        </ThemedText>
        {answered ? (
          <View style={[styles.result, { backgroundColor: right ? theme.successBg : theme.dangerBg }]}>
            <View style={{ flex: 1, gap: 2 }}>
              <ThemedText type="bold" themeColor={right ? 'successDark' : 'dangerDark'}>
                {right ? 'Spotted it.' : 'Not quite. Look again at the green answer.'}
              </ThemedText>
              <ThemedText type="small" numberOfLines={3}>
                {d.explanation}
              </ThemedText>
            </View>
          </View>
        ) : null}
        <View style={{ gap: Spacing.two }} accessibilityRole="radiogroup">
          {order.map((i, pos) => (
            <AnswerOption
              key={i}
              letter={String.fromCharCode(65 + pos)}
              label={d.options[i]}
              state={!answered ? 'idle' : i === d.answer ? 'correct' : i === picked ? 'wrong' : 'idle'}
              dimmed={answered && i !== d.answer && i !== picked}
              notes={{ correct: 'The mistake', wrong: 'Your pick: this part is safe' }}
              onPress={() => {
                if (answered) return;
                setPicked(i);
                track({ name: 'test_completed', course: 'all', mode: 'hero_scene', correct: i === d.answer ? 1 : 0, total: 1 });
              }}
            />
          ))}
        </View>
        {answered ? <Button label={`Try ${drills.length - 1} more scenes`} href="/spot" /> : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: 28, borderWidth: 1, overflow: 'hidden', boxShadow: '0 1px 2px rgba(28,43,51,0.06), 0 24px 48px -16px rgba(28,43,51,0.22)' },
  photo: { width: '100%', aspectRatio: 16 / 9, overflow: 'hidden' },
  fill: { width: '100%', height: '100%' },
  tag: { position: 'absolute', top: Spacing.three, left: Spacing.three, borderRadius: 999, paddingHorizontal: Spacing.two + 4, paddingVertical: Spacing.one },
  body: { padding: Spacing.three + 4, gap: Spacing.three },
  result: { borderRadius: 16, padding: Spacing.three, flexDirection: 'row' },
});
