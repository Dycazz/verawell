import React from 'react';
import { StyleSheet, View, type ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Springy } from './Pressable';
import { Text, useTheme, LAYOUT, radius, space } from '../theme';

export type RowAccent = 'tint' | 'crisis' | 'positive' | 'warn' | 'grey';

/**
 * A standard list row.
 *
 * The icon, when present, is the iOS Settings treatment: a small saturated
 * rounded square with a white glyph, 29pt — not a large pastel chip. At that
 * size it works as a scanning aid instead of decoration.
 */
export function Row({
  title,
  subtitle,
  icon,
  accent = 'tint',
  value,
  onPress,
  accessory,
  right,
  destructive,
  style,
}: {
  title: string;
  subtitle?: string;
  icon?: keyof typeof Ionicons.glyphMap;
  accent?: RowAccent;
  /** Right-aligned secondary detail, the iOS "value1" cell. */
  value?: string;
  onPress?: () => void;
  accessory?: 'chevron' | 'none';
  right?: React.ReactNode;
  destructive?: boolean;
  style?: ViewStyle;
}) {
  const { c } = useTheme();

  const accentColor = {
    tint: c.iconBlue,
    crisis: c.iconRed,
    positive: c.iconGreen,
    warn: c.iconOrange,
    grey: c.iconGrey,
  }[accent];

  const showChevron = accessory === 'chevron' || (accessory === undefined && !!onPress);

  const body = (
    <View style={[styles.row, subtitle ? styles.rowTall : null, style]}>
      {icon ? (
        <View style={[styles.icon, { backgroundColor: accentColor }]}>
          <Ionicons name={icon} size={16} color="#FFFFFF" />
        </View>
      ) : null}

      <View style={styles.text}>
        <Text variant="body" tone={destructive ? 'crisis' : 'default'} numberOfLines={2}>
          {title}
        </Text>
        {subtitle ? (
          <Text variant="footnote" tone="secondary" style={{ marginTop: 1 }}>
            {subtitle}
          </Text>
        ) : null}
      </View>

      {value ? (
        <Text variant="body" tone="secondary" numberOfLines={1} style={styles.value}>
          {value}
        </Text>
      ) : null}

      {right}

      {showChevron ? (
        <Ionicons name="chevron-forward" size={17} color={c.labelTertiary} style={{ marginLeft: 2 }} />
      ) : null}
    </View>
  );

  if (!onPress) return body;

  return (
    <Springy
      onPress={onPress}
      highlight
      accessibilityRole="button"
      accessibilityLabel={subtitle ? `${title}. ${subtitle}` : title}
    >
      {body}
    </Springy>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
    minHeight: LAYOUT.row,
    paddingHorizontal: LAYOUT.margin,
    paddingVertical: space.sm,
  },
  rowTall: { minHeight: LAYOUT.rowTall },
  icon: { width: 29, height: 29, borderRadius: radius.sm, alignItems: 'center', justifyContent: 'center' },
  text: { flex: 1 },
  value: { flexShrink: 1, textAlign: 'right' },
});
