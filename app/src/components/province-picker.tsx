import { Pressable, StyleSheet, View } from 'react-native';

import { Spacing } from '@/constants/theme';
import { PROVINCES } from '@/features/wait/stats';
import { useTheme } from '@/hooks/use-theme';
import { setProvince, useProvince } from '@/lib/province';

import { ThemedText } from './themed-text';

/** Pick your province once; tap it again to clear it. The choice stays on this device. */
export function ProvincePicker({ label = 'Your province', hint }: { label?: string; hint?: string }) {
  const theme = useTheme();
  const province = useProvince();
  return (
    <View style={{ gap: Spacing.two }}>
      <View style={{ gap: 2 }}>
        <ThemedText type="smallBold">
          {label}
          {province ? `: ${PROVINCES[province]}` : ''}
        </ThemedText>
        <ThemedText type="small" themeColor="textSecondary">
          {hint ?? 'Shows the wait times, course providers and next steps for where you live. Stays on this device.'}
        </ThemedText>
      </View>
      <View style={styles.chips} accessibilityRole="radiogroup" accessibilityLabel={label}>
        {Object.keys(PROVINCES).map((code) => {
          const active = province === code;
          return (
            <Pressable
              key={code}
              accessibilityRole="radio"
              accessibilityState={{ checked: active }}
              accessibilityLabel={PROVINCES[code]}
              onPress={() => setProvince(active ? null : code)}
              style={[
                styles.chip,
                active ? { backgroundColor: theme.accent, borderColor: theme.accent } : { borderColor: theme.borderStrong, backgroundColor: theme.backgroundElement },
              ]}>
              <ThemedText type="smallBold" style={{ color: active ? theme.onAccent : theme.text }}>
                {code}
              </ThemedText>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.two },
  chip: { borderWidth: 1, borderRadius: 999, minWidth: 48, minHeight: 40, paddingHorizontal: Spacing.two + 4, alignItems: 'center', justifyContent: 'center' },
});
