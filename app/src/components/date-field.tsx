import DateTimePicker, { DateTimePickerAndroid } from '@react-native-community/datetimepicker';
import { useEffect } from 'react';
import { Platform, Pressable, StyleSheet, View } from 'react-native';

import { RadiusControl, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

import { ThemedText } from './themed-text';

const toIso = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
const fromIso = (s: string) => {
  const [y, m, d] = s.split('-').map(Number);
  return y && m && d ? new Date(y, m - 1, d) : new Date();
};

/** A date picker: iOS shows its compact date control, Android opens its calendar dialog. Values are YYYY-MM-DD. */
export function DateField({
  value,
  onChange,
  max,
  label,
  shortLabel,
  invalid,
}: {
  value: string;
  onChange: (iso: string) => void;
  max?: string;
  label: string;
  /** Short text shown beside the iOS picker. Defaults to the label. */
  shortLabel?: string;
  invalid?: boolean;
}) {
  const theme = useTheme();
  const date = value ? fromIso(value) : max ? fromIso(max) : new Date();
  const maximumDate = max ? fromIso(max) : undefined;
  // iOS always shows a date and only reports changes, so a date left as shown (today) was never picked. Make the shown
  // date the value.
  const shown = toIso(date);
  useEffect(() => {
    if (Platform.OS === 'ios' && !value) onChange(shown);
  }, [value, shown, onChange]);

  if (Platform.OS === 'ios') {
    return (
      <View
        style={[
          styles.field,
          {
            borderColor: invalid ? theme.danger : theme.border,
            backgroundColor: theme.background,
          },
        ]}>
        <ThemedText themeColor="textSecondary" style={{ flexShrink: 1 }}>
          {shortLabel ?? label}
        </ThemedText>
        <DateTimePicker
          value={date}
          mode="date"
          display="compact"
          maximumDate={maximumDate}
          accentColor={theme.accent}
          accessibilityLabel={label}
          onChange={(_, d) => d && onChange(toIso(d))}
        />
      </View>
    );
  }

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityHint="Opens a calendar"
      onPress={() =>
        DateTimePickerAndroid.open({
          value: date,
          mode: 'date',
          maximumDate,
          onChange: (e, d) => e.type === 'set' && d && onChange(toIso(d)),
        })
      }
      style={({ pressed }) => [
        styles.field,
        {
          borderColor: invalid ? theme.danger : theme.border,
          backgroundColor: pressed ? theme.backgroundSelected : theme.background,
        },
      ]}>
      <ThemedText themeColor={value ? 'text' : 'textSecondary'}>
        {value
          ? date.toLocaleDateString('en-CA', {
              weekday: 'short',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })
          : 'Choose a date'}
      </ThemedText>
      <ThemedText type="smallBold" themeColor="accent">
        Change
      </ThemedText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  field: {
    minHeight: 52,
    borderWidth: 1,
    borderRadius: RadiusControl,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.three,
  },
});
