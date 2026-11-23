import { Slot, Tabs } from 'expo-router';
import { Platform, useWindowDimensions } from 'react-native';

import { TabIcons } from '@/components/tab-icons';
import { useTheme } from '@/hooks/use-theme';

// The native apps' five tabs. Every other page is a stack screen in the root layout and opens on top with Back.
// The website keeps its top navigation: here the group renders its page directly. EXPO_PUBLIC_APP_LAYOUT=1 shows the
// app layout on the web for review.
const appLayout = Platform.OS !== 'web' || process.env.EXPO_PUBLIC_APP_LAYOUT === '1';

/**
 * Wider than a regular phone held upright (iPhone Duo's outer display, its open inner display, landscape, iPad): the
 * tabs move to a rail on the trailing edge, like the system bars on iPhone Duo, so the content keeps its height.
 * Decided from the window's own size, never the device or orientation, so it follows every fold and resize.
 */
function useSideTabs() {
  const { width, height } = useWindowDimensions();
  return width / height >= 0.62;
}

export default function TabsLayout() {
  const theme = useTheme();
  const side = useSideTabs();
  if (!appLayout) return <Slot />;
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: theme.accent,
        tabBarInactiveTintColor: theme.textSecondary,
        tabBarPosition: side ? 'right' : 'bottom',
        // On the side: a navigation rail (icon above label) at every width, with a soft highlight on the current tab.
        tabBarVariant: side ? 'material' : 'uikit',
        tabBarActiveBackgroundColor: side ? theme.accentSoft : undefined,
        tabBarStyle: side
          ? { backgroundColor: theme.backgroundElement, borderLeftColor: theme.border, minWidth: 88 }
          : { backgroundColor: theme.backgroundElement, borderTopColor: theme.border },
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
      }}>
      <Tabs.Screen name="index" options={{ title: 'Practice', tabBarIcon: ({ color }) => <TabIcons.practice color={color} /> }} />
      <Tabs.Screen name="practical" options={{ title: 'Practical', tabBarIcon: ({ color }) => <TabIcons.practical color={color} /> }} />
      <Tabs.Screen name="spot" options={{ title: 'Spot it', tabBarIcon: ({ color }) => <TabIcons.drills color={color} /> }} />
      <Tabs.Screen name="wait-times/index" options={{ title: 'Wait times', tabBarIcon: ({ color }) => <TabIcons.licence color={color} /> }} />
      <Tabs.Screen name="more" options={{ title: 'More', tabBarIcon: ({ color }) => <TabIcons.more color={color} /> }} />
    </Tabs>
  );
}
