import type { Metadata } from 'expo-router/server';

import { page } from '@/lib/seo';
import { View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Col, Eyebrow, LinkCard, Screen, Split } from '@/components/ui';
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
    <Screen width="wide">
      <View style={{ gap: Spacing.two }}>
        <Eyebrow tone="signal">Reviewed by a certified instructor</Eyebrow>
        <ThemedText type="title" accessibilityRole="header">
          Guides
        </ThemedText>
        <ThemedText themeColor="textSecondary" style={{ maxWidth: 620 }}>
          Plain-language answers about the tests, the mistakes that cost marks, and getting your licence afterwards.
        </ThemedText>
      </View>
      <Split>
        {guides.map((g) => (
          <Col key={g.slug} basis={320}>
            <LinkCard href={{ pathname: '/guides/[slug]', params: { slug: g.slug } }} title={g.title} body={g.description} cta="Read" />
          </Col>
        ))}
      </Split>
    </Screen>
  );
}
