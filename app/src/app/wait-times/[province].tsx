import type { Metadata } from 'expo-router/server';

import { page } from '@/lib/seo';
import { useLocalSearchParams } from 'expo-router';
import { View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Button, Screen } from '@/components/ui';
import { SourceNote, SummaryCard, Tracker, provincesWithData, waitData } from '@/components/wait-times';
import { Spacing } from '@/constants/theme';
import { PROVINCES } from '@/features/wait/stats';

export function generateStaticParams(): { province: string }[] {
  return provincesWithData().map((p) => ({ province: p.toLowerCase() }));
}

export function generateMetadata(_request: unknown, params: Record<string, string | string[]>): Metadata | null {
  const code = String(params.province).toUpperCase();
  const name = PROVINCES[code];
  if (!name) return null;
  const d = waitData(code);
  return page(`/wait-times/${code.toLowerCase()}`, {
    title: `PAL wait times in ${name} | PAL Test Canada`,
    description: d.local
      ? `Applicants in ${name} report a typical wait of ${d.local.median} days for a new PAL. See the range and track your own application.`
      : `How long applicants report waiting for a new PAL in ${name}, and a tracker for your own application.`,
  });
}

export default function ProvinceWaitTimes() {
  const { province } = useLocalSearchParams<{ province: string }>();
  const code = String(province ?? '').toUpperCase();
  const name = PROVINCES[code];
  if (!name) {
    return (
      <Screen>
        <ThemedText type="heading">Province not found</ThemedText>
        <Button label="All wait times" href="/wait-times" />
      </Screen>
    );
  }
  const d = waitData(code);
  return (
    <Screen>
      <View style={{ gap: Spacing.two }}>
        <ThemedText type="title" accessibilityRole="header">
          PAL wait times in {name}
        </ThemedText>
        <ThemedText themeColor="textSecondary">
          Applications are processed by the RCMP's Canadian Firearms Program, with eligibility checks by the Chief Firearms Officer
          for your province. These are the waits applicants in {name} have reported.
        </ThemedText>
      </View>
      <SummaryCard title={`New applications in ${name}`} s={d.local} note="Renewals and files with a reported problem left out" />
      <SummaryCard title="All of Canada, for comparison" s={d.national} />
      <Tracker national={d.national} />
      <Button variant="secondary" label="Wait times for every province" href="/wait-times" />
      <SourceNote total={d.total} first={d.first} last={d.last} />
    </Screen>
  );
}
