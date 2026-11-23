import { Platform } from 'react-native';

// 2026: cool neutral canvas, ink-black primary actions, a deep ink hero with a red/amber glow and glass panels,
// blue for your pick, green/red for right/wrong, Canadian red as the brand accent. Not the Canada.ca look.
export const Colors = {
  light: {
    text: '#0A0B0E',
    textSecondary: '#5B5F69',
    background: '#F5F5F7',
    backgroundElement: '#FFFFFF',
    backgroundSelected: '#EDEDF0',
    border: '#E4E4E8',
    borderStrong: '#D3D3DA',
    accent: '#0A0B0E',
    accentDark: '#000000',
    onAccent: '#FFFFFF',
    accentSoft: '#EDEDF0',
    select: '#2563EB',
    selectDark: '#1D4ED8',
    selectBg: '#EEF3FE',
    signal: '#E5322D',
    onSignal: '#FFFFFF',
    signalBg: '#FDECEC',
    cover: '#0A0B0E',
    onCover: '#FFFFFF',
    onCoverMuted: '#A3A7B2',
    tintRed: '#FFE9E7',
    tintBlue: '#E8EFFF',
    tintGreen: '#E2F6E9',
    tintSand: '#FFF2D9',
    tintLilac: '#EFEAFF',
    success: '#12813B',
    successDark: '#0B6A2F',
    successBg: '#E2F6E9',
    danger: '#DC2626',
    dangerDark: '#B91C1C',
    dangerBg: '#FDECEC',
    warning: '#7A5200',
    warningBg: '#FFF2D9',
  },
  dark: {
    text: '#F4F4F6',
    textSecondary: '#A3A7B2',
    background: '#0A0B0E',
    backgroundElement: '#15171C',
    backgroundSelected: '#22252C',
    border: '#272A31',
    borderStrong: '#3A3E47',
    accent: '#F4F4F6',
    accentDark: '#FFFFFF',
    onAccent: '#0A0B0E',
    accentSoft: '#22252C',
    select: '#60A5FA',
    selectDark: '#3B82F6',
    selectBg: '#14213A',
    signal: '#FF5A50',
    onSignal: '#1A0705',
    signalBg: '#3A1714',
    cover: '#0A0B0E',
    onCover: '#F4F4F6',
    onCoverMuted: '#A3A7B2',
    tintRed: '#2E1716',
    tintBlue: '#14213A',
    tintGreen: '#12281B',
    tintSand: '#2C2416',
    tintLilac: '#211C33',
    success: '#4ADE80',
    successDark: '#86EFAC',
    successBg: '#12281B',
    danger: '#F87171',
    dangerDark: '#FCA5A5',
    dangerBg: '#2E1716',
    warning: '#FFD27A',
    warningBg: '#2C2416',
  },
} as const;

export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;

// Geist everywhere. Web loads the variable font (all weights from one file); native uses static files for headings
// and the system font for body text.
const web = Platform.OS === 'web';
export const Fonts = {
  display: web ? 'Geist' : 'Geist-ExtraBold',
  bold: web ? 'Geist' : 'Geist-Bold',
  semi: web ? 'Geist' : 'Geist-SemiBold',
  body: web ? 'Geist' : undefined,
};

export const TINTS = ['tintRed', 'tintBlue', 'tintGreen', 'tintSand', 'tintLilac'] as const;

/** Soft card shadow (React Native 0.76+ supports boxShadow on all platforms). */
export const Shadow = { boxShadow: '0 1px 2px rgba(10, 11, 14, 0.04), 0 12px 32px -8px rgba(10, 11, 14, 0.10)' } as const;

/** Frosted glass on the web (Liquid Glass-style); a solid translucent fill elsewhere. */
export const Glass = web
  ? ({ backdropFilter: 'blur(24px) saturate(160%)', WebkitBackdropFilter: 'blur(24px) saturate(160%)' } as object)
  : {};

export const Spacing = { half: 2, one: 4, two: 8, three: 16, four: 24, five: 32, six: 64 } as const;
/** Reading pages (quiz, guides). */
export const MaxContentWidth = 720;
/** Pages laid out in columns on desktop (home, drills, wait times). */
export const MaxWideWidth = 1120;
/** Cards and panels. */
export const Radius = 24;
/** Buttons, inputs, answer rows. */
export const RadiusControl = 16;
