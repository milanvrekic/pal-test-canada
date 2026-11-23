import { View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Button, Screen } from '@/components/ui';
import { Spacing } from '@/constants/theme';
/**
 * Shown for any address that doesn't match a page. Exported as 404.html for Netlify; Expo ignores generateMetadata
 * here, so tools/postexport.mjs adds the title and noindex tag.
 */
export default function NotFound() {
  return (
    <Screen>
      <View style={{ gap: Spacing.two }}>
        <ThemedText type="eyebrow" themeColor="signal">
          404
        </ThemedText>
        <ThemedText type="title" accessibilityRole="header">
          Page not found
        </ThemedText>
        <ThemedText themeColor="textSecondary">
          That page doesn't exist, or it has moved. Like an unidentified target: if you're not sure, don't shoot. Pick one of these
          instead.
        </ThemedText>
      </View>
      <View style={{ gap: Spacing.two }}>
        <Button variant="signal" label="Practice tests" href="/" />
        <Button variant="secondary" label="Spot the mistake" href="/spot" />
        <Button variant="secondary" label="Licence wait times" href="/wait-times" />
        <Button variant="secondary" label="Guides" href="/guides" />
      </View>
    </Screen>
  );
}
