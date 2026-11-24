import { createElement } from 'react';

import { Fonts } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

/** A date picker: the browser's own (calendar on desktop, wheel or sheet on phones). Values are YYYY-MM-DD. */
export function DateField({
  value,
  onChange,
  max,
  label,
  invalid,
}: {
  value: string;
  onChange: (iso: string) => void;
  max?: string;
  label: string;
  /** Used by the native picker only; the browser's date input shows its own text. */
  shortLabel?: string;
  invalid?: boolean;
}) {
  const theme = useTheme();
  return createElement('input', {
    type: 'date',
    value,
    max,
    'aria-label': label,
    'aria-invalid': invalid || undefined,
    id: 'tracker-date',
    onChange: (e: { target: { value: string } }) => onChange(e.target.value),
    style: {
      font: `500 16px ${Fonts.body}`,
      color: theme.text,
      background: theme.background,
      border: `1px solid ${invalid ? theme.danger : theme.border}`,
      borderRadius: 16,
      padding: '12px 16px',
      minHeight: 48,
      boxSizing: 'border-box',
      width: '100%',
      colorScheme: 'light',
      accentColor: theme.accent,
    },
  });
}
