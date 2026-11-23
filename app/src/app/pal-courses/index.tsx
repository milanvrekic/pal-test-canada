import { Link } from 'expo-router';
import type { Metadata } from 'expo-router/server';
import { Pressable, View } from 'react-native';

import { ListYourCourse } from '@/components/course-directory';
import { ThemedText } from '@/components/themed-text';
import { Card, Col, Eyebrow, Screen, Split } from '@/components/ui';
import { Spacing } from '@/constants/theme';
import { PROVINCES } from '@/features/wait/stats';
import { courseDirectory } from '@/lib/content';
import { page } from '@/lib/seo';

export function generateMetadata(): Metadata {
  return page('/pal-courses', {
    title: 'Where to take the PAL course: CFSC and CRFSC providers by province | PAL Test Canada',
    description: 'Find a Canadian Firearms Safety Course near you. Providers by province and region, with contact details checked against their own listings.',
  });
}

export default function PalCourses() {
  return (
    <Screen width="wide">
      <View style={{ gap: Spacing.two }}>
        <Eyebrow tone="signal">Course directory</Eyebrow>
        <ThemedText type="title" accessibilityRole="header">
          Where to take the PAL course
        </ThemedText>
        <ThemedText themeColor="textSecondary" style={{ fontSize: 18, lineHeight: 27, maxWidth: 720 }}>
          Providers of the Canadian Firearms Safety Course (CFSC) and the restricted course (CRFSC), by province. We are starting
          with British Columbia and adding provinces as we check them.
        </ThemedText>
      </View>
      <Split>
        {courseDirectory.map((c) => {
          const cities = [...new Set(c.providers.flatMap((p) => p.venues.map((v) => v.city)))];
          return (
            <Col key={c.province} basis={320}>
              <Link href={{ pathname: '/pal-courses/[province]', params: { province: c.province.toLowerCase() } }} asChild>
                <Pressable accessibilityRole="link">
                  <Card style={{ gap: Spacing.two }}>
                    <ThemedText type="heading">{PROVINCES[c.province] ?? c.province}</ThemedText>
                    <ThemedText type="small" themeColor="textSecondary">
                      {c.providers.length} providers in {cities.length} places, including {cities.slice(0, 4).join(', ')}.
                    </ThemedText>
                    <ThemedText type="smallBold">See courses →</ThemedText>
                  </Card>
                </Pressable>
              </Link>
            </Col>
          );
        })}
      </Split>
      <ListYourCourse province="your province" />
    </Screen>
  );
}
