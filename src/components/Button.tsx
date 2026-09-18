import React from 'react';
import { ActivityIndicator, StyleSheet, View, type ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Springy } from './Pressable';
import { Text, useTheme, radius, space, HIT, fonts } from '../theme';

export type ButtonVariant = 'primary' | 'secondary' | 'soft' | 'clay' | 'crisis' | 'ghost';
export type ButtonSize = 'lg' | 'md' | 'sm';

interface Props {
  label: string;
  onPress?: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: keyof typeof Ionicons.glyphMap;
  iconRight?: keyof typeof Ionicons.glyphMap;
  disabled?: boolean;
  loading?: boolean;
  full?: boolean;
  style?: ViewStyle;
  accessibilityHint?: string;
}

export function Button({
  label,
  onPress,
  variant = 'primary',
  size = 'md',
  icon,
  iconRight,
  disabled,
  loading,
  full,
  style,
  accessibilityHint,
}: Props) {
  const { c } = useTheme();

  const skin: Record<ButtonVariant, { bg: string; fg: string; border?: string }> = {
    primary: { bg: c.primary, fg: c.onPrimary },
    secondary: { bg: 'transparent', fg: c.primary, border: c.primaryEdge },
    soft: { bg: c.primarySoft, fg: c.primary },
    clay: { bg: c.clay, fg: c.onClay },
    crisis: { bg: c.crisis, fg: c.onCrisis },
    ghost: { bg: 'transparent', fg: c.inkMuted },
  };

  const dims: Record<ButtonSize, { h: number; px: number; fs: number; gap: number }> = {
    lg: { h: 60, px: space.xl, fs: 17, gap: 10 },
    md: { h: HIT, px: space.lg, fs: 16, gap: 9 },
    sm: { h: 40, px: space.base, fs: 14, gap: 7 },
  };

  const s = skin[variant];
  const d = dims[size];
  const inert = disabled || loading;

  return (
    <Springy
      onPress={inert ? undefined : onPress}
      disabled={inert}
      haptic={variant === 'crisis' ? 'heavy' : 'light'}
      scaleTo={size === 'lg' ? 0.975 : 0.965}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityHint={accessibilityHint}
      accessibilityState={{ disabled: !!inert, busy: !!loading }}
      style={StyleSheet.flatten([
        {
          minHeight: d.h,
          paddingHorizontal: d.px,
          borderRadius: radius.md,
          backgroundColor: s.bg,
          borderWidth: s.border ? 1.5 : 0,
          borderColor: s.border,
          opacity: inert ? 0.45 : 1,
          alignSelf: full ? 'stretch' : 'flex-start',
        },
        style,
      ])}
    >
      <View style={[styles.inner, { minHeight: d.h, gap: d.gap }]}>
        {loading ? (
          <ActivityIndicator color={s.fg} size="small" />
        ) : (
          <>
            {icon ? <Ionicons name={icon} size={d.fs + 3} color={s.fg} /> : null}
            <Text style={{ color: s.fg, fontFamily: fonts.bodySemi, fontSize: d.fs }}>{label}</Text>
            {iconRight ? <Ionicons name={iconRight} size={d.fs + 2} color={s.fg} /> : null}
          </>
        )}
      </View>
    </Springy>
  );
}

const styles = StyleSheet.create({
  inner: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
});
