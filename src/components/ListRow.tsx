import React from 'react';
import { StyleSheet, View, type ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Springy } from './Pressable';
import { Text, useTheme, radius, space, HIT } from '../theme';

interface Props {
  title: string;
  subtitle?: string;
  icon?: keyof typeof Ionicons.glyphMap;
  /** Icon chip tint. Defaults to the brand teal. */
  accent?: 'primary' | 'clay' | 'crisis' | 'onShift' | 'caution';
  onPress?: () => void;
  right?: React.ReactNode;
  /** Hides the chevron on rows that are informational rather than navigational. */
  chevron?: boolean;
  style?: ViewStyle;
  last?: boolean;
}

export function ListRow({
  title,
  subtitle,
  icon,
  accent = 'primary',
  onPress,
  right,
  chevron = true,
  style,
  last,
}: Props) {
  const { c } = useTheme();

  const tint = { primary: c.primary, clay: c.clay, crisis: c.crisis, onShift: c.onShift, caution: c.caution }[accent];
  const tintSoft = {
    primary: c.primarySoft,
    clay: c.claySoft,
    crisis: c.crisisSoft,
    onShift: c.onShiftSoft,
    caution: c.cautionSoft,
  }[accent];

  const body = (
    <View style={[styles.row, { minHeight: HIT + 8, gap: space.base }]}>
      {icon ? (
        <View style={[styles.chip, { backgroundColor: tintSoft }]}>
          <Ionicons name={icon} size={20} color={tint} />
        </View>
      ) : null}

      <View style={styles.text}>
        <Text variant="bodyStrong">{title}</Text>
        {subtitle ? (
          <Text variant="caption" tone="muted" style={{ marginTop: 2 }}>
            {subtitle}
          </Text>
        ) : null}
      </View>

      {right}
      {onPress && chevron ? <Ionicons name="chevron-forward" size={18} color={c.inkFaint} /> : null}
    </View>
  );

  const bordered: ViewStyle = last
    ? {}
    : { borderBottomWidth: StyleSheet.hairlineWidth * 2, borderBottomColor: c.line };

  if (!onPress) return <View style={[bordered, style]}>{body}</View>;

  return (
    <Springy
      onPress={onPress}
      scaleTo={0.985}
      accessibilityRole="button"
      accessibilityLabel={subtitle ? `${title}. ${subtitle}` : title}
      style={StyleSheet.flatten([bordered, { borderRadius: radius.sm }, style])}
    >
      {body}
    </Springy>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: space.md },
  chip: { width: 40, height: 40, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center' },
  text: { flex: 1 },
});
