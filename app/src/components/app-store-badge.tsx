import { Link, type Href } from 'expo-router';
import { Image, Pressable } from 'react-native';

import { PAL_TEST_APP_STORE_URL } from '@/lib/handoff';

const BADGE = require('../../assets/images/app-store-badge.png');
// Apple's artwork is 738 × 219. Apple asks for the badge to stay at least 40 px tall on screen.
const HEIGHT = 48;
const WIDTH = Math.round((HEIGHT * 738) / 219);

/**
 * Apple's official "Download on the App Store" badge for the website. It renders a real <a href> so search engines and
 * link previews see the store link.
 */
export function AppStoreBadge() {
  return (
    <Link href={PAL_TEST_APP_STORE_URL as Href} asChild>
      <Pressable accessibilityRole="link" accessibilityLabel="Download PAL Test Canada on the App Store" style={{ alignSelf: 'flex-start' }}>
        {({ pressed, hovered }: { pressed: boolean; hovered?: boolean }) => (
          <Image
            source={BADGE}
            style={{ width: WIDTH, height: HEIGHT, opacity: pressed || hovered ? 0.85 : 1 }}
            resizeMode="contain"
            accessibilityIgnoresInvertColors
          />
        )}
      </Pressable>
    </Link>
  );
}
