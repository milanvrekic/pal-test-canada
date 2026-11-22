export const Colors = {
  light: {
    text: '#14171A',
    textSecondary: '#5B6470',
    background: '#FFFFFF',
    backgroundElement: '#F2F4F6',
    backgroundSelected: '#E3E7EB',
    border: '#D5DAE0',
    accent: '#1F5F3F',
    onAccent: '#FFFFFF',
    success: '#1B7A43',
    successBg: '#E4F4EA',
    danger: '#B3261E',
    dangerBg: '#FBE9E7',
    warning: '#7A5200',
    warningBg: '#FFF3D6',
  },
  dark: {
    text: '#F2F4F6',
    textSecondary: '#A8B0BA',
    background: '#0E1113',
    backgroundElement: '#1B2024',
    backgroundSelected: '#2A3137',
    border: '#333B42',
    accent: '#6FCF97',
    onAccent: '#0E1113',
    success: '#6FCF97',
    successBg: '#12301F',
    danger: '#FF8A80',
    dangerBg: '#3A1614',
    warning: '#FFD27A',
    warningBg: '#3A2C0A',
  },
} as const;

export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;

export const Spacing = { half: 2, one: 4, two: 8, three: 16, four: 24, five: 32, six: 64 } as const;
export const MaxContentWidth = 720;
export const Radius = 12;
