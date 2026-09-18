import React from 'react';
import { ActivityIndicator, StyleSheet, View, type ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Springy } from './Pressable';
import { Text, useTheme, radius, space } from '../theme';

export type ButtonVariant = 'filled' | 'tinted' | 'plain' | 'crisis' | 'grey';
export type ButtonSize = 'lg' | 'md' | 'sm';

/**
 * Three real button weights — filled, tinted, plain — matching what iOS offers.
 * Anything that needs a fourth is usually a sign the screen has too many
 * competing actions on it.
 */
export function Button({
  label,
  onPress,
  variant = 'filled',
  size = 'md',
  icon,
  disabled,
  loading,
  full,
  style,
  accessibilityHint,
}: {
  label: string;
  onPress?: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: keyof typeof Ionicons.glyphMap;
  disabled?: boolean;
  loading?: boolean;
  full?: boolean;
  style?: ViewStyle;
  accessibilityHint?: string;
}) {
  const { c } = useTheme();

  const skin: Record<ButtonVariant, { bg: string; fg: string }> = {
    filled: { bg: c.tint, fg: c.onTint },
    tinted: { bg: c.tintFill, fg: c.tint },
    plain: { bg: 'transparent', fg: c.tint },
    crisis: { bg: c.crisis, fg: c.onCrisis },
    grey: { bg: c.fill, fg: c.label },
  };

  const dims: Record<ButtonSize, { h: number; px: number; fs: number }> = {
    lg: { h: 50, px: space.lg, fs: 17 },
    md: { h: 44, px: space.base, fs: 17 },
    sm: { h: 34, px: space.md, fs: 15 },
  };

  const s = skin[variant];
  const d = dims[size];
  const inert = disabled || loading;

  return (
    <Springy
      onPress={inert ? undefined : onPress}
      disabled={inert}
      haptic={variant === 'crisis' ? 'medium' : 'none'}
      scaleTo={variant === 'plain' ? 1 : 0.98}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityHint={accessibilityHint}
      accessibilityState={{ disabled: !!inert, busy: !!loading }}
      style={StyleSheet.flatten([
        {
          minHeight: d.h,
          paddingHorizontal: variant === 'plain' ? space.xs : d.px,
          borderRadius: radius.md,
          backgroundColor: s.bg,
          opacity: inert ? 0.35 : 1,
          alignSelf: full ? 'stretch' : 'flex-start',
          justifyContent: 'center',
        },
        style,
      ])}
    >
      <View style={styles.inner}>
        {loading ? (
          <ActivityIndicator color={s.fg} size="small" />
        ) : (
          <>
            {icon ? <Ionicons name={icon} size={d.fs + 1} color={s.fg} /> : null}
            <Text variant={d.fs === 17 ? 'body' : 'subhead'} strong style={{ color: s.fg }}>
              {label}
            </Text>
          </>
        )}
      </View>
    </Springy>
  );
}

const styles = StyleSheet.create({
  inner: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6 },
});
