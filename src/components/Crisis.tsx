import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Springy } from './Pressable';
import { elevation } from './Card';
import { Text, useTheme, radius, space } from '../theme';
import { callNumber, formatPhone } from '../lib/contact';

/**
 * The crisis affordance.
 *
 * Deliberately the only thing in the app that gets the crisis red, and the only
 * control that never scrolls away. Anchored low so it sits in the thumb's natural
 * arc — someone reaching for this is not going to be careful about aim.
 */
export function CrisisBar({
  number,
  label = 'Crisis line',
  /** Off when the dock sits above a tab bar that already handles the safe area. */
  safeArea = true,
}: {
  number: string;
  label?: string;
  safeArea?: boolean;
}) {
  const { c, isDark } = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        styles.dock,
        {
          paddingBottom: safeArea ? insets.bottom || space.md : space.md,
          backgroundColor: c.bg,
          borderTopColor: c.line,
        },
      ]}
      pointerEvents="box-none"
    >
      <Springy
        onPress={() => callNumber(number)}
        haptic="heavy"
        scaleTo={0.975}
        accessibilityRole="button"
        accessibilityLabel={`Call the ${label.toLowerCase()}, ${formatPhone(number)}`}
        style={StyleSheet.flatten([
          styles.bar,
          { backgroundColor: c.crisis },
          elevation(2, isDark ? '#000' : c.crisis),
        ])}
      >
        <View style={styles.row}>
          <View style={styles.iconWrap}>
            <Ionicons name="call" size={20} color={c.onCrisis} />
          </View>
          <View style={{ flex: 1 }}>
            <Text variant="subhead" style={{ color: c.onCrisis }}>
              {label}
            </Text>
            <Text variant="caption" style={{ color: c.onCrisis, opacity: 0.85 }}>
              {formatPhone(number)} · answered 24 hours
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={c.onCrisis} style={{ opacity: 0.8 }} />
        </View>
      </Springy>
    </View>
  );
}

/** Height the dock occupies, so screens can pad their scroll content past it. */
export const CRISIS_DOCK_HEIGHT = 92;

const styles = StyleSheet.create({
  dock: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: space.lg,
    paddingTop: space.md,
    borderTopWidth: StyleSheet.hairlineWidth * 2,
  },
  bar: { borderRadius: radius.md, paddingHorizontal: space.base, paddingVertical: 12, minHeight: 60, justifyContent: 'center' },
  row: { flexDirection: 'row', alignItems: 'center', gap: space.md },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: radius.pill,
    backgroundColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
