import { useLocalSearchParams } from 'expo-router';
import type { Metadata } from 'expo-router/server';
import { View } from 'react-native';

import { CourseDirectory, ListYourCourse } from '@/components/course-directory';
import { HandoffCards } from '@/components/handoff-cards';
import { ThemedText } from '@/components/themed-text';
import { Button, Card, Col, Eyebrow, Screen, Split } from '@/components/ui';
import { Spacing } from '@/constants/theme';
import { PROVINCES } from '@/features/wait/stats';
import { courseDirectory } from '@/lib/content';
import { page } from '@/lib/seo';

export function generateStaticParams(): { province: string }[] {
  return courseDirectory.map((c) => ({ province: c.province.toLowerCase() }));
}

const find = (slug: unknown) => courseDirectory.find((c) => c.province.toLowerCase() === String(slug).toLowerCase());

export function generateMetadata(_request: unknown, params: Record<string, string | string[]>): Metadata | null {
  const d = find(params.province);
  if (!d) return null;
  const name = PROVINCES[d.province] ?? d.province;
  const cities = [...new Set(d.providers.flatMap((p) => p.venues.map((v) => v.city)))].slice(0, 6).join(', ');
  return page(`/pal-courses/${d.province.toLowerCase()}`, {
    title: `Where to take the PAL course in ${name} (CFSC and CRFSC) | PAL Test Canada`,
    description: `${d.providers.length} places to take the Canadian Firearms Safety Course in ${name}, including ${cities}. Contacts for each provider, checked against their own listings.`,
  });
}

export default function ProvinceCourses() {
  const { province } = useLocalSearchParams<{ province: string }>();
  const d = find(province);
  if (!d) {
    return (
      <Screen>
        <ThemedText type="title">No listings for this province yet</ThemedText>
        <Button label="All provinces" href="/pal-courses" />
      </Screen>
    );
  }
  const name = PROVINCES[d.province] ?? d.province;
  return (
    <Screen width="wide">
      <View style={{ gap: Spacing.two }}>
        <Eyebrow tone="signal">{d.providers.length} course providers · {name}</Eyebrow>
        <ThemedText type="title" accessibilityRole="header">
          Where to take the PAL course in {name}
        </ThemedText>
        <ThemedText themeColor="textSecondary" style={{ fontSize: 18, lineHeight: 27, maxWidth: 720 }}>
          To apply for a PAL you must pass the Canadian Firearms Safety Course (CFSC), and the restricted course (CRFSC) as well
          for an RPAL. Only instructors designated by the Chief Firearms Officer can teach them. These are the providers we have
          found, by region, with their own contact details.
        </ThemedText>
        <ThemedText type="small" themeColor="textSecondary">
          PAL Test Canada is an independent study aid. We are not affiliated with any provider listed here, the RCMP or the
          Canadian Firearms Program, and listings are free.
        </ThemedText>
      </View>

      <CourseDirectory data={d} />

      <Split>
        <Col basis={320}>
          <Card style={{ gap: Spacing.three, flexGrow: 1 }}>
            <ThemedText type="heading">Booked a course?</ThemedText>
            <ThemedText themeColor="textSecondary">
              Practise with handbook-cited questions and the photo drill so the written and practical tests hold no surprises.
            </ThemedText>
            <Button label="Start practising" href="/" />
          </Card>
        </Col>
        <Col basis={320}>
          <Card style={{ gap: Spacing.three, flexGrow: 1 }}>
            <ThemedText type="heading">Choosing a course</ThemedText>
            <ThemedText themeColor="textSecondary">
              Ask how many hours of classroom time are included, whether both tests are on the day, and whether the restricted
              course runs right after the non-restricted one.
            </ThemedText>
            <Button variant="secondary" label="What to expect on test day" href="/guides/exam-day" />
          </Card>
        </Col>
      </Split>

      <ListYourCourse province={name} />

      <HandoffCards placement="guide" title="After your course" />
    </Screen>
  );
}
