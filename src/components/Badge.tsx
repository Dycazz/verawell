import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import { Text, useTheme, radius } from '../theme';

type Tone = 'tint' | 'crisis' | 'positive' | 'warn' | 'grey';

/** Small count or status pill, sized like a native badge rather than a chip. */
export function Badge({ label, tone = 'tint' }: { label: string; tone?: Tone }) {
  const { c } = useTheme();

  const fg = { tint: c.tint, crisis: c.crisis, positive: c.positive, warn: c.warn, grey: c.labelSecondary }[tone];
  const bg = {
    tint: c.tintFill,
    crisis: c.crisisFill,
    positive: c.positiveFill,
    warn: c.warnFill,
    grey: c.fill,
  }[tone];

  return (
    <View style={[styles.badge, { backgroundColor: bg }]}>
      <Text variant="caption" strong style={{ color: fg }}>
        {label}
      </Text>
    </View>
  );
}

/** Slow breath, not a blink — the same idea as a recording indicator. */
export function LiveDot({ color, size = 8 }: { color: string; size?: number }) {
  const pulse = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1, duration: 1200, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 0, duration: 1200, useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [pulse]);

  return (
    <Animated.View
      style={{
        width: size,
        height: size,
        borderRadius: size,
        backgroundColor: color,
        opacity: pulse.interpolate({ inputRange: [0, 1], outputRange: [0.4, 1] }),
      }}
    />
  );
}

const styles = StyleSheet.create({
  badge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: radius.pill, alignSelf: 'flex-start' },
});
