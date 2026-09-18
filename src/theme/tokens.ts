/**
 * VeraWell design tokens.
 *
 * Direction: "quiet shelter" — warm, editorial, unhurried. This app is used by
 * people in crisis, sometimes on a phone someone else can see. So: warm neutrals
 * instead of clinical greys, one deep teal that carries the brand, and a crisis
 * red that is spent on exactly one thing so it never stops meaning "emergency".
 */

export type ColorScheme = 'light' | 'dark';

export interface Palette {
  /** Page background. */
  bg: string;
  /** Raised surfaces — cards, sheets, rows. */
  surface: string;
  /** Recessed / secondary fills. */
  surfaceAlt: string;
  /** Surface that sits on top of a tinted section. */
  surfaceRaised: string;

  ink: string;
  inkMuted: string;
  inkFaint: string;

  line: string;
  lineStrong: string;

  primary: string;
  primarySoft: string;
  primaryEdge: string;
  onPrimary: string;

  clay: string;
  claySoft: string;
  onClay: string;

  /** Reserved for the crisis affordance. Do not reuse for ordinary destructive UI. */
  crisis: string;
  crisisSoft: string;
  onCrisis: string;

  onShift: string;
  onShiftSoft: string;
  caution: string;
  cautionSoft: string;

  /** Scrim behind modals and the quick-exit flash. */
  scrim: string;
}

const light: Palette = {
  bg: '#F6F2EC',
  surface: '#FFFDFA',
  surfaceAlt: '#EDE7DD',
  surfaceRaised: '#FFFFFF',

  ink: '#1B1917',
  inkMuted: '#5B5650',
  inkFaint: '#8B847A',

  line: '#E3DCD1',
  lineStrong: '#CFC5B6',

  primary: '#0E4F49',
  primarySoft: '#DCEAE6',
  primaryEdge: '#B6D2CB',
  onPrimary: '#F6F2EC',

  clay: '#A84E2B',
  claySoft: '#F6E3D9',
  onClay: '#FFFDFA',

  crisis: '#A92018',
  crisisSoft: '#F8DEDB',
  onCrisis: '#FFFDFA',

  onShift: '#2C6B4E',
  onShiftSoft: '#D9EADF',
  caution: '#8A5A0B',
  cautionSoft: '#F7E9CE',

  scrim: 'rgba(27, 25, 23, 0.44)',
};

const dark: Palette = {
  bg: '#111413',
  surface: '#191D1C',
  surfaceAlt: '#232827',
  surfaceRaised: '#202524',

  ink: '#F1EEE8',
  inkMuted: '#ABA49B',
  inkFaint: '#7C756C',

  line: '#2D3332',
  lineStrong: '#3D4443',

  primary: '#79C4B4',
  primarySoft: '#16322E',
  primaryEdge: '#24453F',
  onPrimary: '#06211E',

  clay: '#E2926A',
  claySoft: '#38221A',
  onClay: '#2A150C',

  crisis: '#FF7468',
  crisisSoft: '#3C1A17',
  onCrisis: '#2B0B08',

  onShift: '#7BC79B',
  onShiftSoft: '#16301F',
  caution: '#E0AE5C',
  cautionSoft: '#33260F',

  scrim: 'rgba(0, 0, 0, 0.62)',
};

export const palettes: Record<ColorScheme, Palette> = { light, dark };

/** 4pt rhythm. Named so layout code reads as intent, not arithmetic. */
export const space = {
  xs: 4,
  sm: 8,
  md: 12,
  base: 16,
  lg: 20,
  xl: 24,
  '2xl': 32,
  '3xl': 40,
  '4xl': 56,
} as const;

export const radius = {
  sm: 10,
  md: 14,
  lg: 20,
  xl: 28,
  pill: 999,
} as const;

/**
 * Minimum interactive height. Above the 44pt floor on purpose — hands shake,
 * and a missed tap on the crisis button is the worst bug this app could have.
 */
export const HIT = 52;

export const fonts = {
  display: 'Fraunces_600SemiBold',
  displayBold: 'Fraunces_700Bold',
  body: 'IBMPlexSans_400Regular',
  bodyMedium: 'IBMPlexSans_500Medium',
  bodySemi: 'IBMPlexSans_600SemiBold',
} as const;

export const duration = {
  quick: 140,
  base: 240,
  calm: 420,
} as const;
