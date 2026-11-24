import { Link, type Href, usePathname, useRouter } from 'expo-router';
import { type ReactNode } from 'react';
import { Linking, Platform, Pressable, ScrollView, StyleSheet, View, type StyleProp, type ViewProps, type ViewStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import Svg, { Circle, Path, G, Rect } from 'react-native-svg';

import { Fonts, Glass, MaxContentWidth, MaxWideWidth, Radius, RadiusControl, Shadow, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { track } from '@/lib/analytics';
import { DISCLAIMER, SITE_NAME, containsDrafts, guides } from '@/lib/content';
import { type AppId, hrefFor, usePromo } from '@/lib/handoff';

import { ThemedText } from './themed-text';

type ScreenProps = {
  children: ReactNode;
  /** "wide" lets a page lay out in columns on desktop; reading pages stay at a comfortable line length. */
  width?: 'reading' | 'wide';
  /** Pinned to the bottom of the viewport, outside the scroll area (e.g. the quiz Next button). */
  bottomBar?: ReactNode;
  /** Tints the bottom bar after answering, Duolingo style. */
  bottomTone?: 'success' | 'danger' | null;
};

// The app layout; EXPO_PUBLIC_APP_LAYOUT=1 renders it on the web for screenshots and review.
const native = Platform.OS !== 'web' || process.env.EXPO_PUBLIC_APP_LAYOUT === '1';
/** True in the iOS and Android apps (and the web preview of them); false on the website. */
export const APP_LAYOUT = native;
const TAB_ROOTS = ['/', '/practical', '/spot', '/wait-times', '/more'];

/** The native apps' slim header: the logo on a tab's first screen, a Back button on screens opened on top. */
function AppHeader() {
  const theme = useTheme();
  const router = useRouter();
  const path = usePathname();
  const back = !TAB_ROOTS.includes(path) && router.canGoBack();
  return (
    <View style={[styles.appHeader, { borderBottomColor: theme.border, backgroundColor: theme.background }]}>
      {back ? (
        <Pressable accessibilityRole="button" accessibilityLabel="Back" onPress={() => router.back()} hitSlop={12} style={styles.backBtn}>
          <ThemedText type="bold" themeColor="accent" style={{ fontSize: 17 }}>
            ‹ Back
          </ThemedText>
        </Pressable>
      ) : (
        <View style={styles.brandRow}>
          <View style={[styles.mark, { backgroundColor: theme.brand, width: 28, height: 28, borderRadius: 8 }]}>
            <LogoGlyph size={20} />
          </View>
          <ThemedText style={[styles.wordmark, styles.appWordmark]}>PAL TEST CANADA</ThemedText>
        </View>
      )}
    </View>
  );
}

/** The app-icon glyph: a licence card with the holder's photo and a check. Same drawing as store/icon/pal-test-icon.svg
 * (tools/icons/make-icons.py renders every icon from it). */
function LogoGlyph({ size }: { size: number }) {
  return (
    <Svg width={size} height={size} viewBox="112 112 800 800" accessibilityElementsHidden importantForAccessibility="no">
      <G fill="none" stroke="#FFFFFF" strokeWidth={64} strokeLinecap="round" strokeLinejoin="round">
        <Rect x={186} y={292} width={652} height={440} rx={72} />
        <Circle cx={366} cy={462} r={58} />
        <Path d="M270 640 c14-64 56-96 96-96 s82 32 96 96" />
        <Path d="M548 520 L614 586 L730 470" />
        <Path d="M556 662 H730" />
      </G>
    </Svg>
  );
}

export function Screen({ children, width = 'reading', bottomBar, bottomTone }: ScreenProps) {
  const theme = useTheme();
  const maxWidth = width === 'wide' ? MaxWideWidth : MaxContentWidth;
  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.background }]} edges={['top', 'left', 'right']}>
      {native ? <AppHeader /> : (
      <View style={[styles.navBar, { borderBottomColor: theme.border, backgroundColor: `${theme.background}D9` }, Glass]}>
        <View style={[styles.navInner, { maxWidth: MaxWideWidth }]}>
          <Link href="/" style={styles.brand} accessibilityLabel={`${SITE_NAME} home`}>
            <View style={styles.brandRow}>
              <View style={[styles.mark, { backgroundColor: theme.brand }]}>
                <LogoGlyph size={26} />
              </View>
              <View>
                <ThemedText style={styles.wordmark}>PAL TEST CANADA</ThemedText>
                <ThemedText style={[styles.tagline, { color: theme.textSecondary }]}>Independent study aid</ThemedText>
              </View>
            </View>
          </Link>
          <View style={styles.navLinks}>
            <NavLink href="/pal-courses/bc">Courses</NavLink>
            <NavLink href="/wait-times">Wait times</NavLink>
          </View>
        </View>
      </View>
      )}
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <View style={[styles.column, { maxWidth }]}>
          {containsDrafts ? (
            <Notice tone="warning">Draft content. These questions have not yet been reviewed by the instructor.</Notice>
          ) : null}
          {children}
        </View>
        {/* Quiz and drill screens are focus modes: no footer behind the pinned Next bar. The apps have no web footer. */}
        {bottomBar || native ? <View style={{ height: Spacing.five }} /> : <Footer />}
      </ScrollView>
      {bottomBar ? (
        <SafeAreaView edges={['bottom']} style={[styles.bottomBar, { backgroundColor: theme.background }]}>
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
      { href: '/practical', label: 'Practical test trainer' },
      { href: '/flashcards', label: 'Flashcards' },
      { href: '/rules', label: 'Storage and transport rules' },
    ],
  },
  {
    title: 'Your licence',
    links: [
      { href: '/pal-courses', label: 'PAL courses by province' },
      { href: '/apply', label: 'Application checklist' },
      { href: '/wait-times', label: 'PAL wait times' },
      ...(guides.some((g) => g.slug === 'after-you-get-your-pal') ? [{ href: '/guides/after-you-get-your-pal', label: 'After you get your PAL' }] : []),
      { href: '/guides', label: 'Guides' },
      { href: '/about', label: 'About' },
      { href: '/privacy', label: 'Privacy' },
      { href: '/terms', label: 'Terms of use' },
    ],
  },
];

const FAMILY: AppId[] = ['huntable', 'fishable', 'campable', 'shootable'];

function Footer() {
  const theme = useTheme();
  const family = usePromo(FAMILY);
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
          <View style={styles.footerGroup}>
            <ThemedText type="eyebrow" themeColor="textSecondary">
              Outdoor apps by 10ten
            </ThemedText>
            {family.map((a) => (
              <Pressable
                key={a.id}
                accessibilityRole="link"
                onPress={() => {
                  track({ name: 'handoff_click', destination: a.id, placement: 'footer' });
                  void Linking.openURL(hrefFor(a, 'footer'));
                }}
                style={styles.footerLink}>
                <ThemedText type="small">
                  {a.name}
                  {a.soon ? <ThemedText type="small" themeColor="textSecondary">{' · coming soon'}</ThemedText> : null}
                </ThemedText>
              </Pressable>
            ))}
          </View>
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
  return <View style={[styles.card, Shadow, { backgroundColor: theme.backgroundElement, borderColor: theme.border }, style]} {...rest} />;
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
  /**
   * primary = ink pill (signal is an alias); secondary = white pill with a hairline;
   * inverse = white pill for dark surfaces; glass = frosted pill for dark surfaces.
   */
  variant?: 'signal' | 'primary' | 'secondary' | 'inverse' | 'glass' | 'danger';
  disabled?: boolean;
  size?: 'md' | 'lg';
};

export function Button({ label, onPress, href, variant = 'primary', disabled, size = 'md' }: ButtonProps) {
  const theme = useTheme();
  const v = variant === 'signal' || variant === 'danger' ? 'primary' : variant;
  const look = disabled
    ? { backgroundColor: theme.backgroundSelected, borderColor: theme.backgroundSelected }
    : {
        primary: { backgroundColor: theme.accent, borderColor: theme.accent },
        secondary: { backgroundColor: theme.backgroundSelected, borderColor: theme.backgroundSelected },
        inverse: { backgroundColor: '#FFFFFF', borderColor: '#FFFFFF' },
        glass: { backgroundColor: 'rgba(255,255,255,0.10)', borderColor: 'rgba(255,255,255,0.22)', ...Glass },
      }[v];
  const color = disabled
    ? theme.textSecondary
    : { primary: theme.onAccent, secondary: theme.text, inverse: '#0A0B0E', glass: '#FFFFFF' }[v];
  // The look lives on an inner View: Link asChild replaces the style of the element it wraps.
  const body = (
    <Pressable accessibilityRole={href ? 'link' : 'button'} accessibilityState={{ disabled: !!disabled }} disabled={disabled} onPress={onPress}>
      {({ pressed }) => (
        <View style={[styles.button, size === 'lg' ? styles.buttonLg : null, look, pressed && !disabled ? styles.pressed : null]}>
          <ThemedText type="bold" style={{ color, textAlign: 'center', fontSize: size === 'lg' ? 17 : 16 }}>
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
              <ThemedText type="smallBold" style={{ marginTop: 'auto', paddingTop: Spacing.one }}>
                {cta} →
              </ThemedText>
            </View>
          </Card>
        )}
      </Pressable>
    </Link>
  );
}

export function ProgressBar({ value, tone = 'accent', height = 8 }: { value: number; tone?: 'accent' | 'signal'; height?: number }) {
  const theme = useTheme();
  const pct = Math.max(0, Math.min(1, value));
  return (
    <View style={[styles.track, { backgroundColor: theme.track, height, borderRadius: height / 2 }]}>
      <View style={[styles.fill, { backgroundColor: theme[tone], width: `${Math.round(pct * 100)}%`, height, borderRadius: height / 2 }]} />
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
        <ThemedText
          style={
            size > 60
              ? { fontFamily: Fonts.display, fontWeight: Platform.OS === 'web' ? '800' : undefined, fontSize: Math.round(size * 0.24), lineHeight: Math.round(size * 0.3), letterSpacing: -1, color: theme.text, fontVariant: ['tabular-nums'] }
              : { fontSize: 11, lineHeight: 14, fontWeight: '700', color: theme.text }
          }>
          {label}
        </ThemedText>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  appHeader: { borderBottomWidth: StyleSheet.hairlineWidth, paddingHorizontal: Spacing.three, minHeight: 48, justifyContent: 'center' },
  backBtn: { minHeight: 44, justifyContent: 'center', alignSelf: 'flex-start' },
  navBar: { borderBottomWidth: StyleSheet.hairlineWidth, alignItems: 'center', paddingHorizontal: Spacing.three },
  navInner: { width: '100%', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', minHeight: 60 },
  brand: { paddingVertical: Spacing.two },
  brandRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two },
  mark: { borderRadius: 11, width: 34, height: 34, alignItems: 'center', justifyContent: 'center' },
  markText: { fontFamily: Fonts.display, fontSize: 14, lineHeight: 18, letterSpacing: 0.4 },
  wordmark: { fontFamily: Fonts.logo, fontWeight: Platform.OS === 'web' ? '700' : undefined, fontSize: 22, lineHeight: 22, letterSpacing: 0.4, textTransform: 'uppercase' },
  /** Khand's line box is tall (ascent 1.05em, descent 0.48em). On iOS a lineHeight below that keeps the baseline pinned
   * to the bottom, so the capitals rode ~5pt above the tile's centre. 31 is the font's natural line at 20pt (1.53em), so
   * nothing is squeezed; the 1pt nudge centres the capitals (not the line box) on the 28pt tile. */
  appWordmark: { fontSize: 20, lineHeight: 31, includeFontPadding: false, transform: [{ translateY: 1 }] },
  tagline: { fontSize: 12, lineHeight: 16, fontWeight: '500' },
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
  card: { borderRadius: Radius, borderWidth: 1, padding: Spacing.four, gap: Spacing.two },
  linkCardBody: { padding: Spacing.three, gap: Spacing.one, flexGrow: 1 },
  notice: { borderRadius: RadiusControl, borderLeftWidth: 4, paddingVertical: Spacing.two + 2, paddingHorizontal: Spacing.three },
  button: {
    minHeight: 50,
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.two,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonLg: { minHeight: 58, paddingHorizontal: Spacing.five },
  buttonPressed: { transform: [{ scale: 0.97 }] },
  pressed: { opacity: 0.9, transform: [{ scale: 0.97 }] },
  bottomBar: { alignItems: 'center', paddingHorizontal: Spacing.three },
  bottomInner: { width: '100%', paddingTop: Spacing.two, paddingBottom: Spacing.three },
  track: { height: 6, borderRadius: 3, overflow: 'hidden' },
  fill: { height: 6, borderRadius: 3 },
});
