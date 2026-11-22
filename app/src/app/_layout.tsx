import '@/global.css';

import { Stack } from 'expo-router';
import { useEffect } from 'react';

import { track } from '@/lib/analytics';

export default function RootLayout() {
  useEffect(() => {
    track({ name: 'session_start' });
  }, []);
  return <Stack screenOptions={{ headerShown: false }} />;
}
