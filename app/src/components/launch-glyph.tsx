import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useState } from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  runOnJS,
  useAnimatedProps,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Circle, G, Path, Rect } from 'react-native-svg';

/**
 * The opening animation in the apps. The native splash (assets/images/splash-icon.png) shows the licence card and
 * photo only; this overlay starts as an exact copy of it, ticks the check, draws the line beside it, then lifts away
 * to reveal the app. Size and colour must match the expo-splash-screen entry in app.json (imageWidth 76, glyph at
 * 0.95 of the 1024 canvas, #5A4BD6 on white) and tools/icons/make-icons.py.
 *
 * Not used on the web, which has no native splash.
 */

const SIZE = 76;
const BRAND = '#5A4BD6';
const BACKGROUND = '#FFFFFF';
// Path lengths in the 1024 canvas: the check is two 45° strokes (66√2 + 116√2), the line is 174 long.
const CHECK_LENGTH = 258;
const LINE_LENGTH = 174;

const AnimatedPath = Animated.createAnimatedComponent(Path);

export const showLaunchGlyph = Platform.OS !== 'web';

if (showLaunchGlyph) {
  // Keep the native splash up until the overlay below has drawn its first frame.
  SplashScreen.preventAutoHideAsync().catch(() => {});
}

export function LaunchGlyph() {
  const [done, setDone] = useState(!showLaunchGlyph);
  const reduceMotion = useReducedMotion();
  const check = useSharedValue(0);
  const line = useSharedValue(0);
  const lift = useSharedValue(0);

  useEffect(() => {
    if (done) return;
    SplashScreen.hideAsync().catch(() => {});
    const finish = (finished?: boolean) => {
      'worklet';
      if (finished) runOnJS(setDone)(true);
    };
    if (reduceMotion) {
      // No drawing or scaling: show the finished glyph and fade it out.
      check.value = 1;
      line.value = 1;
      lift.value = withDelay(250, withTiming(1, { duration: 200 }, finish));
      return;
    }
    const draw = Easing.bezier(0.65, 0, 0.35, 1);
    check.value = withDelay(180, withTiming(1, { duration: 360, easing: draw }));
    line.value = withDelay(460, withTiming(1, { duration: 240, easing: Easing.out(Easing.cubic) }));
    lift.value = withDelay(900, withTiming(1, { duration: 340, easing: Easing.in(Easing.cubic) }, finish));
    // Safety net: never leave the overlay covering the app.
    const timer = setTimeout(() => setDone(true), 3000);
    return () => clearTimeout(timer);
  }, [done, reduceMotion, check, line, lift]);

  const checkProps = useAnimatedProps(() => ({ strokeDashoffset: CHECK_LENGTH * (1 - check.value) }));
  const lineProps = useAnimatedProps(() => ({ strokeDashoffset: LINE_LENGTH * (1 - line.value) }));
  const overlayStyle = useAnimatedStyle(() => ({ opacity: 1 - lift.value }));
  const glyphStyle = useAnimatedStyle(() => ({
    // A small pop as the check lands, then the card grows slightly as the overlay fades.
    transform: [{ scale: reduceMotion ? 1 : 1 + 0.04 * Math.sin(Math.PI * check.value) + 0.12 * lift.value }],
  }));

  if (done) return null;
  return (
    <Animated.View
      style={[StyleSheet.absoluteFill, styles.overlay, overlayStyle]}
      pointerEvents="none"
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants">
      <Animated.View style={glyphStyle}>
        <Svg width={SIZE} height={SIZE} viewBox="0 0 1024 1024">
          <G
            transform="translate(512 512) scale(0.95) translate(-512 -512)"
            fill="none"
            stroke={BRAND}
            strokeWidth={54}
            strokeLinecap="round"
            strokeLinejoin="round">
            <Rect x={186} y={292} width={652} height={440} rx={72} />
            <Circle cx={366} cy={462} r={58} />
            <Path d="M270 640 c14-64 56-96 96-96 s82 32 96 96" />
            <AnimatedPath d="M548 520 L614 586 L730 470" strokeDasharray={CHECK_LENGTH} animatedProps={checkProps} />
            <AnimatedPath d="M556 662 H730" strokeDasharray={LINE_LENGTH} animatedProps={lineProps} />
          </G>
        </Svg>
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  overlay: { backgroundColor: BACKGROUND, alignItems: 'center', justifyContent: 'center', zIndex: 1000 },
});
