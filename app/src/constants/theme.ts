import { Platform } from 'react-native';

// Light and friendly, Meta-style: soft blue-grey canvas, white cards, Meta-blue pill buttons, slate ink.
// Canadian red is kept for the logo mark only. Not the Canada.ca look.
export const Colors = {
  light: {
    text: '#1C2B33',
    textSecondary: '#465A69',
    background: '#F1F4F7',
    backgroundElement: '#FFFFFF',
    backgroundSelected: '#E7ECF0',
    border: '#DEE3E9',
    borderStrong: '#CBD2D9',
    accent: '#0064E0',
    accentDark: '#0053BA',
    onAccent: '#FFFFFF',
    accentSoft: '#E6F0FD',
    select: '#0064E0',
    selectDark: '#0053BA',
    selectBg: '#E6F0FD',
    signal: '#0064E0',
    onSignal: '#FFFFFF',
    signalBg: '#E6F0FD',
    brand: '#E5322D',
    cover: '#FFFFFF',
    onCover: '#1C2B33',
    onCoverMuted: '#465A69',
    tintRed: '#FDEDEC',
    tintBlue: '#E6F0FD',
    tintGreen: '#E4F5EA',
    tintSand: '#FDF3E1',
    tintLilac: '#EFEBFC',
    success: '#13803D',
    successDark: '#0C672F',
    successBg: '#E4F5EA',
    danger: '#D42A1F',
    dangerDark: '#AD1F16',
    dangerBg: '#FDEDEC',
    warning: '#7A5200',
    warningBg: '#FDF3E1',
  },
  dark: {
    text: '#E4E6EB',
    textSecondary: '#B0B3B8',
    background: '#18191A',
    backgroundElement: '#242526',
    backgroundSelected: '#3A3B3C',
    border: '#3A3B3C',
    borderStrong: '#4E4F50',
    accent: '#4C9AFF',
    accentDark: '#2D7FEA',
    onAccent: '#0B1A2E',
    accentSoft: '#1B2C44',
    select: '#4C9AFF',
    selectDark: '#2D7FEA',
    selectBg: '#1B2C44',
    signal: '#4C9AFF',
    onSignal: '#0B1A2E',
    signalBg: '#1B2C44',
    brand: '#FF5A50',
    cover: '#242526',
    onCover: '#E4E6EB',
    onCoverMuted: '#B0B3B8',
    tintRed: '#3A1D1C',
    tintBlue: '#1B2C44',
    tintGreen: '#173024',
    tintSand: '#33291A',
    tintLilac: '#272240',
    success: '#4ADE80',
    successDark: '#86EFAC',
    successBg: '#173024',
    danger: '#F87171',
    dangerDark: '#FCA5A5',
    dangerBg: '#3A1D1C',
    warning: '#FFD27A',
    warningBg: '#33291A',
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
  /** Portfolio wordmark face (Huntable, Shootable): Khand Bold, uppercase. */
  logo: web ? 'Khand' : 'Khand-Bold',
};

export const TINTS = ['tintRed', 'tintBlue', 'tintGreen', 'tintSand', 'tintLilac'] as const;

/** Soft card shadow (React Native 0.76+ supports boxShadow on all platforms). */
export const Shadow = { boxShadow: '0 1px 2px rgba(28, 43, 51, 0.06), 0 8px 24px -6px rgba(28, 43, 51, 0.10)' } as const;

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
