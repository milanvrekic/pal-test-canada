import { Link } from 'expo-router';
import type { Metadata } from 'expo-router/server';
import { Pressable, View } from 'react-native';

import { ListYourCourse } from '@/components/course-directory';
import { ProvincePicker } from '@/components/province-picker';
import { ThemedText } from '@/components/themed-text';
import { Button, Card, Col, Eyebrow, Notice, Screen, Split } from '@/components/ui';
import { Spacing } from '@/constants/theme';
import { PROVINCES } from '@/features/wait/stats';
import { courseCities, courseDirectory } from '@/lib/content';
import { useProvince } from '@/lib/province';
import { page } from '@/lib/seo';

export function generateMetadata(): Metadata {
  return page('/pal-courses', {
    title: 'Where to take the PAL course: CFSC and CRFSC providers by province | PAL Test Canada',
    description: 'Find a Canadian Firearms Safety Course near you. Providers by province and region, with contact details checked against their own listings.',
  });
}

export default function PalCourses() {
  const province = useProvince();
  const mine = province ? courseDirectory.find((c) => c.province === province) : undefined;
  return (
    <Screen width="wide">
      <View style={{ gap: Spacing.two }}>
        <Eyebrow tone="signal">Course directory</Eyebrow>
        <ThemedText type="title" accessibilityRole="header">
          Where to take the PAL course
        </ThemedText>
        <ThemedText themeColor="textSecondary" style={{ fontSize: 18, lineHeight: 27, maxWidth: 720 }}>
          Providers of the Canadian Firearms Safety Course (CFSC) and the restricted course (CRFSC), by province. We are adding
          provinces as we check them.
        </ThemedText>
      </View>
      <ProvincePicker hint="Pick yours to jump to its course providers. Stays on this device." />
      {province && mine ? (
        <View style={{ alignSelf: 'flex-start' }}>
          <Button
            label={`${mine.providers.length} course ${mine.providers.length === 1 ? 'provider' : 'providers'} in ${PROVINCES[province]}`}
            href={{ pathname: '/pal-courses/[province]', params: { province: province.toLowerCase() } }}
          />
        </View>
      ) : province ? (
        <Notice tone="warning">
          We haven't checked course providers in {PROVINCES[province]} yet.
        </Notice>
      ) : null}
      <Split>
        {courseDirectory.map((c) => {
          const cities = courseCities(c);
          return (
            <Col key={c.province} basis={320}>
              <Link href={{ pathname: '/pal-courses/[province]', params: { province: c.province.toLowerCase() } }} asChild>
                <Pressable accessibilityRole="link">
                  <Card style={{ gap: Spacing.two }}>
                    <ThemedText type="heading">{PROVINCES[c.province] ?? c.province}</ThemedText>
                    <ThemedText type="small" themeColor="textSecondary">
                      {c.regions.length > 1 && cities.length
                        ? `${c.providers.length} providers in ${cities.length} places, including ${cities.slice(0, 4).join(', ')}.`
                        : `Who runs the courses across ${PROVINCES[c.province] ?? c.province}, and how to book.`}
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
