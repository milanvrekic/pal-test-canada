import { useLocalSearchParams } from 'expo-router';
import type { Metadata } from 'expo-router/server';

import { page } from '@/lib/seo';

import { HandoffCards } from '@/components/handoff-cards';
import { Markdown } from '@/components/markdown';
import { ThemedText } from '@/components/themed-text';
import { Button, Notice, Screen } from '@/components/ui';
import { guides } from '@/lib/content';

export function generateStaticParams(): { slug: string }[] {
  return guides.map((g) => ({ slug: g.slug }));
}

export function generateMetadata(_request: unknown, params: Record<string, string | string[]>): Metadata | null {
  const guide = guides.find((g) => g.slug === params.slug);
  return guide ? page(`/guides/${guide.slug}`, { title: `${guide.title} | PAL Test Canada`, description: guide.description }) : null;
}

export default function GuidePage() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const guide = guides.find((g) => g.slug === slug);
  if (!guide) {
    return (
      <Screen>
        <ThemedText type="heading">Guide not found</ThemedText>
        <Button label="All guides" href="/guides" />
      </Screen>
    );
  }
  return (
    <Screen>
      <ThemedText type="title" accessibilityRole="header">
        {guide.title}
      </ThemedText>
      {guide.draft ? <Notice tone="warning">Draft guide. Not yet reviewed by the instructor.</Notice> : null}
      {guide.lastReviewed && guide.lastReviewed !== 'TBD' ? (
        <ThemedText type="small" themeColor="textSecondary">
          Last reviewed {guide.lastReviewed}
        </ThemedText>
      ) : null}
      <Markdown source={guide.body} />
      <Button label="Start practising" href="/" />
      <HandoffCards
        placement="guide"
        title={guide.slug === 'can-you-hunt-with-a-pal' ? 'Find where you can hunt' : 'After your course'}
        order={guide.slug === 'pal-vs-rpal' ? ['shootable', 'huntable'] : ['huntable', 'shootable']}
      />
    </Screen>
  );
}
