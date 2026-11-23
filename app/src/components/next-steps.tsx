import { Link } from 'expo-router';
import { Image, Linking, Pressable, StyleSheet, View } from 'react-native';

import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { track } from '@/lib/analytics';
import { guides } from '@/lib/content';
import { APP_ICONS, type AppId, hrefFor, usePromo } from '@/lib/handoff';

import type { Placement } from './handoff-cards';
import { ThemedText } from './themed-text';
import { Card } from './ui';

type Step = { title: string; text: string } & ({ app: AppId } | { href: string; cta: string });

const hasGuide = (slug: string) => guides.some((g) => g.slug === slug);

/** What comes after the licence, in the order it usually comes up. App steps open the store; the rest link inside the site. */
function steps(): Step[] {
  const list: Step[] = [];
  if (hasGuide('how-to-get-a-hunting-licence-in-bc'))
    list.push({
      title: 'Book your hunter education',
      text: "A PAL doesn't let you hunt. Hunter education (CORE in BC) and a provincial hunting licence do, and you can start them now.",
      href: '/guides/how-to-get-a-hunting-licence-in-bc',
      cta: 'BC hunting licence, step by step',
    });
  list.push(
    { title: 'Learn the seasons in your zone', text: 'Seasons and closures change by zone and species.', app: 'huntable' },
    { title: 'Pick a range to practise at', text: 'Keep the handling habits from your course sharp once you own a firearm.', app: 'shootable' },
    { title: 'Get your fishing licence', text: 'In BC the same Fish and Wildlife ID buys freshwater fishing and hunting licences.', app: 'fishable' },
    { title: 'Know the storage and transport rules', text: 'They apply from the first day you own a firearm.', href: '/rules', cta: 'Check the rules' },
  );
  return list;
}

export function NextSteps({ placement, title, lead }: { placement: Placement; title: string; lead?: string }) {
  const theme = useTheme();
  const list = steps();
  const promo = usePromo(['huntable', 'shootable', 'fishable', 'campable']);
  const guideSlug = 'after-you-get-your-pal';
  return (
    <Card style={{ gap: Spacing.three }}>
      <View style={{ gap: Spacing.one }}>
        <ThemedText type="heading" accessibilityRole="header">
          {title}
        </ThemedText>
        {lead ? <ThemedText themeColor="textSecondary">{lead}</ThemedText> : null}
      </View>
      {list.map((s, i) => {
        const item = 'app' in s ? promo.find((p) => p.id === s.app) : undefined;
        if ('app' in s && !item) return null;
        return (
          <View key={s.title} style={[styles.step, { borderTopColor: theme.border }, i === 0 ? { borderTopWidth: 0, paddingTop: 0 } : null]}>
            <View style={styles.stepHead}>
              <View style={[styles.num, { backgroundColor: theme.accentSoft }]}>
                <ThemedText type="smallBold" themeColor="accent">
                  {i + 1}
                </ThemedText>
              </View>
              <View style={{ flex: 1, gap: Spacing.one }}>
                <ThemedText type="bold">{s.title}</ThemedText>
                <ThemedText type="small" themeColor="textSecondary">
                  {s.text}
                </ThemedText>
                {'href' in s ? (
                  <Link href={s.href as never}>
                    <ThemedText type="smallBold" themeColor="accent">
                      {s.cta} →
                    </ThemedText>
                  </Link>
                ) : null}
              </View>
            </View>
            {item ? (
              // Full width under the step, so the app's line has room on a phone.
              <Pressable
                accessibilityRole="link"
                accessibilityLabel={`${item.name}. ${item.line}`}
                onPress={() => {
                  track({ name: 'handoff_click', destination: item.id, placement: `${placement}_step` });
                  void Linking.openURL(hrefFor(item, `${placement}_step`));
                }}
                style={({ pressed }) => [styles.app, { backgroundColor: theme.background, borderColor: pressed ? theme.accent : theme.border }]}>
                <View style={styles.appTop}>
                  <Image source={APP_ICONS[item.id]} style={styles.icon} accessibilityIgnoresInvertColors />
                  <View style={{ flex: 1, gap: 2 }}>
                    <ThemedText type="bold">{item.name}</ThemedText>
                    {item.soon || item.inSeason ? (
                      <ThemedText type="small" themeColor={item.soon ? 'textSecondary' : 'success'}>
                        {item.soon ? 'Coming soon' : 'In season now'}
                      </ThemedText>
                    ) : null}
                  </View>
                  <View style={[styles.cta, { backgroundColor: theme.accent }]}>
                    <ThemedText type="smallBold" style={{ color: theme.onAccent }}>
                      {item.soon ? 'Waitlist' : 'Get it'}
                    </ThemedText>
                  </View>
                </View>
                <ThemedText type="small" themeColor="textSecondary">
                  {item.line}
                </ThemedText>
              </Pressable>
            ) : null}
          </View>
        );
      })}
      {hasGuide(guideSlug) && placement !== 'after_pal_guide' ? (
        <Link href={`/guides/${guideSlug}` as never}>
          <ThemedText type="smallBold" themeColor="accent">
            Full guide: what to do after you get your PAL →
          </ThemedText>
        </Link>
      ) : null}
    </Card>
  );
}

const styles = StyleSheet.create({
  step: { gap: Spacing.two + 4, borderTopWidth: 1, paddingTop: Spacing.three },
  stepHead: { flexDirection: 'row', gap: Spacing.three },
  appTop: { flexDirection: 'row', alignItems: 'center', gap: Spacing.three },
  cta: { borderRadius: 999, paddingHorizontal: Spacing.three, paddingVertical: 8 },
  num: { width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  app: { gap: Spacing.two, borderWidth: 1, borderRadius: Radius - 8, padding: Spacing.three },
  icon: { width: 48, height: 48, borderRadius: 11 },
});
