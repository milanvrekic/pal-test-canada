import { Link, type Href } from 'expo-router';
import type { Metadata } from 'expo-router/server';
import { Linking, Pressable, StyleSheet, View } from 'react-native';

import { HandoffCards } from '@/components/handoff-cards';
import { ThemedText } from '@/components/themed-text';
import { Screen } from '@/components/ui';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { DISCLAIMER } from '@/lib/content';
import { page } from '@/lib/seo';

export function generateMetadata(): Metadata {
  return page('/more', { title: 'More | PAL Test Canada', description: 'Study tools, guides, course providers and licence help.', noindex: true });
}

type Row = { href: Href; label: string; sub: string };

const SECTIONS: { title: string; rows: Row[] }[] = [
  {
    title: 'Study tools',
    rows: [
      { href: '/flashcards', label: 'Flashcards', sub: 'Question on the front, answer and handbook page on the back' },
      { href: { pathname: '/quiz', params: { course: 'cfsc', mode: 'mock' } }, label: 'Test-day mock', sub: '50 questions against a 60-minute clock' },
      { href: '/rules', label: 'Storage and transport rules', sub: 'What the law requires, by firearm and situation' },
    ],
  },
  {
    title: 'Your licence',
    rows: [
      { href: '/pal-courses', label: 'Where to take the course', sub: 'Course providers by province' },
      { href: '/apply', label: 'Application checklist', sub: 'What to gather before you apply' },
      { href: '/wait-times', label: 'Wait times and tracker', sub: 'How long applicants wait, and your own countdown' },
      { href: '/guides', label: 'Guides', sub: 'What fails people, test day, after the exam' },
    ],
  },
  {
    title: 'App',
    rows: [
      { href: '/about', label: 'About and your data', sub: 'How questions are made, reset progress' },
      { href: '/privacy', label: 'Privacy policy', sub: 'What the app stores, and where' },
    ],
  },
];

export default function More() {
  const theme = useTheme();
  return (
    <Screen>
      <ThemedText type="title" accessibilityRole="header">
        More
      </ThemedText>
      {SECTIONS.map((sec) => (
        <View key={sec.title} style={{ gap: Spacing.two }}>
          <ThemedText type="smallBold" themeColor="textSecondary" style={{ marginLeft: Spacing.two }}>
            {sec.title}
          </ThemedText>
          <View style={[styles.group, { backgroundColor: theme.backgroundElement, borderColor: theme.border }]}>
            {sec.rows.map((r, i) => (
              <Link key={r.label} href={r.href} asChild>
                <Pressable accessibilityRole="link">
                  {({ pressed }) => (
                    // The look lives on an inner View: Link asChild replaces the Pressable's own style.
                    <View style={[styles.row, i > 0 ? { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: theme.border } : null, pressed ? { backgroundColor: theme.backgroundSelected } : null]}>
                      <View style={{ flex: 1, gap: 2 }}>
                        <ThemedText type="bold">{r.label}</ThemedText>
                        <ThemedText type="small" themeColor="textSecondary">
                          {r.sub}
                        </ThemedText>
                      </View>
                      <ThemedText type="bold" themeColor="textSecondary">
                        ›
                      </ThemedText>
                    </View>
                  )}
                </Pressable>
              </Link>
            ))}
          </View>
        </View>
      ))}
      <HandoffCards placement="home" title="Outdoor apps by 10ten" order={['huntable', 'shootable']} more={['fishable', 'campable']} />
      <View style={{ gap: Spacing.two }}>
        <ThemedText type="small" themeColor="textSecondary">
          {DISCLAIMER}
        </ThemedText>
        <Pressable accessibilityRole="link" onPress={() => void Linking.openURL('https://paltest.ca')} style={{ minHeight: 36, justifyContent: 'center' }}>
          <ThemedText type="smallBold" themeColor="accent">
            paltest.ca
          </ThemedText>
        </Pressable>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  group: { borderRadius: Radius, borderWidth: 1, overflow: 'hidden' },
  row: { flexDirection: 'row', alignItems: 'center', gap: Spacing.three, paddingVertical: Spacing.three, paddingHorizontal: Spacing.three + 2, minHeight: 64 },
});
