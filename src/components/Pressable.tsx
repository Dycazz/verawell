import React, { useCallback, useRef } from 'react';
import { Animated, Pressable, Platform, type PressableProps, type ViewStyle } from 'react-native';
import * as Haptics from 'expo-haptics';

interface Props extends Omit<PressableProps, 'style'> {
  style?: ViewStyle | ViewStyle[];
  /** How far the surface sinks under a finger. Larger targets can take more. */
  scaleTo?: number;
  haptic?: 'light' | 'medium' | 'heavy' | 'none';
  children: React.ReactNode;
}

/**
 * Pressable with a spring response. Touch feedback is doing real work here: a lot
 * of this app is used quickly and half-looked-at, and a surface that moves
 * confirms the tap landed without needing a screen change to prove it.
 */
export function Springy({ style, scaleTo = 0.97, haptic = 'light', children, onPressIn, onPressOut, ...rest }: Props) {
  const scale = useRef(new Animated.Value(1)).current;

  const spring = useCallback(
    (to: number) =>
      Animated.spring(scale, {
        toValue: to,
        useNativeDriver: true,
        speed: 40,
        bounciness: 4,
      }).start(),
    [scale],
  );

  return (
    <Pressable
      onPressIn={(e) => {
        spring(scaleTo);
        if (haptic !== 'none' && Platform.OS !== 'web') {
          Haptics.impactAsync(
            haptic === 'heavy'
              ? Haptics.ImpactFeedbackStyle.Heavy
              : haptic === 'medium'
                ? Haptics.ImpactFeedbackStyle.Medium
                : Haptics.ImpactFeedbackStyle.Light,
          ).catch(() => {});
        }
        onPressIn?.(e);
      }}
      onPressOut={(e) => {
        spring(1);
        onPressOut?.(e);
      }}
      {...rest}
    >
      <Animated.View style={[style, { transform: [{ scale }] }]}>{children}</Animated.View>
    </Pressable>
  );
}
