import type { Metadata } from 'expo-router/server';
import { Linking, Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Button, Card, Eyebrow, ProgressBar, Screen } from '@/components/ui';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { page } from '@/lib/seo';
import { updateTracker, useTracker } from '@/lib/tracker';

export function generateMetadata(): Metadata {
  return page('/apply', {
    title: 'PAL application checklist: what you need before you apply | PAL Test Canada',
    description:
      'Everything to gather before you apply for your firearms licence: course report, photo and photo guarantor, ID, two references and your partner details.',
  });
}

const RCMP_APPLY = 'https://rcmp.ca/en/firearms/apply-firearms-licence';
const RCMP_PHOTO = 'https://rcmp.ca/en/firearms/licensing/photo-requirements-firearms-licence';
const RCMP_FORMS = 'https://rcmp.ca/en/firearms/firearms-forms-and-reports';

// From the RCMP "Apply for a firearms licence" page and form RCMP 5592. Links go to the source for each item.
const ITEMS: { id: string; title: string; detail: string; link?: { label: string; url: string } }[] = [
  { id: 'course', title: 'Pass your safety course', detail: 'CFSC for a PAL, and the CRFSC as well for restricted firearms. Keep your course report.' },
  { id: 'photo', title: 'A licence photo', detail: 'Digital for an online application, a printed photo for a paper one. Photos that miss the size or quality rules are rejected, which delays the application.', link: { label: 'Photo requirements', url: RCMP_PHOTO } },
  { id: 'guarantor', title: 'A photo guarantor', detail: 'Someone who confirms the photo is you. On a paper application they print their name and sign the back of the photo.', link: { label: 'Photo requirements', url: RCMP_PHOTO } },
  { id: 'id', title: 'Two pieces of government-issued ID', detail: 'Needed to apply online.' },
  { id: 'references', title: 'Two references', detail: 'People who know you. Let them know they may be contacted.' },
  { id: 'partner', title: 'Current and former partners', detail: 'If you have a current or former spouse or common-law partner, their details go on the application. If they do not sign, the Chief Firearms Officer must notify them.' },
  { id: 'email', title: 'A valid email address', detail: 'Required for the online application.' },
  { id: 'submit', title: 'Apply online, or by mail with form RCMP 5592', detail: 'A paper application needs a handwritten signature and must be mailed within six months of signing. Check the current fee on the RCMP site: it changes every year.', link: { label: 'Apply for a firearms licence', url: RCMP_APPLY } },
];

export default function Apply() {
  const theme = useTheme();
  const { tracker } = useTracker();
  const doneCount = ITEMS.filter((i) => tracker.done[`apply:${i.id}`]).length;
  return (
    <Screen>
      <View style={{ gap: Spacing.two }}>
        <Eyebrow tone="signal">After the course</Eyebrow>
        <ThemedText type="title" accessibilityRole="header">
          Your PAL application checklist
        </ThemedText>
        <ThemedText themeColor="textSecondary" style={{ fontSize: 18, lineHeight: 27 }}>
          Gather these before you apply. Missing items are a common reason applications take longer. Ticks stay on this device.
        </ThemedText>
        <ProgressBar value={doneCount / ITEMS.length} height={10} />
        <ThemedText type="smallBold" themeColor="textSecondary">
          {doneCount} of {ITEMS.length} ready
        </ThemedText>
      </View>
      <View style={{ gap: Spacing.two }}>
        {ITEMS.map((item) => {
          const key = `apply:${item.id}`;
          const done = !!tracker.done[key];
          return (
            <Card key={item.id} style={{ gap: Spacing.two }}>
              <Pressable
                accessibilityRole="checkbox"
                accessibilityState={{ checked: done }}
                onPress={() => updateTracker((t) => ({ ...t, done: { ...t.done, [key]: !done } }))}
                style={styles.row}>
                <View style={[styles.box, { borderColor: done ? theme.success : theme.borderStrong, backgroundColor: done ? theme.success : 'transparent' }]}>
                  {done ? <ThemedText style={styles.tick}>✓</ThemedText> : null}
                </View>
                <View style={{ flex: 1, gap: 2 }}>
                  <ThemedText type="bold" themeColor={done ? 'textSecondary' : 'text'}>
                    {item.title}
                  </ThemedText>
                  <ThemedText type="small" themeColor="textSecondary">
                    {item.detail}
                  </ThemedText>
                </View>
              </Pressable>
              {item.link ? (
                <Pressable accessibilityRole="link" onPress={() => void Linking.openURL(item.link!.url)} style={styles.link}>
                  <ThemedText type="smallBold" style={{ textDecorationLine: 'underline' }}>
                    {item.link.label} ↗
                  </ThemedText>
                </Pressable>
              ) : null}
            </Card>
          );
        })}
      </View>
      <Card style={{ gap: Spacing.three }}>
        <ThemedText type="heading">Sent it?</ThemedText>
        <ThemedText themeColor="textSecondary">Track your application and see how your wait compares with other applicants.</ThemedText>
        <Button label="Open the licence tracker" href="/wait-times" />
      </Card>
      <ThemedText type="small" themeColor="textSecondary">
        Summarised from the RCMP Canadian Firearms Program. Forms and requirements can change:{' '}
        <ThemedText type="small" style={{ textDecorationLine: 'underline' }} onPress={() => void Linking.openURL(RCMP_FORMS)}>
          check the official forms
        </ThemedText>
        .
      </ThemedText>
    </Screen>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: Spacing.three, alignItems: 'flex-start', minHeight: 44 },
  box: { width: 24, height: 24, borderRadius: 7, borderWidth: 2, alignItems: 'center', justifyContent: 'center', marginTop: 1 },
  tick: { color: '#FFFFFF', fontSize: 14, lineHeight: 18, fontWeight: '800' },
  link: { minHeight: 36, justifyContent: 'center', alignSelf: 'flex-start', marginLeft: 40 },
});
