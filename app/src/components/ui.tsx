import { Link, type Href } from 'expo-router';
import { type ReactNode } from 'react';
import { Pressable, ScrollView, StyleSheet, View, type ViewProps } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { MaxContentWidth, Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { DISCLAIMER, SITE_NAME, containsDrafts } from '@/lib/content';

import { ThemedText } from './themed-text';

export function Screen({ children }: { children: ReactNode }) {
  const theme = useTheme();
  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.background }]}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <View style={styles.column}>
          <View style={[styles.nav, { borderBottomColor: theme.border }]}>
            <Link href="/" style={styles.brand}>
              <ThemedText type="bold">{SITE_NAME}</ThemedText>
            </Link>
            <View style={styles.navLinks}>
              <NavLink href="/wait-times">Wait times</NavLink>
              <NavLink href="/guides">Guides</NavLink>
              <NavLink href="/about">About</NavLink>
            </View>
          </View>
          {containsDrafts ? (
            <Notice tone="warning">Draft content. These questions have not yet been reviewed by the instructor.</Notice>
          ) : null}
          {children}
          <View style={[styles.footer, { borderTopColor: theme.border }]}>
            <View style={styles.footerLinks}>
              <NavLink href="/cfsc-practice-test">CFSC practice test</NavLink>
              <NavLink href="/crfsc-practice-test">CRFSC practice test</NavLink>
              <NavLink href="/pal-test-questions">PAL test questions</NavLink>
              <NavLink href="/wait-times">PAL wait times</NavLink>
              <NavLink href="/spot">Spot the mistake</NavLink>
            </View>
            <ThemedText type="small" themeColor="textSecondary">
              {DISCLAIMER}
            </ThemedText>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function NavLink({ href, children }: { href: Href; children: ReactNode }) {
  return (
    <Link href={href} style={styles.navLink}>
      <ThemedText type="small" themeColor="textSecondary">
        {children}
      </ThemedText>
    </Link>
  );
}

export function Card({ style, ...rest }: ViewProps) {
  const theme = useTheme();
  return <View style={[styles.card, { backgroundColor: theme.backgroundElement }, style]} {...rest} />;
}

export function Notice({ tone, children }: { tone: 'warning' | 'success' | 'danger'; children: ReactNode }) {
  const theme = useTheme();
  return (
    <View style={[styles.notice, { backgroundColor: theme[`${tone}Bg`] }]}>
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
  variant?: 'primary' | 'secondary';
  disabled?: boolean;
};

export function Button({ label, onPress, href, variant = 'primary', disabled }: ButtonProps) {
  const theme = useTheme();
  const primary = variant === 'primary';
  // The look lives on an inner View: Link asChild replaces the style of the element it wraps.
  const body = (
    <Pressable accessibilityRole={href ? 'link' : 'button'} disabled={disabled} onPress={onPress}>
      <View
        style={[
          styles.button,
          disabled
            ? { backgroundColor: theme.backgroundSelected }
            : primary
              ? { backgroundColor: theme.accent }
              : { backgroundColor: theme.background, borderColor: theme.border, borderWidth: 1 },
        ]}>
        <ThemedText type="bold" themeColor={disabled ? 'textSecondary' : primary ? 'onAccent' : 'text'}>
          {label}
        </ThemedText>
      </View>
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

export function ProgressBar({ value }: { value: number }) {
  const theme = useTheme();
  const pct = Math.max(0, Math.min(1, value));
  return (
    <View style={[styles.track, { backgroundColor: theme.backgroundSelected }]}>
      <View style={[styles.fill, { backgroundColor: theme.accent, width: `${Math.round(pct * 100)}%` }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  scroll: { flexGrow: 1, alignItems: 'center', paddingHorizontal: Spacing.three, paddingBottom: Spacing.five },
  column: { width: '100%', maxWidth: MaxContentWidth, gap: Spacing.three },
  nav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.three,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  brand: { paddingVertical: Spacing.one },
  footerLinks: { flexDirection: 'row', flexWrap: 'wrap', marginHorizontal: -Spacing.two },
  navLinks: { flexDirection: 'row', gap: Spacing.one },
  navLink: { paddingVertical: Spacing.two, paddingHorizontal: Spacing.two, minHeight: 44, justifyContent: 'center' },
  footer: { marginTop: Spacing.four, paddingTop: Spacing.three, borderTopWidth: StyleSheet.hairlineWidth },
  card: { borderRadius: Radius, padding: Spacing.three, gap: Spacing.two },
  notice: { borderRadius: Radius, paddingVertical: Spacing.two, paddingHorizontal: Spacing.three },
  button: {
    minHeight: 48,
    borderRadius: Radius,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    alignItems: 'center',
    justifyContent: 'center',
  },
  track: { height: 8, borderRadius: 4, overflow: 'hidden' },
  fill: { height: 8, borderRadius: 4 },
});
