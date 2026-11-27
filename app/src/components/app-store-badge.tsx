import { Link, type Href } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Svg, { Path, Rect } from 'react-native-svg';

import { Fonts } from '@/constants/theme';
import { PAL_TEST_APP_STORE_URL } from '@/lib/handoff';

/**
 * "Download on the App Store" button for the website. It renders a real <a href> so search engines and link previews see
 * the store link. Black with white text, in the shape of Apple's badge; Apple's official badge artwork can replace the
 * inner View later without touching the pages that use it.
 */
export function AppStoreBadge() {
  return (
    <Link href={PAL_TEST_APP_STORE_URL as Href} asChild>
      <Pressable accessibilityRole="link" accessibilityLabel="Download PAL Test Canada on the App Store" style={{ alignSelf: 'flex-start' }}>
        {({ pressed, hovered }: { pressed: boolean; hovered?: boolean }) => (
          <View style={[styles.badge, pressed || hovered ? { opacity: 0.85 } : null]}>
            <Phone />
            <View>
              <Text style={styles.small}>Download on the</Text>
              <Text style={styles.big}>App Store</Text>
            </View>
          </View>
        )}
      </Pressable>
    </Link>
  );
}

function Phone() {
  return (
    <Svg width={20} height={26} viewBox="0 0 20 26" accessibilityElementsHidden importantForAccessibility="no">
      <Rect x={1.5} y={1.5} width={17} height={23} rx={4} stroke="#FFFFFF" strokeWidth={2} fill="none" />
      <Path d="M8 21h4" stroke="#FFFFFF" strokeWidth={2} strokeLinecap="round" />
    </Svg>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#000000',
    borderColor: '#A6A6A6',
    borderWidth: 1,
    borderRadius: 10,
    paddingVertical: 7,
    paddingLeft: 14,
    paddingRight: 18,
    minHeight: 48,
  },
  small: { color: '#FFFFFF', fontSize: 11, lineHeight: 13, fontFamily: Fonts.body },
  big: { color: '#FFFFFF', fontSize: 20, lineHeight: 23, fontWeight: '600', letterSpacing: -0.3, fontFamily: Fonts.semi },
});
