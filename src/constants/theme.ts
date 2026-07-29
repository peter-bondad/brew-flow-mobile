import '@/global.css';

import { Platform } from 'react-native';

export const Colors = {
  light: {
    text: '#3d2413',
    background: '#fffaf5',
    backgroundElement: '#fbf3eb',
    backgroundSelected: '#f4e2cd',
    textSecondary: '#7b5f46',
    primary: '#6f3e1d',
    primaryForeground: '#fff8ef',
    secondary: '#f4e2cd',
    secondaryForeground: '#4a2c1a',
    border: '#e4c8a7',
    destructive: '#dc2626',
    success: '#16a34a',
    warning: '#d97706',
    card: '#fffdf9',
    cardForeground: '#3d2413',
  },
  dark: {
    text: '#fbf3eb',
    background: '#1c1410',
    backgroundElement: '#2a1f18',
    backgroundSelected: '#3d2413',
    textSecondary: '#a88b6f',
    primary: '#f4e2cd',
    primaryForeground: '#3d2413',
    secondary: '#3d2413',
    secondaryForeground: '#f4e2cd',
    border: '#4a2c1a',
    destructive: '#fca5a5',
    success: '#4ade80',
    warning: '#fbbf24',
    card: '#261c15',
    cardForeground: '#fbf3eb',
  },
} as const;

export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;

export const Fonts = Platform.select({
  ios: {
    sans: 'system-ui',
    serif: 'ui-serif',
    rounded: 'ui-rounded',
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: 'var(--font-display)',
    serif: 'var(--font-serif)',
    rounded: 'var(--font-rounded)',
    mono: 'var(--font-mono)',
  },
});

export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 64,
} as const;

export const BottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0;
export const MaxContentWidth = 800;
