import Svg, { Circle, Path, Rect } from 'react-native-svg';

type P = { color: import('react-native').ColorValue; size?: number };
const s = { strokeWidth: 2, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const, fill: 'none' };

/** Simple line icons for the native tab bar. */
export const TabIcons = {
  practice: ({ color, size = 24 }: P) => (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Rect x={4} y={3} width={16} height={18} rx={3} stroke={color as string} {...s} />
      <Path d="M8 9l2 2 4-4M8 16h8" stroke={color as string} {...s} />
    </Svg>
  ),
  practical: ({ color, size = 24 }: P) => (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Rect x={3} y={6} width={13} height={14} rx={3} stroke={color as string} {...s} />
      <Path d="M8 3h10a3 3 0 0 1 3 3v10" stroke={color as string} {...s} />
      <Path d="M7 11h5M7 15h3" stroke={color as string} {...s} />
    </Svg>
  ),
  drills: ({ color, size = 24 }: P) => (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Rect x={3} y={5} width={18} height={14} rx={3} stroke={color as string} {...s} />
      <Circle cx={9} cy={10} r={1.8} stroke={color as string} {...s} />
      <Path d="M21 16l-5-5-8 8" stroke={color as string} {...s} />
    </Svg>
  ),
  licence: ({ color, size = 24 }: P) => (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Circle cx={12} cy={13} r={8} stroke={color as string} {...s} />
      <Path d="M12 9v4l3 2M9 2h6" stroke={color as string} {...s} />
    </Svg>
  ),
  more: ({ color, size = 24 }: P) => (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Circle cx={5} cy={12} r={1.6} fill={color as string} />
      <Circle cx={12} cy={12} r={1.6} fill={color as string} />
      <Circle cx={19} cy={12} r={1.6} fill={color as string} />
    </Svg>
  ),
};
