import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Springy } from './Pressable';
import { Text, useTheme, space, LAYOUT } from '../theme';
import { callNumber, formatPhone } from '../lib/contact';

/**
 * The crisis affordance.
 *
 * Full-bleed and square-cornered on purpose: it should read as system chrome —
 * the same register as a call-in-progress bar or Watch Duty's active incident
 * banner — rather than as another card in the content. It is the only place in
 * the app that uses red, so red never stops meaning emergency.
 */
export function CrisisBar({
  number,
  label = 'Crisis line',
  safeArea = true,
}: {
  number: string;
  label?: string;
  safeArea?: boolean;
}) {
  const { c } = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <Springy
      onPress={() => callNumber(number)}
      haptic="medium"
      scaleTo={1}
      accessibilityRole="button"
      accessibilityLabel={`Call the ${label.toLowerCase()}, ${formatPhone(number)}`}
      style={StyleSheet.flatten([
        styles.bar,
        { backgroundColor: c.crisis, paddingBottom: safeArea ? insets.bottom || space.md : space.md },
      ])}
    >
      <View style={styles.row}>
        <Ionicons name="call" size={19} color={c.onCrisis} />
        <View style={{ flex: 1 }}>
          <Text variant="subhead" strong style={{ color: c.onCrisis }}>
            {label}
          </Text>
          <Text variant="caption" style={{ color: c.onCrisis, opacity: 0.9 }}>
            {formatPhone(number)} · answered 24 hours
          </Text>
        </View>
        <Ionicons name="chevron-forward" size={17} color={c.onCrisis} style={{ opacity: 0.8 }} />
      </View>
    </Springy>
  );
}

export const CRISIS_DOCK_HEIGHT = 60;

const styles = StyleSheet.create({
  bar: { paddingHorizontal: LAYOUT.margin, paddingTop: space.md },
  row: { flexDirection: 'row', alignItems: 'center', gap: space.md, minHeight: 36 },
});
