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
  display: { fontFamily: Fonts.bold, ...w('700'), fontSize: fluid(40, 4.8, 68), lineHeight: (web ? '1.05' : 46) as unknown as number, letterSpacing: web ? ('-0.035em' as unknown as number) : -1.2 },
  title: { fontFamily: Fonts.bold, ...w('700'), fontSize: fluid(32, 3.2, 44), lineHeight: (web ? '1.1' : 38) as unknown as number, letterSpacing: web ? ('-0.03em' as unknown as number) : -0.8 },
  heading: { fontFamily: Fonts.semi, ...w('600'), fontSize: 21, lineHeight: 28, letterSpacing: -0.3 },
  subheading: { fontFamily: Fonts.semi, ...w('600'), fontSize: 20, lineHeight: 28, letterSpacing: -0.3 },
  eyebrow: { fontFamily: Fonts.semi, ...w('600'), fontSize: 13, lineHeight: 16, letterSpacing: 0 },
  stat: { fontFamily: Fonts.bold, ...w('700'), fontSize: 48, lineHeight: 52, letterSpacing: -1.5, fontVariant: ['tabular-nums'] },
  statSmall: { fontFamily: Fonts.bold, ...w('700'), fontSize: 15, lineHeight: 20, fontVariant: ['tabular-nums'] },
});
