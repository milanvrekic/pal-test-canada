import type { Metadata } from 'expo-router/server';

import { page } from '@/lib/seo';
import { useState } from 'react';
import { View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Button, Card, Screen } from '@/components/ui';
import { Spacing } from '@/constants/theme';
import { DISCLAIMER, contentBuiltAt, contentVersion, questions } from '@/lib/content';
import { resetProgress } from '@/lib/progress';
import { resetTracker } from '@/lib/tracker';

export function generateMetadata(): Metadata {
  return page('/about', {
    title: 'About PAL Test Canada',
    description: 'How the questions are written and reviewed, what the app is not, and how your progress is stored.',
  });
}

export default function About() {
  const [confirming, setConfirming] = useState(false);
  return (
    <Screen>
      <ThemedText type="title" accessibilityRole="header">
        About
      </ThemedText>
      <ThemedText>{DISCLAIMER}</ThemedText>

      <Card>
        <ThemedText type="bold">How questions are made</ThemedText>
        <ThemedText themeColor="textSecondary">
          Every question is written from the official student handbook, cited to it, and reviewed by a certified CFSC and CRFSC
          instructor before it ships. Questions are never taken from the real written or practical tests.
        </ThemedText>
      </Card>

      <Card>
        <ThemedText type="bold">Your data</ThemedText>
        <ThemedText themeColor="textSecondary">
          There are no accounts. Your answers, scores and licence tracker dates are stored on this device only.
        </ThemedText>
        {confirming ? (
          <View style={{ gap: Spacing.two }}>
            <ThemedText type="small" themeColor="danger">
              This deletes all answers, exam scores and tracker dates on this device. It cannot be undone.
            </ThemedText>
            <Button
              label="Delete my progress"
              onPress={() => {
                resetProgress();
                resetTracker();
                setConfirming(false);
              }}
            />
            <Button variant="secondary" label="Keep my progress" onPress={() => setConfirming(false)} />
          </View>
        ) : (
          <Button variant="secondary" label="Reset progress" onPress={() => setConfirming(true)} />
        )}
      </Card>

      <ThemedText type="small" themeColor="textSecondary">
        Content version {contentVersion}, built {contentBuiltAt}. {questions.length} questions.
      </ThemedText>
    </Screen>
  );
}
