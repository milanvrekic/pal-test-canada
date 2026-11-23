import { useState } from 'react';
import { Linking, Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Button, Card, Col, Split } from '@/components/ui';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { track } from '@/lib/analytics';
import { type CourseProvider, type ProvinceCourses, LISTINGS_EMAIL } from '@/lib/content';

const COURSE_LABEL = { cfsc: 'CFSC · non-restricted', crfsc: 'CRFSC · restricted' } as const;

function ProviderCard({ p }: { p: CourseProvider }) {
  const theme = useTheme();
  const open = (url: string, kind: string) => {
    track({ name: 'handoff_click', destination: `course:${p.id}:${kind}`, placement: 'pal_courses' });
    void Linking.openURL(url);
  };
  return (
    <Card style={{ gap: Spacing.three, flexGrow: 1 }}>
      <View style={{ gap: Spacing.two }}>
        <ThemedText type="heading">{p.name}</ThemedText>
        <View style={styles.badges}>
          {p.courses.map((c) => (
            <View key={c} style={[styles.badge, { backgroundColor: c === 'cfsc' ? theme.tintBlue : theme.tintLilac }]}>
              <ThemedText type="smallBold">{COURSE_LABEL[c]}</ThemedText>
            </View>
          ))}
        </View>
      </View>
      <View style={{ gap: Spacing.one }}>
        {p.venues.map((v) => (
          <ThemedText key={v.city + v.place} type="small" themeColor="textSecondary">
            <ThemedText type="smallBold">{v.city}</ThemedText> · {v.place}
          </ThemedText>
        ))}
      </View>
      <View style={styles.actions}>
        <Pressable accessibilityRole="link" onPress={() => open(p.website, 'website')} style={[styles.action, { borderColor: theme.borderStrong }]}>
          <ThemedText type="smallBold">Website ↗</ThemedText>
        </Pressable>
        {p.phone ? (
          <Pressable accessibilityRole="link" onPress={() => open(`tel:${p.phone!.replace(/[^0-9+]/g, '')}`, 'phone')} style={[styles.action, { borderColor: theme.borderStrong }]}>
            <ThemedText type="smallBold">Call {p.phone}</ThemedText>
          </Pressable>
        ) : null}
        {p.email ? (
          <Pressable accessibilityRole="link" onPress={() => open(`mailto:${p.email}`, 'email')} style={[styles.action, { borderColor: theme.borderStrong }]}>
            <ThemedText type="smallBold">Email</ThemedText>
          </Pressable>
        ) : null}
      </View>
      <ThemedText type="small" themeColor="textSecondary" style={{ marginTop: 'auto' }}>
        Checked {p.checked} from the provider's public listing. Confirm dates and prices with them.
      </ThemedText>
    </Card>
  );
}

/** Region filter plus provider cards for one province. */
export function CourseDirectory({ data }: { data: ProvinceCourses }) {
  const theme = useTheme();
  const [region, setRegion] = useState<string | null>(null);
  const shown = data.providers.filter((p) => !region || p.regions.includes(region));
  const regions = data.regions.filter((r) => data.providers.some((p) => p.regions.includes(r.id)));
  return (
    <View style={{ gap: Spacing.three }}>
      <View style={styles.chips} accessibilityRole="radiogroup" accessibilityLabel="Region">
        {[{ id: null as string | null, name: 'All of BC' }, ...regions].map((r) => {
          const active = region === r.id;
          const count = r.id ? data.providers.filter((p) => p.regions.includes(r.id!)).length : data.providers.length;
          return (
            <Pressable
              key={r.id ?? 'all'}
              accessibilityRole="radio"
              accessibilityState={{ checked: active }}
              onPress={() => setRegion(r.id)}
              style={[styles.chip, active ? { backgroundColor: theme.accent, borderColor: theme.accent } : { borderColor: theme.borderStrong, backgroundColor: theme.backgroundElement }]}>
              <ThemedText type="smallBold" style={{ color: active ? theme.onAccent : theme.text }}>
                {r.name} · {count}
              </ThemedText>
            </Pressable>
          );
        })}
      </View>
      <Split>
        {shown.map((p) => (
          <Col key={p.id} basis={340}>
            <ProviderCard p={p} />
          </Col>
        ))}
      </Split>
    </View>
  );
}

/** Instructors can ask to be added or corrected. */
export function ListYourCourse({ province }: { province: string }) {
  const theme = useTheme();
  const subject = encodeURIComponent(`PAL course listing (${province})`);
  const body = encodeURIComponent(
    'Business or instructor name:\nCity and venue:\nCourses (CFSC / CRFSC):\nWebsite:\nPhone or email for students:\n',
  );
  return (
    <View style={[styles.listYours, { backgroundColor: theme.tintSand }]}>
      <View style={{ flex: 1, minWidth: 240, gap: Spacing.one }}>
        <ThemedText type="heading">Teach the CFSC or CRFSC?</ThemedText>
        <ThemedText themeColor="textSecondary">
          Listings are free. Send your details, or a correction, and we will add or update your listing after checking it.
        </ThemedText>
      </View>
      <View style={{ minWidth: 220 }}>
        <Button label="Email us your listing" onPress={() => void Linking.openURL(`mailto:${LISTINGS_EMAIL}?subject=${subject}&body=${body}`)} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  badges: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.two },
  badge: { borderRadius: 999, paddingHorizontal: Spacing.two + 4, paddingVertical: 4 },
  actions: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.two },
  action: { borderWidth: 1, borderRadius: 999, paddingHorizontal: Spacing.three, minHeight: 40, justifyContent: 'center' },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.two },
  chip: { borderWidth: 1, borderRadius: 999, paddingHorizontal: Spacing.three, minHeight: 40, justifyContent: 'center' },
  listYours: { borderRadius: Radius + 4, padding: Spacing.four, flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: Spacing.three },
});
