import { Image, Linking, Pressable, StyleSheet, View } from 'react-native';

import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { track } from '@/lib/analytics';
import { APP_ICONS, type AppId, type PromoItem, usePromo } from '@/lib/handoff';

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
  | 'licence_arrived';

/**
 * "What's next" cards for Huntable and Shootable. One tap opens the store (or the website on desktop; the waitlist for
 * apps that haven't launched). The heading and lead are written for the moment the person is in.
 */
export function HandoffCards({
  placement,
  title = 'After your course',
  lead,
  order = ['huntable', 'shootable'],
}: {
  placement: Placement;
  title?: string;
  lead?: string;
  order?: AppId[];
}) {
  const items = usePromo(order);
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
    </View>
  );
}

function AppRow({ item, placement }: { item: PromoItem; placement: Placement }) {
  const theme = useTheme();
  const open = () => {
    track({ name: 'handoff_click', destination: item.id, placement });
    void Linking.openURL(item.href);
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
  row: { flex: 1, flexDirection: 'row', gap: Spacing.three, padding: Spacing.three, borderWidth: 1, borderRadius: Radius, alignItems: 'flex-start' },
  icon: { width: 56, height: 56, borderRadius: 13 },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two, flexWrap: 'wrap' },
  badge: { borderRadius: 999, paddingHorizontal: Spacing.two },
});
