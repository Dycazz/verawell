import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import { Text, useTheme, radius, space } from '../theme';

type Tone = 'primary' | 'clay' | 'crisis' | 'onShift' | 'caution' | 'neutral';

export function Badge({ label, tone = 'primary', dot }: { label: string; tone?: Tone; dot?: boolean }) {
  const { c } = useTheme();

  const fg = {
    primary: c.primary,
    clay: c.clay,
    crisis: c.crisis,
    onShift: c.onShift,
    caution: c.caution,
    neutral: c.inkMuted,
  }[tone];
  const bg = {
    primary: c.primarySoft,
    clay: c.claySoft,
    crisis: c.crisisSoft,
    onShift: c.onShiftSoft,
    caution: c.cautionSoft,
    neutral: c.surfaceAlt,
  }[tone];

  return (
    <View style={[styles.badge, { backgroundColor: bg }]}>
      {dot ? <LiveDot color={fg} /> : null}
      <Text variant="label" style={{ color: fg }}>
        {label}
      </Text>
    </View>
  );
}

/** A slow breath, not a blink — signals "live" without demanding attention. */
export function LiveDot({ color, size = 7 }: { color: string; size?: number }) {
  const pulse = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1, duration: 1300, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 0, duration: 1300, useNativeDriver: true }),
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
        opacity: pulse.interpolate({ inputRange: [0, 1], outputRange: [0.45, 1] }),
      }}
    />
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: space.md,
    paddingVertical: 6,
    borderRadius: radius.pill,
    alignSelf: 'flex-start',
  },
});
