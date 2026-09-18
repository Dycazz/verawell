import React from 'react';
import { Platform, StyleSheet, View, type ViewStyle } from 'react-native';
import { useTheme, radius, space } from '../theme';

/**
 * Elevation is kept low and warm. Hard drop shadows would fight the paper-like
 * background; a soft, wide shadow just lifts the card off the page.
 */
export function elevation(level: 1 | 2 | 3, shadowColor: string) {
  const map = {
    1: { radius: 10, opacity: 0.05, y: 2, android: 1 },
    2: { radius: 18, opacity: 0.07, y: 5, android: 3 },
    3: { radius: 30, opacity: 0.1, y: 10, android: 7 },
  }[level];

  return Platform.select<ViewStyle>({
    web: { boxShadow: `0 ${map.y}px ${map.radius}px rgba(0,0,0,${map.opacity})` } as ViewStyle,
    android: { elevation: map.android, shadowColor },
    default: {
      shadowColor,
      shadowOffset: { width: 0, height: map.y },
      shadowRadius: map.radius,
      shadowOpacity: map.opacity,
    },
  })!;
}

interface Props {
  children: React.ReactNode;
  style?: ViewStyle | ViewStyle[];
  /** Flat cards sit inside already-tinted sections where a shadow would muddy things. */
  flat?: boolean;
  tone?: 'surface' | 'alt' | 'primary' | 'clay' | 'crisis' | 'caution';
  padded?: boolean;
}

export function Card({ children, style, flat, tone = 'surface', padded = true }: Props) {
  const { c, isDark } = useTheme();

  const bg = {
    surface: c.surface,
    alt: c.surfaceAlt,
    primary: c.primarySoft,
    clay: c.claySoft,
    crisis: c.crisisSoft,
    caution: c.cautionSoft,
  }[tone];

  const border = {
    surface: c.line,
    alt: c.line,
    primary: c.primaryEdge,
    clay: c.clay + (isDark ? '55' : '33'),
    crisis: c.crisis + (isDark ? '55' : '33'),
    caution: c.caution + (isDark ? '55' : '33'),
  }[tone];

  return (
    <View
      style={StyleSheet.flatten([
        {
          backgroundColor: bg,
          borderRadius: radius.lg,
          borderWidth: StyleSheet.hairlineWidth * 2,
          borderColor: border,
          padding: padded ? space.lg : 0,
          overflow: 'hidden',
        },
        !flat && tone === 'surface' && elevation(1, isDark ? '#000' : '#4A3F2E'),
        style,
      ])}
    >
      {children}
    </View>
  );
}
