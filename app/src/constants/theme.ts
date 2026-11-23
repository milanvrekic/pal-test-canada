// Canadian red for the brand and the one main action, charcoal for structure, white cards on a soft neutral canvas.
// Pastel tints mark topics and stats. Deliberately not the Canada.ca look: no flag symbol, no federal blue.
export const Colors = {
  light: {
    text: '#232326',
    textSecondary: '#5D5F66',
    background: '#F6F6F4',
    backgroundElement: '#FFFFFF',
    backgroundSelected: '#ECECEA',
    border: '#E2E2DF',
    accent: '#2B2B2F',
    onAccent: '#FFFFFF',
    accentSoft: '#EDEDF0',
    signal: '#C8281E',
    onSignal: '#FFFFFF',
    signalBg: '#FCE9E6',
    cover: '#232326',
    onCover: '#FFFFFF',
    onCoverMuted: '#B7B8BE',
    tintRed: '#FCE9E6',
    tintBlue: '#E7EDFA',
    tintGreen: '#E3F3E9',
    tintSand: '#FBF0DA',
    tintLilac: '#EEEAFA',
    success: '#1D7542',
    successBg: '#E3F3E9',
    danger: '#B3261E',
    dangerBg: '#FBE7E4',
    warning: '#7A5200',
    warningBg: '#FBF0DA',
  },
  dark: {
    text: '#F2F2F3',
    textSecondary: '#A9AAB1',
    background: '#121214',
    backgroundElement: '#1C1C1F',
    backgroundSelected: '#29292D',
    border: '#333338',
    accent: '#F2F2F3',
    onAccent: '#121214',
    accentSoft: '#2A2A2F',
    signal: '#FF6B5E',
    onSignal: '#1A0705',
    signalBg: '#3A1714',
    cover: '#1C1C1F',
    onCover: '#F2F2F3',
    onCoverMuted: '#A9AAB1',
    tintRed: '#33191A',
    tintBlue: '#1A2233',
    tintGreen: '#16291E',
    tintSand: '#2E2618',
    tintLilac: '#241F33',
    success: '#7CC59A',
    successBg: '#16291E',
    danger: '#FF8A80',
    dangerBg: '#3A1614',
    warning: '#FFD27A',
    warningBg: '#2E2618',
  },
} as const;

export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;

// Archivo at expanded width for headings and numbers (wordmark feel); the platform font for reading.
// File names equal the PostScript names, so one family string works on iOS, Android and web.
export const Fonts = {
  display: 'ArchivoExpanded-ExtraBold',
  displaySemi: 'ArchivoExpanded-Bold',
};

export const TINTS = ['tintRed', 'tintBlue', 'tintGreen', 'tintSand', 'tintLilac'] as const;

/** Soft card shadow (React Native 0.76+ supports boxShadow on all platforms). */
export const Shadow = { boxShadow: '0 1px 2px rgba(20, 20, 30, 0.05), 0 6px 20px rgba(20, 20, 30, 0.06)' } as const;

export const Spacing = { half: 2, one: 4, two: 8, three: 16, four: 24, five: 32, six: 64 } as const;
/** Reading pages (quiz, guides). */
export const MaxContentWidth = 720;
/** Pages laid out in columns on desktop (home, drills, wait times). */
export const MaxWideWidth = 1120;
/** Cards and panels. */
export const Radius = 20;
/** Buttons, inputs, answer rows. */
export const RadiusControl = 14;
