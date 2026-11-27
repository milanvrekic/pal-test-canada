import type { Metadata } from 'expo-router/server';
import { Linking, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Screen } from '@/components/ui';
import { Spacing } from '@/constants/theme';
import { page } from '@/lib/seo';

export const PRIVACY_UPDATED = '2026-11-27';
export const SUPPORT_EMAIL = 'milan@10tenStudio.com';

export function generateMetadata(): Metadata {
  return page('/privacy', {
    title: 'Privacy policy | PAL Test Canada',
    description: 'PAL Test Canada has no accounts and keeps your progress on your device. What the app stores, what it sends, and how to reach us.',
  });
}

const SECTIONS: { h: string; p: string[] }[] = [
  {
    h: 'The short version',
    p: [
      'PAL Test Canada (the website paltest.ca and the iOS and Android apps) has no accounts, no ads and no tracking across apps or websites. We do not collect your name, email address, location or contacts.',
    ],
  },
  {
    h: 'What stays on your device',
    p: [
      'Your answers, practice exam scores, review schedule, licence-tracker dates and checklist ticks are stored only on your device (in the browser on the website). They are not sent to us. You can delete them at any time from About > Reset progress, or by deleting the app.',
    ],
  },
  {
    h: 'What the app downloads',
    p: [
      'Once per session the app downloads a small settings file from command.10tenstudio.com that controls the cards for our other apps (Huntable, Fishable, Campable, Shootable). It contains no personal information. Like any web request, it reaches our server with your IP address, which our hosting provider may log for security; we do not use it to identify you.',
      'When you tap a card for one of our other apps, the link passes through command.10tenstudio.com so we can count taps per app and per screen, then opens the App Store, Google Play or the app website. The count is not tied to you.',
    ],
  },
  {
    h: 'Anonymous usage counts',
    p: [
      'To see which parts of the app are useful, the app sends command.10tenstudio.com a count when a session starts, when a practice round, exam or drill is finished (the course, the kind of round and the score), and when a card for another app or a course provider is tapped (which card, on which screen). Each count says only whether it came from the iOS app, the Android app or the website. It carries no account, name, device or advertising ID, and it is not linked to your other counts or to you.',
    ],
  },
  {
    h: 'Links to other websites',
    p: [
      'Course providers, the RCMP Canadian Firearms Program and other sites we link to have their own privacy policies. We do not share anything with them.',
    ],
  },
  {
    h: 'Children',
    p: ['The Canadian Firearms Safety Course can be taken from age 12. The app collects no personal information from anyone, including minors.'],
  },
  {
    h: 'Changes and contact',
    p: [`If this policy changes, the date below changes too. Questions or requests: ${SUPPORT_EMAIL}.`],
  },
];

export default function Privacy() {
  return (
    <Screen>
      <ThemedText type="title" accessibilityRole="header">
        Privacy policy
      </ThemedText>
      <ThemedText type="small" themeColor="textSecondary">
        Last updated {PRIVACY_UPDATED}. Published by 10ten Studio.
      </ThemedText>
      {SECTIONS.map((s) => (
        <View key={s.h} style={{ gap: Spacing.two }}>
          <ThemedText type="heading" accessibilityRole="header">
            {s.h}
          </ThemedText>
          {s.p.map((t) => (
            <ThemedText key={t.slice(0, 24)} style={{ fontSize: 17, lineHeight: 27 }}>
              {t}
            </ThemedText>
          ))}
        </View>
      ))}
      <ThemedText type="smallBold" themeColor="accent" accessibilityRole="link" onPress={() => void Linking.openURL(`mailto:${SUPPORT_EMAIL}`)}>
        {SUPPORT_EMAIL}
      </ThemedText>
    </Screen>
  );
}
