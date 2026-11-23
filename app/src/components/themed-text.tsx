import { Platform, StyleSheet, Text, type TextProps } from 'react-native';

import { Fonts, type ThemeColor } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export type ThemedTextProps = TextProps & {
  type?: 'default' | 'title' | 'display' | 'heading' | 'subheading' | 'small' | 'smallBold' | 'bold' | 'eyebrow' | 'stat' | 'statSmall';
  themeColor?: ThemeColor;
};

export function ThemedText({ style, type = 'default', themeColor, ...rest }: ThemedTextProps) {
  const theme = useTheme();
  return <Text style={[{ color: theme[themeColor ?? 'text'] }, styles[type], style]} {...rest} />;
}

const web = Platform.OS === 'web';
// On the web one variable family carries every weight; native static files carry their own weight.
const w = (weight: '500' | '600' | '700' | '800') => (web ? { fontWeight: weight } : {});

// Fluid sizes on the web (CSS clamp), fixed on native.
const fluid = (min: number, vw: number, max: number) => (web ? (`clamp(${min}px, ${vw}vw, ${max}px)` as unknown as number) : min);

const styles = StyleSheet.create({
  default: { fontFamily: Fonts.body, fontSize: 16, lineHeight: 24 },
  bold: { fontFamily: Fonts.body, fontSize: 16, lineHeight: 24, fontWeight: '600' },
  small: { fontFamily: Fonts.body, fontSize: 14, lineHeight: 20 },
  smallBold: { fontFamily: Fonts.body, fontSize: 14, lineHeight: 20, fontWeight: '600' },
  /** Hero headline: oversized and tight. */
  display: { fontFamily: Fonts.display, ...w('800'), fontSize: fluid(42, 5.4, 76), lineHeight: (web ? '1.0' : 46) as unknown as number, letterSpacing: web ? ('-0.045em' as unknown as number) : -1.6 },
  title: { fontFamily: Fonts.display, ...w('800'), fontSize: fluid(34, 3.6, 48), lineHeight: (web ? '1.06' : 38) as unknown as number, letterSpacing: web ? ('-0.035em' as unknown as number) : -1 },
  heading: { fontFamily: Fonts.bold, ...w('700'), fontSize: 22, lineHeight: 28, letterSpacing: -0.5 },
  subheading: { fontFamily: Fonts.semi, ...w('600'), fontSize: 20, lineHeight: 28, letterSpacing: -0.3 },
  eyebrow: { fontFamily: Fonts.semi, ...w('600'), fontSize: 13, lineHeight: 16, letterSpacing: 0 },
  stat: { fontFamily: Fonts.display, ...w('800'), fontSize: 52, lineHeight: 54, letterSpacing: -2, fontVariant: ['tabular-nums'] },
  statSmall: { fontFamily: Fonts.bold, ...w('700'), fontSize: 15, lineHeight: 20, fontVariant: ['tabular-nums'] },
});
