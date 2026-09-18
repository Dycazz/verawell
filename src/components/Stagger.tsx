import React, { useEffect, useRef } from 'react';
import { Animated, Easing, type ViewStyle } from 'react-native';
import { duration } from '../theme';

/**
 * A single calm entrance: content lifts and fades in, each item a beat after the
 * one above it. One orchestrated reveal per screen reads as considered; motion
 * scattered across every element reads as noise.
 */
export function Stagger({
  index = 0,
  children,
  style,
  distance = 10,
}: {
  index?: number;
  children: React.ReactNode;
  style?: ViewStyle | ViewStyle[];
  distance?: number;
}) {
  const t = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const anim = Animated.timing(t, {
      toValue: 1,
      duration: duration.calm,
      delay: Math.min(index, 8) * 55,
      easing: Easing.bezier(0.16, 1, 0.3, 1),
      useNativeDriver: true,
    });
    anim.start();
    return () => anim.stop();
  }, [t, index]);

  return (
    <Animated.View
      style={[
        style,
        {
          opacity: t,
          transform: [
            { translateY: t.interpolate({ inputRange: [0, 1], outputRange: [distance, 0] }) },
          ],
        },
      ]}
    >
      {children}
    </Animated.View>
  );
}
