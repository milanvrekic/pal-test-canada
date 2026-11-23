import '@/global.css';

import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';

import { useTheme } from '@/hooks/use-theme';
import { track } from '@/lib/analytics';

export default function RootLayout() {
  const theme = useTheme();
  useEffect(() => {
    track({ name: 'session_start' });
  }, []);
  // One stack: the (tabs) group first; every other page is pushed on top of it (with a native back gesture in the apps).
  return (
    <>
      <StatusBar style="auto" />
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: theme.background } }}>
        <Stack.Screen name="(tabs)" />
        {/* The quiz is a focus mode: full screen, swipe down is off so a stray gesture can't end an exam. */}
        <Stack.Screen name="quiz" options={{ gestureEnabled: false }} />
      </Stack>
    </>
  );
}
