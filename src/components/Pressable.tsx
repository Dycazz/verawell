import React, { useCallback, useRef, useState } from 'react';
import { Animated, Pressable, Platform, type PressableProps, type ViewStyle } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../theme';

interface Props extends Omit<PressableProps, 'style'> {
  style?: ViewStyle | ViewStyle[];
  /** Scale response, for buttons and tiles. 1 disables it. */
  scaleTo?: number;
  /**
   * List-row response: the row fills with the system highlight colour while
   * held, the way a native table cell does. Rows do not shrink on iOS, so this
   * is used instead of scale rather than alongside it.
   */
  highlight?: boolean;
  haptic?: 'light' | 'medium' | 'heavy' | 'none';
  children: React.ReactNode;
}

export function Springy({
  style,
  scaleTo = 0.97,
  highlight,
  haptic = 'none',
  children,
  onPressIn,
  onPressOut,
  ...rest
}: Props) {
  const { c } = useTheme();
  const scale = useRef(new Animated.Value(1)).current;
  const [held, setHeld] = useState(false);

  const spring = useCallback(
    (to: number) =>
      Animated.spring(scale, { toValue: to, useNativeDriver: true, speed: 40, bounciness: 3 }).start(),
    [scale],
  );

  return (
    <Pressable
      onPressIn={(e) => {
        if (highlight) setHeld(true);
        if (scaleTo !== 1 && !highlight) spring(scaleTo);
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
        if (highlight) setHeld(false);
        if (scaleTo !== 1 && !highlight) spring(1);
        onPressOut?.(e);
      }}
      {...rest}
    >
      <Animated.View
        style={[
          style,
          held && { backgroundColor: c.fill },
          !highlight && scaleTo !== 1 && { transform: [{ scale }] },
        ]}
      >
        {children}
      </Animated.View>
    </Pressable>
  );
}
