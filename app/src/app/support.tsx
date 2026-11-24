import type { Metadata } from 'expo-router/server';
import { Linking, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Button, Card, Screen } from '@/components/ui';
import { Spacing } from '@/constants/theme';
import { page } from '@/lib/seo';

import { SUPPORT_EMAIL } from './privacy';

export function generateMetadata(): Metadata {
  return page('/support', {
    title: 'Support | PAL Test Canada',
    description: 'Help with PAL Test Canada: report a question, reset your progress, and how to reach us.',
  });
}

const FAQ: { q: string; a: string }[] = [
  {
    q: 'I think an answer is wrong.',
    a: 'Every question is cited to a page of the official student handbook and reviewed by a certified instructor, but mistakes can still slip through. Email us the question text and the answer you expected, and we will check it against the handbook and fix it.',
  },
  {
    q: 'Are these the real test questions?',
    a: 'No. Questions are written from the student handbook and are never taken from the real written or practical tests. The app is a study aid and does not replace the CFSC or CRFSC course.',
  },
  {
    q: 'Do I need an account?',
    a: 'No. There are no accounts. Your answers, scores and tracker dates are stored on your device only.',
  },
  {
    q: 'Will my progress move to a new phone?',
    a: 'No. Because nothing is stored on our servers, progress stays on the device (or browser) where you studied.',
  },
  {
    q: 'How do I reset my progress?',
    a: 'Open About and tap Reset progress. Deleting the app also removes everything it stored.',
  },
  {
    q: 'Where do I take the course?',
    a: 'See PAL courses by province for course providers near you.',
  },
];

export default function Support() {
  return (
    <Screen>
      <ThemedText type="title" accessibilityRole="header">
        Support
      </ThemedText>
      <ThemedText>
        Questions, a mistake in a question, or something not working? Email us and we will get back to you.
      </ThemedText>
      <Card>
        <ThemedText type="heading">Contact</ThemedText>
        <ThemedText
          type="smallBold"
          themeColor="accent"
          accessibilityRole="link"
          onPress={() => void Linking.openURL(`mailto:${SUPPORT_EMAIL}?subject=PAL%20Test%20Canada%20support`)}>
          {SUPPORT_EMAIL}
        </ThemedText>
        <ThemedText type="small" themeColor="textSecondary">
          Published by 10ten Studio, British Columbia, Canada.
        </ThemedText>
      </Card>

      <ThemedText type="heading" accessibilityRole="header">
        Common questions
      </ThemedText>
      {FAQ.map((f) => (
        <View key={f.q} style={{ gap: Spacing.two }}>
          <ThemedText type="smallBold">{f.q}</ThemedText>
          <ThemedText style={{ fontSize: 17, lineHeight: 27 }}>{f.a}</ThemedText>
        </View>
      ))}

      <View style={{ gap: Spacing.two }}>
        <Button variant="secondary" label="PAL courses by province" href="/pal-courses" />
        <Button variant="secondary" label="About and reset progress" href="/about" />
        <Button variant="secondary" label="Privacy policy" href="/privacy" />
        <Button variant="secondary" label="Terms of use" href="/terms" />
      </View>
    </Screen>
  );
}
