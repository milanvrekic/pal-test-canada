import { StyleSheet, Text, type TextProps } from 'react-native';

import { Fonts, type ThemeColor } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export type ThemedTextProps = TextProps & {
  type?: 'default' | 'title' | 'heading' | 'subheading' | 'small' | 'smallBold' | 'bold' | 'eyebrow' | 'stat' | 'statSmall';
  themeColor?: ThemeColor;
};

export function ThemedText({ style, type = 'default', themeColor, ...rest }: ThemedTextProps) {
  const theme = useTheme();
  return <Text style={[{ color: theme[themeColor ?? 'text'] }, styles[type], style]} {...rest} />;
}

const styles = StyleSheet.create({
  default: { fontSize: 16, lineHeight: 24 },
  bold: { fontSize: 16, lineHeight: 24, fontWeight: '600' },
  small: { fontSize: 14, lineHeight: 20 },
  smallBold: { fontSize: 14, lineHeight: 20, fontWeight: '600' },
  // Headings use the expanded display face.
  title: { fontFamily: Fonts.display, fontSize: 34, lineHeight: 40, letterSpacing: -0.4 },
  heading: { fontFamily: Fonts.displaySemi, fontSize: 21, lineHeight: 27, letterSpacing: -0.2 },
  // Question text stays in the reading font: it is read closely, not scanned.
  subheading: { fontSize: 19, lineHeight: 27, fontWeight: '600' },
  eyebrow: { fontSize: 12, lineHeight: 16, fontWeight: '700', letterSpacing: 1.2, textTransform: 'uppercase' },
  stat: { fontFamily: Fonts.display, fontSize: 44, lineHeight: 48, letterSpacing: -1, fontVariant: ['tabular-nums'] },
  statSmall: { fontFamily: Fonts.displaySemi, fontSize: 18, lineHeight: 22, fontVariant: ['tabular-nums'] },
});
