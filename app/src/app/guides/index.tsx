import { Link } from 'expo-router';
import type { Metadata } from 'expo-router/server';

import { page } from '@/lib/seo';
import { Pressable, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Card, Screen } from '@/components/ui';
import { Spacing } from '@/constants/theme';
import { guides } from '@/lib/content';

export function generateMetadata(): Metadata {
  return page('/guides', {
    title: 'PAL guides: the tests, what fails people and applying | PAL Test Canada',
    description: 'Plain-language guides to the CFSC and CRFSC tests, the mistakes that fail people, and applying for your PAL afterwards.',
  });
}

export default function Guides() {
  return (
    <Screen>
      <ThemedText type="title" accessibilityRole="header">
        Guides
      </ThemedText>
      <View style={{ gap: Spacing.two }}>
        {guides.map((g) => (
          <Link key={g.slug} href={{ pathname: '/guides/[slug]', params: { slug: g.slug } }} asChild>
            <Pressable accessibilityRole="link">
              <Card>
                <ThemedText type="bold">{g.title}</ThemedText>
                <ThemedText themeColor="textSecondary">{g.description}</ThemedText>
              </Card>
            </Pressable>
          </Link>
        ))}
      </View>
    </Screen>
  );
}
