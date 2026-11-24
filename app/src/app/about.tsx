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
        <ThemedText type="heading">How questions are made</ThemedText>
        <ThemedText themeColor="textSecondary">
          Every question is written from the official student handbook, cited to it, and reviewed by a certified CFSC and CRFSC
          instructor before it ships. Questions are never taken from the real written or practical tests.
        </ThemedText>
      </Card>

      {/* nativeID becomes id="age" on the web, so paltest.ca/about#age (the App Store age suitability URL) lands here. */}
      <Card nativeID="age">
        <ThemedText type="heading">Who this app is for</ThemedText>
        <ThemedText themeColor="textSecondary">
          PAL Test Canada is a study tool. It teaches the safe handling, storage and transport of firearms and the material
          covered in the Canadian Firearms Safety Course (CFSC) and the Canadian Restricted Firearms Safety Course (CRFSC).
        </ThemedText>
        <ThemedText themeColor="textSecondary">
          It is written for adults preparing for a PAL or RPAL. Young people aged 12 to 17 working toward a minor&apos;s licence
          can use it with a parent or guardian.
        </ThemedText>
        <ThemedText themeColor="textSecondary">
          The app has no violence, no accounts, no chat, no user-generated content and no third-party ads. It links to our own
          hunting, fishing and camping apps and to course providers&apos; websites.
        </ThemedText>
      </Card>

      <Card>
        <ThemedText type="heading">Your data</ThemedText>
        <ThemedText themeColor="textSecondary">
          There are no accounts. Your answers, scores and licence tracker dates are stored on this device only.
        </ThemedText>
        <Button variant="secondary" label="Privacy policy" href="/privacy" />
        <Button variant="secondary" label="Terms of use" href="/terms" />
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
