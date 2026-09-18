import React from 'react';
import { Text as RNText, StyleSheet, type TextProps, type TextStyle } from 'react-native';
import { useTheme } from './ThemeProvider';
import { weight } from './tokens';

export type TypeVariant =
  | 'largeTitle'
  | 'title1'
  | 'title2'
  | 'title3'
  | 'headline'
  | 'body'
  | 'callout'
  | 'subhead'
  | 'footnote'
  | 'caption'
  | 'caption2';

/**
 * The iOS Dynamic Type ramp at the default (Large) size class. Sticking to these
 * eleven styles is what keeps the app from inventing its own typography: every
 * size and weight here is one a native app would already be using.
 */
const variants: Record<TypeVariant, TextStyle> = {
  largeTitle: { fontSize: 34, lineHeight: 41, letterSpacing: 0.37, ...weight('700') },
  title1: { fontSize: 28, lineHeight: 34, letterSpacing: 0.36, ...weight('400') },
  title2: { fontSize: 22, lineHeight: 28, letterSpacing: 0.35, ...weight('600') },
  title3: { fontSize: 20, lineHeight: 25, letterSpacing: 0.38, ...weight('600') },
  headline: { fontSize: 17, lineHeight: 22, letterSpacing: -0.41, ...weight('600') },
  body: { fontSize: 17, lineHeight: 22, letterSpacing: -0.41, ...weight('400') },
  callout: { fontSize: 16, lineHeight: 21, letterSpacing: -0.32, ...weight('400') },
  subhead: { fontSize: 15, lineHeight: 20, letterSpacing: -0.24, ...weight('400') },
  footnote: { fontSize: 13, lineHeight: 18, letterSpacing: -0.08, ...weight('400') },
  caption: { fontSize: 12, lineHeight: 16, ...weight('400') },
  caption2: { fontSize: 11, lineHeight: 13, letterSpacing: 0.07, ...weight('400') },
};

export type ToneName =
  | 'default'
  | 'secondary'
  | 'tertiary'
  | 'tint'
  | 'crisis'
  | 'positive'
  | 'warn'
  | 'onTint'
  | 'onCrisis';

interface Props extends TextProps {
  variant?: TypeVariant;
  tone?: ToneName;
  /** Semibold override without changing size — for emphasis inside a row. */
  strong?: boolean;
  /** Lining figures that do not shift width as they change. */
  tabular?: boolean;
  center?: boolean;
}

export function Text({
  variant = 'body',
  tone = 'default',
  strong,
  tabular,
  center,
  style,
  ...rest
}: Props) {
  const { c } = useTheme();

  const color = {
    default: c.label,
    secondary: c.labelSecondary,
    tertiary: c.labelTertiary,
    tint: c.tint,
    crisis: c.crisis,
    positive: c.positive,
    warn: c.warn,
    onTint: c.onTint,
    onCrisis: c.onCrisis,
  }[tone];

  return (
    <RNText
      style={StyleSheet.flatten([
        variants[variant],
        { color },
        strong && weight('600'),
        tabular && { fontVariant: ['tabular-nums' as const] },
        center && { textAlign: 'center' as const },
        style,
      ])}
      {...rest}
    />
  );
}
