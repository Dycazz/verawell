import React from 'react';
import { Text as RNText, StyleSheet, type TextProps, type TextStyle } from 'react-native';
import { useTheme } from './ThemeProvider';
import { fonts } from './tokens';

export type TypeVariant =
  | 'display'
  | 'title'
  | 'heading'
  | 'subhead'
  | 'body'
  | 'bodyStrong'
  | 'callout'
  | 'label'
  | 'caption'
  | 'mono';

/**
 * Fraunces carries the headings — it has warmth that a grotesk does not, which
 * matters for an app that should not feel like paperwork. IBM Plex Sans handles
 * everything that has to stay legible at a glance.
 */
const variants: Record<TypeVariant, TextStyle> = {
  display: { fontFamily: fonts.displayBold, fontSize: 34, lineHeight: 40, letterSpacing: -0.6 },
  title: { fontFamily: fonts.display, fontSize: 26, lineHeight: 32, letterSpacing: -0.4 },
  heading: { fontFamily: fonts.display, fontSize: 20, lineHeight: 26, letterSpacing: -0.2 },
  subhead: { fontFamily: fonts.bodySemi, fontSize: 16, lineHeight: 22 },
  body: { fontFamily: fonts.body, fontSize: 16, lineHeight: 24 },
  bodyStrong: { fontFamily: fonts.bodyMedium, fontSize: 16, lineHeight: 24 },
  callout: { fontFamily: fonts.body, fontSize: 15, lineHeight: 22 },
  label: { fontFamily: fonts.bodySemi, fontSize: 13, lineHeight: 18, letterSpacing: 0.4 },
  caption: { fontFamily: fonts.body, fontSize: 13, lineHeight: 18 },
  mono: { fontFamily: fonts.bodySemi, fontSize: 22, lineHeight: 28, letterSpacing: 4 },
};

export type ToneName = 'default' | 'muted' | 'faint' | 'primary' | 'clay' | 'crisis' | 'onShift' | 'onPrimary' | 'onCrisis';

interface Props extends TextProps {
  variant?: TypeVariant;
  tone?: ToneName;
  /** Small-caps-ish treatment for section labels. */
  caps?: boolean;
  center?: boolean;
}

export function Text({ variant = 'body', tone = 'default', caps, center, style, ...rest }: Props) {
  const { c } = useTheme();

  const color = {
    default: c.ink,
    muted: c.inkMuted,
    faint: c.inkFaint,
    primary: c.primary,
    clay: c.clay,
    crisis: c.crisis,
    onShift: c.onShift,
    onPrimary: c.onPrimary,
    onCrisis: c.onCrisis,
  }[tone];

  return (
    <RNText
      style={StyleSheet.flatten([
        variants[variant],
        { color },
        caps && { textTransform: 'uppercase' as const, letterSpacing: 1.1 },
        center && { textAlign: 'center' as const },
        style,
      ])}
      {...rest}
    />
  );
}
