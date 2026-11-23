import { Link, type Href } from 'expo-router';
import { type ReactNode } from 'react';
import { Pressable, ScrollView, StyleSheet, View, type StyleProp, type ViewProps, type ViewStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import Svg, { Circle, Path } from 'react-native-svg';

import { Fonts, MaxContentWidth, MaxWideWidth, Radius, RadiusControl, Shadow, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { DISCLAIMER, SITE_NAME, containsDrafts } from '@/lib/content';

import { ThemedText } from './themed-text';

type ScreenProps = {
  children: ReactNode;
  /** "wide" lets a page lay out in columns on desktop; reading pages stay at a comfortable line length. */
  width?: 'reading' | 'wide';
  /** Pinned to the bottom of the viewport, outside the scroll area (e.g. the quiz Next button). */
  bottomBar?: ReactNode;
};

export function Screen({ children, width = 'reading', bottomBar }: ScreenProps) {
  const theme = useTheme();
  const maxWidth = width === 'wide' ? MaxWideWidth : MaxContentWidth;
  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.background }]} edges={['top', 'left', 'right']}>
      <View style={[styles.navBar, { borderBottomColor: theme.border, backgroundColor: theme.background }]}>
        <View style={[styles.navInner, { maxWidth: MaxWideWidth }]}>
          <Link href="/" style={styles.brand} accessibilityLabel={`${SITE_NAME} home`}>
            <View style={styles.brandRow}>
              <View style={[styles.mark, { backgroundColor: theme.signal }]}>
                <Svg width={20} height={20} viewBox="0 0 24 24" accessibilityElementsHidden importantForAccessibility="no">
                  <Path d="M5 12.5l4.2 4.2L19 7" stroke={theme.onSignal} strokeWidth={3.2} strokeLinecap="round" strokeLinejoin="round" fill="none" />
                </Svg>
              </View>
              <View>
                <ThemedText style={styles.wordmark}>PAL Test Canada</ThemedText>
                <ThemedText style={[styles.tagline, { color: theme.textSecondary }]}>Independent study aid</ThemedText>
              </View>
            </View>
          </Link>
          <View style={styles.navLinks}>
            <NavLink href="/wait-times">Wait times</NavLink>
            <NavLink href="/guides">Guides</NavLink>
          </View>
        </View>
      </View>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <View style={[styles.column, { maxWidth }]}>
          {containsDrafts ? (
            <Notice tone="warning">Draft content. These questions have not yet been reviewed by the instructor.</Notice>
          ) : null}
          {children}
        </View>
        {/* Quiz and drill screens are focus modes: no footer behind the pinned Next bar. */}
        {bottomBar ? <View style={{ height: Spacing.five }} /> : <Footer />}
      </ScrollView>
      {bottomBar ? (
        <SafeAreaView edges={['bottom']} style={[styles.bottomBar, { borderTopColor: theme.border, backgroundColor: theme.background }]}>
          <View style={[styles.bottomInner, { maxWidth }]}>{bottomBar}</View>
        </SafeAreaView>
      ) : null}
    </SafeAreaView>
  );
}

const FOOTER_GROUPS: { title: string; links: { href: Href; label: string }[] }[] = [
  {
    title: 'Practice',
    links: [
      { href: '/cfsc-practice-test', label: 'CFSC practice test' },
      { href: '/crfsc-practice-test', label: 'CRFSC practice test' },
      { href: '/pal-test-questions', label: 'PAL test questions' },
      { href: '/spot', label: 'Spot the mistake' },
    ],
  },
  {
    title: 'Your licence',
    links: [
      { href: '/wait-times', label: 'PAL wait times' },
      { href: '/guides', label: 'Guides' },
      { href: '/about', label: 'About' },
    ],
  },
];

function Footer() {
  const theme = useTheme();
  return (
    <View style={styles.footer}>
      <View style={[styles.footerInner, { maxWidth: MaxWideWidth, borderTopColor: theme.border }]}>
        <View style={styles.footerGroups}>
          {FOOTER_GROUPS.map((g) => (
            <View key={g.title} style={styles.footerGroup}>
              <ThemedText type="eyebrow" themeColor="textSecondary">
                {g.title}
              </ThemedText>
              {g.links.map((l) => (
                <Link key={l.label} href={l.href} style={styles.footerLink}>
                  <ThemedText type="small">{l.label}</ThemedText>
                </Link>
              ))}
            </View>
          ))}
        </View>
        <ThemedText type="small" themeColor="textSecondary" style={styles.disclaimer}>
          {DISCLAIMER}
        </ThemedText>
      </View>
    </View>
  );
}

function NavLink({ href, children }: { href: Href; children: ReactNode }) {
  return (
    <Link href={href} style={styles.navLink}>
      <ThemedText type="smallBold" themeColor="textSecondary">
        {children}
      </ThemedText>
    </Link>
  );
}

/** Side-by-side on wide screens, stacked on narrow ones. Pure flex, so it renders the same on the server. */
export function Split({ children, gap = Spacing.three, style }: { children: ReactNode; gap?: number; style?: StyleProp<ViewStyle> }) {
  return <View style={[styles.split, { gap }, style]}>{children}</View>;
}

/** A column inside Split. `basis` is the width below which columns wrap. */
export function Col({ children, basis = 320, grow = 1, style }: { children: ReactNode; basis?: number; grow?: number; style?: StyleProp<ViewStyle> }) {
  return <View style={[{ flexBasis: basis, flexGrow: grow, flexShrink: 1, minWidth: 0 }, style]}>{children}</View>;
}

export function Card({ style, ...rest }: ViewProps) {
  const theme = useTheme();
  return <View style={[styles.card, Shadow, { backgroundColor: theme.backgroundElement }, style]} {...rest} />;
}

/** Small uppercase label above a title. */
export function Eyebrow({ children, tone = 'textSecondary' }: { children: ReactNode; tone?: 'textSecondary' | 'signal' | 'accent' }) {
  return (
    <ThemedText type="eyebrow" themeColor={tone}>
      {children}
    </ThemedText>
  );
}

export function Notice({ tone, children }: { tone: 'warning' | 'success' | 'danger'; children: ReactNode }) {
  const theme = useTheme();
  return (
    <View style={[styles.notice, { backgroundColor: theme[`${tone}Bg`], borderLeftColor: theme[tone] }]}>
      <ThemedText type="small" themeColor={tone}>
        {children}
      </ThemedText>
    </View>
  );
}

type ButtonProps = {
  label: string;
  onPress?: () => void;
  href?: Href;
  /** signal = the one main action on a screen; primary = pine; secondary = outline. */
  variant?: 'signal' | 'primary' | 'secondary';
  disabled?: boolean;
};

export function Button({ label, onPress, href, variant = 'primary', disabled }: ButtonProps) {
  const theme = useTheme();
  const look = disabled
    ? { backgroundColor: theme.backgroundSelected, borderColor: theme.border }
    : variant === 'signal'
      ? { backgroundColor: theme.signal, borderColor: theme.signal }
      : variant === 'primary'
        ? { backgroundColor: theme.accent, borderColor: theme.accent }
        : { backgroundColor: theme.backgroundElement, borderColor: theme.border };
  const textColor = disabled ? 'textSecondary' : variant === 'signal' ? 'onSignal' : variant === 'primary' ? 'onAccent' : 'text';
  // The look lives on an inner View: Link asChild replaces the style of the element it wraps.
  const body = (
    <Pressable accessibilityRole={href ? 'link' : 'button'} accessibilityState={{ disabled: !!disabled }} disabled={disabled} onPress={onPress}>
      {({ pressed }) => (
        <View style={[styles.button, look, pressed && !disabled ? styles.pressed : null]}>
          <ThemedText type="bold" themeColor={textColor}>
            {label}
          </ThemedText>
        </View>
      )}
    </Pressable>
  );
  return href ? (
    <Link href={href} asChild>
      {body}
    </Link>
  ) : (
    body
  );
}

/** A card that is one big link, with a call to action at the bottom. */
export function LinkCard({ href, title, body, cta, children, style }: { href: Href; title: string; body?: string; cta: string; children?: ReactNode; style?: StyleProp<ViewStyle> }) {
  return (
    <Link href={href} asChild>
      <Pressable accessibilityRole="link" style={StyleSheet.flatten([{ flexGrow: 1 }, style])}>
        {({ pressed }) => (
          <Card style={[{ padding: 0, overflow: 'hidden', flexGrow: 1 }, pressed ? styles.pressed : null]}>
            {children}
            <View style={styles.linkCardBody}>
              <ThemedText type="bold">{title}</ThemedText>
              {body ? (
                <ThemedText type="small" themeColor="textSecondary">
                  {body}
                </ThemedText>
              ) : null}
              <ThemedText type="smallBold" themeColor="signal" style={{ marginTop: 'auto', paddingTop: Spacing.one }}>
                {cta} →
              </ThemedText>
            </View>
          </Card>
        )}
      </Pressable>
    </Link>
  );
}

export function ProgressBar({ value, tone = 'signal' }: { value: number; tone?: 'accent' | 'signal' }) {
  const theme = useTheme();
  const pct = Math.max(0, Math.min(1, value));
  return (
    <View style={[styles.track, { backgroundColor: theme.backgroundSelected }]}>
      <View style={[styles.fill, { backgroundColor: theme[tone], width: `${Math.round(pct * 100)}%` }]} />
    </View>
  );
}

/** A small progress ring with the percentage in the middle. */
export function Ring({ value, size = 44, stroke = 4, color, track, label }: { value: number | null; size?: number; stroke?: number; color?: string; track?: string; label?: string }) {
  const theme = useTheme();
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const v = Math.max(0, Math.min(1, value ?? 0));
  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <Svg width={size} height={size} style={StyleSheet.absoluteFill} accessibilityElementsHidden importantForAccessibility="no">
        <Circle cx={size / 2} cy={size / 2} r={r} stroke={track ?? theme.backgroundSelected} strokeWidth={stroke} fill="none" />
        {v > 0 ? (
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            stroke={color ?? theme.signal}
            strokeWidth={stroke}
            fill="none"
            strokeLinecap="round"
            strokeDasharray={`${c * v} ${c}`}
            transform={`rotate(-90 ${size / 2} ${size / 2})`}
          />
        ) : null}
      </Svg>
      {label !== undefined ? (
        <ThemedText style={{ fontSize: size > 60 ? 15 : 11, lineHeight: 14, fontWeight: '700', color: color ?? theme.signal }}>{label}</ThemedText>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  navBar: { borderBottomWidth: StyleSheet.hairlineWidth, alignItems: 'center', paddingHorizontal: Spacing.three },
  navInner: { width: '100%', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', minHeight: 60 },
  brand: { paddingVertical: Spacing.two },
  brandRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two },
  mark: { borderRadius: 10, width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  markText: { fontFamily: Fonts.display, fontSize: 14, lineHeight: 18, letterSpacing: 0.4 },
  wordmark: { fontFamily: Fonts.display, fontSize: 15, lineHeight: 19, letterSpacing: -0.2 },
  tagline: { fontSize: 11, lineHeight: 14, fontWeight: '500' },
  navLinks: { flexDirection: 'row' },
  navLink: { paddingVertical: Spacing.two, paddingHorizontal: 6, minHeight: 44, justifyContent: 'center' },
  scroll: { flexGrow: 1, alignItems: 'center', paddingHorizontal: Spacing.three, paddingTop: Spacing.four },
  column: { width: '100%', gap: Spacing.four },
  split: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'stretch' },
  footer: { width: '100%', alignItems: 'center', marginTop: Spacing.six, paddingBottom: Spacing.five },
  footerInner: { width: '100%', gap: Spacing.four, paddingTop: Spacing.four, borderTopWidth: StyleSheet.hairlineWidth },
  footerGroups: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.four },
  footerGroup: { flexBasis: 150, flexGrow: 1, maxWidth: 260, gap: Spacing.half },
  footerLink: { minHeight: 36, justifyContent: 'center', paddingVertical: Spacing.one },
  disclaimer: { maxWidth: 640 },
  card: { borderRadius: Radius, padding: Spacing.three + 4, gap: Spacing.two },
  linkCardBody: { padding: Spacing.three, gap: Spacing.one, flexGrow: 1 },
  notice: { borderRadius: RadiusControl, borderLeftWidth: 4, paddingVertical: Spacing.two + 2, paddingHorizontal: Spacing.three },
  button: {
    minHeight: 52,
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.two,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: { opacity: 0.85, transform: [{ scale: 0.99 }] },
  bottomBar: { borderTopWidth: StyleSheet.hairlineWidth, alignItems: 'center', paddingHorizontal: Spacing.three },
  bottomInner: { width: '100%', paddingVertical: Spacing.two + 4 },
  track: { height: 6, borderRadius: 3, overflow: 'hidden' },
  fill: { height: 6, borderRadius: 3 },
});
