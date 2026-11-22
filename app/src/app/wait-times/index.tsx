import type { Metadata } from 'expo-router/server';

import { page } from '@/lib/seo';
import { Link } from 'expo-router';
import { Pressable, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Card, Screen } from '@/components/ui';
import { SourceNote, SummaryCard, Tracker, provincesWithData, waitData } from '@/components/wait-times';
import { Spacing } from '@/constants/theme';
import { PROVINCES } from '@/features/wait/stats';

export function generateMetadata(): Metadata {
  const d = waitData();
  return page('/wait-times', {
    title: 'PAL wait times in Canada: how long applicants report waiting | PAL Test Canada',
    description: d.national
      ? `Applicants report a typical wait of ${d.national.median} days for a new PAL, with half between ${d.national.p25} and ${d.national.p75} days. Track your own application.`
      : 'How long applicants report waiting for a new PAL, by province, and a tracker for your own application.',
  });
}

export default function WaitTimes() {
  const d = waitData();
  const provinces = provincesWithData();
  return (
    <Screen>
      <View style={{ gap: Spacing.two }}>
        <ThemedText type="title" accessibilityRole="header">
          PAL wait times
        </ThemedText>
        <ThemedText themeColor="textSecondary">
          How long people report waiting for a new firearms licence after they apply, and a tracker for yours. By law a first
          licence can't be issued until at least 28 days after the application.
        </ThemedText>
      </View>

      <SummaryCard
        title={d.window === 'recent' ? 'New applications, last 12 months' : 'New applications'}
        s={d.national}
        note="Renewals and files with a reported problem left out"
      />

      <Tracker national={d.national} />

      <View style={{ gap: Spacing.two }}>
        <ThemedText type="heading" accessibilityRole="header">
          By province
        </ThemedText>
        {Object.keys(PROVINCES)
          .filter((p) => provinces.includes(p))
          .map((p) => {
            const s = waitData(p).local;
            return (
              <Link key={p} href={{ pathname: '/wait-times/[province]', params: { province: p.toLowerCase() } }} asChild>
                <Pressable accessibilityRole="link">
                  <Card>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: Spacing.two }}>
                      <ThemedText type="bold">{PROVINCES[p]}</ThemedText>
                      <ThemedText type="small" themeColor="textSecondary">
                        {s ? `typical ${s.median} days` : 'see details'}
                      </ThemedText>
                    </View>
                  </Card>
                </Pressable>
              </Link>
            );
          })}
        <ThemedText type="small" themeColor="textSecondary">
          Provinces with fewer than 5 reports aren't listed yet.
        </ThemedText>
      </View>

      <View style={{ gap: Spacing.two }}>
        <ThemedText type="heading" accessibilityRole="header">
          Online or by mail
        </ThemedText>
        <SummaryCard title="Applied online" s={d.online} />
        <SummaryCard title="Applied by mail" s={d.mail} />
        {d.renewals ? <SummaryCard title="Renewals" s={d.renewals} note="Renewals are usually quicker" /> : null}
        {d.complicated.length ? (
          <ThemedText type="small" themeColor="textSecondary">
            {d.complicated.length} reports mentioned a problem, such as missing information or a returned form. Those waits ran
            from {Math.min(...d.complicated.map((r) => r.days))} to {Math.max(...d.complicated.map((r) => r.days))} days.
          </ThemedText>
        ) : null}
      </View>

      <SourceNote total={d.total} first={d.first} last={d.last} />
    </Screen>
  );
}
