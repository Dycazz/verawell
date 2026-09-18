import { Platform, type TextStyle } from 'react-native';

/**
 * VeraWell design tokens.
 *
 * Direction: this is a utility, not a brand. A person opening it may be in a bad
 * moment on a phone they are not sure is private, so the interface should feel
 * like part of the operating system rather than like an app with opinions.
 * Everything below follows the platform: system type at Dynamic Type sizes,
 * iOS system greys, inset grouped lists.
 *
 * References it is built against: iOS Settings and Health for list structure,
 * Watch Duty for the persistent incident bar, Signal for the plain, dense,
 * trust-by-legibility posture.
 */

export type ColorScheme = 'light' | 'dark';

export interface Palette {
  /** Behind grouped content. */
  bg: string;
  /** The grouped container itself. */
  surface: string;
  /** Recessed fills — chips, steppers, inputs on a surface. */
  fill: string;
  fillStrong: string;
  /** Bars that sit above content: nav, tab, dock. */
  chrome: string;

  label: string;
  labelSecondary: string;
  labelTertiary: string;

  separator: string;

  /** One accent. Institutional blue, chosen to leave red unspent. */
  tint: string;
  tintFill: string;
  onTint: string;

  /** Reserved for the crisis affordance and nothing else. */
  crisis: string;
  crisisFill: string;
  onCrisis: string;

  positive: string;
  positiveFill: string;
  warn: string;
  warnFill: string;

  scrim: string;

  /**
   * Fills for icon chips only — a white glyph sits on these, so they are the
   * vivid system colours rather than the text-contrast ones above.
   */
  iconBlue: string;
  iconGreen: string;
  iconOrange: string;
  iconRed: string;
  iconGrey: string;
}

const light: Palette = {
  bg: '#F2F2F7',
  surface: '#FFFFFF',
  fill: '#E9E9EB',
  fillStrong: '#D1D1D6',
  chrome: '#F9F9F9',

  label: '#000000',
  labelSecondary: '#6C6C70',
  labelTertiary: '#A3A3A8',

  separator: '#C6C6C8',

  tint: '#0A5C8A',
  tintFill: '#E3EEF5',
  onTint: '#FFFFFF',

  crisis: '#C8102E',
  crisisFill: '#FBE6E9',
  onCrisis: '#FFFFFF',

  positive: '#1E7A3E',
  positiveFill: '#E4F1E8',
  warn: '#8A5A00',
  warnFill: '#F8EFDD',

  scrim: 'rgba(0,0,0,0.4)',

  iconBlue: '#007AFF',
  iconGreen: '#34C759',
  iconOrange: '#FF9500',
  iconRed: '#FF3B30',
  iconGrey: '#8E8E93',
};

const dark: Palette = {
  bg: '#000000',
  surface: '#1C1C1E',
  fill: '#2C2C2E',
  fillStrong: '#3A3A3C',
  chrome: '#1C1C1E',

  label: '#FFFFFF',
  labelSecondary: '#98989F',
  labelTertiary: '#5C5C61',

  separator: '#38383A',

  tint: '#64B5E6',
  tintFill: '#16304099',
  onTint: '#00243A',

  crisis: '#FF453A',
  crisisFill: '#3A1416',
  onCrisis: '#2B0906',

  positive: '#30D158',
  positiveFill: '#12301C',
  warn: '#FFD60A',
  warnFill: '#332A05',

  scrim: 'rgba(0,0,0,0.6)',

  iconBlue: '#0A84FF',
  iconGreen: '#30D158',
  iconOrange: '#FF9F0A',
  iconRed: '#FF453A',
  iconGrey: '#8E8E93',
};

export const palettes: Record<ColorScheme, Palette> = { light, dark };

/**
 * iOS layout constants. These are not arbitrary: 16pt is the standard layout
 * margin, 10pt the inset-grouped corner radius, 44pt the minimum row height.
 */
export const LAYOUT = {
  /** Screen edge to content. */
  margin: 16,
  /** Inset grouped container corner radius. */
  groupRadius: 10,
  /** Minimum tappable row height. */
  row: 44,
  /** Taller row for two-line content. */
  rowTall: 58,
  /** Separators start level with the label, not the container edge. */
  separatorInset: 16,
  /** Gap between grouped sections. */
  sectionGap: 32,
} as const;

export const space = {
  xs: 4,
  sm: 8,
  md: 12,
  base: 16,
  lg: 20,
  xl: 24,
  '2xl': 32,
  '3xl': 44,
} as const;

export const radius = {
  sm: 6,
  md: 10,
  lg: 14,
  pill: 999,
} as const;

/**
 * System type. Using the platform font rather than a webfont is the single
 * biggest thing that makes an app read as native — and it inherits the user's
 * Dynamic Type size, which a bundled font does not.
 */
export const systemFont = Platform.select({
  ios: undefined, // undefined === San Francisco
  android: 'sans-serif',
  default: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
});

export const systemFontMedium = Platform.select({
  ios: undefined,
  android: 'sans-serif-medium',
  default: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
});

/** Weight helper: Android needs a font family swap, not just a weight. */
export function weight(w: TextStyle['fontWeight']): TextStyle {
  const heavy = w === '600' || w === '700' || w === 'bold';
  return Platform.OS === 'android'
    ? { fontFamily: heavy ? 'sans-serif-medium' : 'sans-serif', fontWeight: w }
    : { fontFamily: systemFont, fontWeight: w };
}

export const duration = {
  quick: 120,
  base: 220,
  calm: 320,
} as const;
