import { Linking, View } from 'react-native';

import { Spacing } from '@/constants/theme';
import { track } from '@/lib/analytics';
import { HANDOFFS } from '@/lib/handoff';

import { ThemedText } from './themed-text';
import { Button, Card } from './ui';

export function HandoffCards({ placement }: { placement: string }) {
  return (
    <View style={{ gap: Spacing.two }}>
      <ThemedText type="subheading">Once your licence arrives</ThemedText>
      {HANDOFFS.map((h) => (
        <Card key={h.id}>
          <ThemedText type="bold">{h.question}</ThemedText>
          <ThemedText themeColor="textSecondary">
            {h.name}: {h.blurb}
          </ThemedText>
          {h.status === 'live' && h.url ? (
            <Button
              variant="secondary"
              label={`Open ${h.name}`}
              onPress={() => {
                track({ name: 'handoff_click', destination: h.id, placement });
                void Linking.openURL(h.url!);
              }}
            />
          ) : (
            <ThemedText type="small" themeColor="textSecondary">
              {h.status === 'coming-soon' ? 'Coming soon' : 'Link coming soon'}
            </ThemedText>
          )}
        </Card>
      ))}
    </View>
  );
}
