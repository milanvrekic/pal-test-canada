import { Image, Linking, Pressable, StyleSheet, View } from 'react-native';

import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { track } from '@/lib/analytics';
import { APP_ICONS, type AppId, type PromoItem, hrefFor, usePromo } from '@/lib/handoff';

import { ThemedText } from './themed-text';
import { Col, Eyebrow, Split } from './ui';

export type Placement =
  | 'home'
  | 'exam_pass'
  | 'exam_fail'
  | 'practice_results'
  | 'drill_results'
  | 'guide'
  | 'wait_times'
  | 'licence_arrived'
  | 'after_pal_guide';

/**
 * "What's next" cards for Huntable and Shootable. One tap opens the store (or the website on desktop; the waitlist for
 * apps that haven't launched). The heading and lead are written for the moment the person is in.
 */
export function HandoffCards({
  placement,
  title = 'After your course',
  lead,
  order = ['huntable', 'shootable'],
  more = ['fishable', 'campable'],
}: {
  placement: Placement;
  title?: string;
  lead?: string;
  order?: AppId[];
  /** Smaller links under the cards for the rest of the family; in-season apps first. Pass [] to hide. */
  more?: AppId[];
}) {
  const items = usePromo(order);
  const extras = usePromo(more.filter((id) => !order.includes(id))).sort((a, b) => Number(b.inSeason) - Number(a.inSeason));
  if (!items.length) return null;
  return (
    <View style={{ gap: Spacing.two, marginTop: Spacing.three }} accessibilityRole="none">
      <Eyebrow tone="signal">From the same team</Eyebrow>
      <ThemedText type="heading" accessibilityRole="header">
        {title}
      </ThemedText>
      {lead ? <ThemedText themeColor="textSecondary">{lead}</ThemedText> : null}
      <Split style={{ marginTop: Spacing.one }}>
        {items.map((it) => (
          <Col key={it.id} basis={300} style={{ flexDirection: 'row' }}>
            <AppRow item={it} placement={placement} />
          </Col>
        ))}
      </Split>
      {extras.length ? (
        <View style={styles.moreRow} accessibilityLabel="More apps from the same team">
          <ThemedText type="smallBold" themeColor="textSecondary">
            More outdoor apps:
          </ThemedText>
          {extras.map((it) => (
            <MoreLink key={it.id} item={it} placement={placement} />
          ))}
        </View>
      ) : null}
    </View>
  );
}

/** A compact link for the rest of the family: icon, name and one line. */
export function MoreLink({ item, placement }: { item: PromoItem; placement: Placement }) {
  const theme = useTheme();
  return (
    <Pressable
      accessibilityRole="link"
      accessibilityLabel={`${item.name}. ${item.line}`}
      onPress={() => {
        track({ name: 'handoff_click', destination: item.id, placement: `${placement}_more` });
        void Linking.openURL(hrefFor(item, `${placement}_more`));
      }}
      style={({ pressed }) => [styles.more, { backgroundColor: theme.backgroundElement, borderColor: theme.border }, pressed ? { transform: [{ scale: 0.98 }] } : null]}>
      <Image source={APP_ICONS[item.id]} style={styles.moreIcon} accessibilityIgnoresInvertColors />
      <View style={{ flexShrink: 1 }}>
        <ThemedText type="smallBold">
          {item.name}
          {item.inSeason ? <ThemedText type="small" themeColor="success">{'  · in season'}</ThemedText> : null}
        </ThemedText>
        <ThemedText type="small" themeColor="textSecondary" numberOfLines={1}>
          {item.line}
        </ThemedText>
      </View>
    </Pressable>
  );
}

function AppRow({ item, placement }: { item: PromoItem; placement: Placement }) {
  const theme = useTheme();
  const open = () => {
    track({ name: 'handoff_click', destination: item.id, placement });
    void Linking.openURL(hrefFor(item, placement));
  };
  const badge = item.soon ? 'Coming soon' : item.inSeason ? 'In season' : null;
  return (
    <Pressable
      onPress={open}
      accessibilityRole="link"
      accessibilityLabel={`${item.name}. ${item.line}${badge ? `. ${badge}` : ''}`}
      style={({ pressed }) => [styles.row, { borderColor: pressed ? theme.accent : theme.border, backgroundColor: theme.backgroundElement }]}>
      <Image source={APP_ICONS[item.id]} style={styles.icon} accessibilityIgnoresInvertColors />
      <View style={{ flex: 1, gap: Spacing.half }}>
        <View style={styles.nameRow}>
          <ThemedText type="bold">{item.name}</ThemedText>
          {badge ? (
            <View style={[styles.badge, { backgroundColor: item.inSeason && !item.soon ? theme.signalBg : theme.backgroundSelected }]}>
              <ThemedText type="smallBold" themeColor={item.inSeason && !item.soon ? 'signal' : 'textSecondary'} style={{ fontSize: 12, lineHeight: 18 }}>
                {badge}
              </ThemedText>
            </View>
          ) : null}
        </View>
        <ThemedText type="small" themeColor="textSecondary">
          {item.line}
        </ThemedText>
        <ThemedText type="smallBold" themeColor="signal">
          {item.soon ? 'Join the waitlist' : `Get ${item.name}`} →
        </ThemedText>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  featured: { borderWidth: 1, borderRadius: Radius, padding: Spacing.four, gap: Spacing.three },
  featuredTop: { flexDirection: 'row', alignItems: 'center', gap: Spacing.three },
  featuredIcon: { width: 72, height: 72, borderRadius: 16 },
  featuredCta: { borderRadius: 999, paddingVertical: 14, paddingHorizontal: Spacing.four, alignSelf: 'flex-start', minWidth: 200 },
  moreRow: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: Spacing.two, marginTop: Spacing.one },
  more: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two + 2, borderWidth: 1, borderRadius: 999, paddingVertical: 6, paddingLeft: 6, paddingRight: Spacing.three, maxWidth: 420, flexShrink: 1 },
  moreIcon: { width: 32, height: 32, borderRadius: 9 },
  row: { flex: 1, flexDirection: 'row', gap: Spacing.three, padding: Spacing.three, borderWidth: 1, borderRadius: Radius, alignItems: 'flex-start' },
  icon: { width: 56, height: 56, borderRadius: 13 },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two, flexWrap: 'wrap' },
  badge: { borderRadius: 999, paddingHorizontal: Spacing.two },
});

/**
 * One app, picked for the moment: shown on its own after a success (a passed mock exam, a strong practice round) rather
 * than as a list. The headline is written for that moment; the line comes from the promo feed so it can be changed remotely.
 */
export function FeaturedHandoff({
  placement,
  app,
  headline,
  more = [],
}: {
  placement: Placement;
  app: AppId;
  headline: string;
  /** Compact links for other apps underneath. */
  more?: AppId[];
}) {
  const theme = useTheme();
  const [item] = usePromo([app]);
  const extras = usePromo(more.filter((id) => id !== app)).sort((a, b) => Number(b.inSeason) - Number(a.inSeason));
  if (!item) return null;
  const open = () => {
    track({ name: 'handoff_click', destination: item.id, placement: `${placement}_featured` });
    void Linking.openURL(hrefFor(item, `${placement}_featured`));
  };
  const eyebrow = item.soon ? 'Coming soon' : item.inSeason ? 'In season now' : 'Your next step';
  return (
    <View style={{ gap: Spacing.two, marginTop: Spacing.three }}>
      <Pressable
        onPress={open}
        accessibilityRole="link"
        accessibilityLabel={`${headline} ${item.name}. ${item.line}`}
        style={({ pressed }) => [
          styles.featured,
          { backgroundColor: theme.backgroundElement, borderColor: pressed ? theme.accent : theme.border },
          pressed ? { transform: [{ scale: 0.99 }] } : null,
        ]}>
        <View style={styles.featuredTop}>
          <Image source={APP_ICONS[item.id]} style={styles.featuredIcon} accessibilityIgnoresInvertColors />
          <View style={{ flex: 1, gap: Spacing.half }}>
            <ThemedText type="smallBold" themeColor={item.inSeason && !item.soon ? 'success' : 'signal'}>
              {eyebrow}
            </ThemedText>
            <ThemedText type="heading">{headline}</ThemedText>
          </View>
        </View>
        <ThemedText themeColor="textSecondary">
          <ThemedText type="bold">{item.name}</ThemedText>: {item.line} Free.
        </ThemedText>
        <View style={[styles.featuredCta, { backgroundColor: theme.accent }]}>
          <ThemedText type="bold" style={{ color: theme.onAccent, textAlign: 'center' }}>
            {item.soon ? `Join the ${item.name} waitlist` : `Get ${item.name}`}
          </ThemedText>
        </View>
      </Pressable>
      {extras.length ? (
        <View style={styles.moreRow} accessibilityLabel="More apps from the same team">
          <ThemedText type="smallBold" themeColor="textSecondary">
            More outdoor apps:
          </ThemedText>
          {extras.map((it) => (
            <MoreLink key={it.id} item={it} placement={placement} />
          ))}
        </View>
      ) : null}
    </View>
  );
}
