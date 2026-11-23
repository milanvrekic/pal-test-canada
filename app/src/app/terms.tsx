import type { Metadata } from 'expo-router/server';
import { Linking, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Screen } from '@/components/ui';
import { Spacing } from '@/constants/theme';
import { page } from '@/lib/seo';

import { SUPPORT_EMAIL } from './privacy';

export const TERMS_UPDATED = '2026-11-23';

export function generateMetadata(): Metadata {
  return page('/terms', {
    title: 'Terms of use | PAL Test Canada',
    description: 'The terms for using PAL Test Canada: a free, independent study aid for the CFSC and CRFSC. What it is, what it is not, and how to reach us.',
  });
}

const SECTIONS: { h: string; p: string[] }[] = [
  {
    h: 'What these terms cover',
    p: [
      'These terms apply to PAL Test Canada: the website paltest.ca and the iOS and Android apps, published by 10ten Studio in British Columbia, Canada. By using it, you agree to them. If you do not agree, please do not use it.',
    ],
  },
  {
    h: 'A study aid, not the course',
    p: [
      'PAL Test Canada helps you study for the Canadian Firearms Safety Course (CFSC) and the Canadian Restricted Firearms Safety Course (CRFSC). It does not replace either course, and it cannot give you a course report, a test result or a licence. Only a course taught by an instructor designated by a Chief Firearms Officer, and a licence issued by the RCMP Canadian Firearms Program, do that.',
      'Scoring well here does not guarantee that you will pass the written or practical test. Instructors run their tests, and the result is theirs to give.',
    ],
  },
  {
    h: 'Not affiliated with the government',
    p: [
      'PAL Test Canada is independent. It is not affiliated with, endorsed by or acting for the RCMP, the Canadian Firearms Program, any Chief Firearms Officer, any provincial government or any course provider listed in the app.',
    ],
  },
  {
    h: 'Accuracy and the law',
    p: [
      'Questions are written from the 2014 CFSC and CRFSC student handbooks and checked by a certified instructor, and guides cite their sources. We work to keep everything accurate, but mistakes can happen and firearms law and regulations change. The content is general information, not legal advice. Before you act on a rule (for example on storage, transport, licensing or hunting), check the current rules with the RCMP Canadian Firearms Program, your province, or a lawyer.',
      'Course provider listings, wait times and other figures come from public sources or applicants’ own reports, as each page says. They can be out of date. Confirm dates, prices and details with the provider or agency.',
    ],
  },
  {
    h: 'Safe handling comes first',
    p: [
      'Nothing in the app is a substitute for hands-on training from a qualified instructor. Always follow the safety rules you are taught, the law, and the rules of any range or club.',
    ],
  },
  {
    h: 'Using the app',
    p: [
      'The app is free for personal study. Please do not copy or republish the question bank, guides or photos as your own, sell them, or use the app in a way that harms it or other people. Instructors may point students to the app.',
      'If you are under 18, use the app with the permission of a parent or guardian. The CFSC can be taken from age 12.',
    ],
  },
  {
    h: 'Our other apps',
    p: [
      'The app shows cards for other apps made by 10ten Studio (Huntable, Fishable, Campable and Shootable). They are separate apps with their own terms and privacy policies.',
    ],
  },
  {
    h: 'Your data',
    p: ['Your progress stays on your device. The privacy policy at paltest.ca/privacy explains what the app stores and sends.'],
  },
  {
    h: 'No warranty, and limits on liability',
    p: [
      'The app is provided free and “as is”, without warranties of any kind, to the extent the law allows. To the extent the law allows, 10ten Studio is not liable for any loss or damage arising from using or relying on the app, including a failed test, a delayed or refused licence, or a decision made on its content. Nothing in these terms limits rights you have under consumer protection law that cannot be limited.',
    ],
  },
  {
    h: 'Changes, law and contact',
    p: [
      'We may update these terms; the date below changes when we do, and using the app after a change means you accept the new terms. These terms are governed by the laws of British Columbia and the federal laws of Canada that apply there.',
      `Questions: ${SUPPORT_EMAIL}.`,
    ],
  },
];

export default function Terms() {
  return (
    <Screen>
      <ThemedText type="title" accessibilityRole="header">
        Terms of use
      </ThemedText>
      <ThemedText type="small" themeColor="textSecondary">
        Last updated {TERMS_UPDATED}. Published by 10ten Studio.
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
