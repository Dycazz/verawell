import React from 'react';
import { Platform, StyleSheet, View, type ViewStyle } from 'react-native';
import { Springy } from './Pressable';
import { Text, useTheme, radius } from '../theme';

/**
 * iOS segmented control. Used anywhere a choice is short, exclusive, and worth
 * showing all at once — which is most of the places this app was reaching for a
 * row of pills.
 */
export function Segmented<T extends string>({
  options,
  value,
  onChange,
  style,
}: {
  options: { value: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
  style?: ViewStyle;
}) {
  const { c, isDark } = useTheme();

  return (
    <View style={[styles.track, { backgroundColor: isDark ? c.fill : '#E9E9EB' }, style]}>
      {options.map((o) => {
        const active = o.value === value;
        return (
          <Springy
            key={o.value}
            onPress={() => onChange(o.value)}
            scaleTo={1}
            accessibilityRole="button"
            accessibilityState={{ selected: active }}
            accessibilityLabel={o.label}
            style={StyleSheet.flatten([
              styles.segment,
              active && {
                backgroundColor: isDark ? '#636366' : '#FFFFFF',
                ...Platform.select({
                  web: { boxShadow: '0 1px 3px rgba(0,0,0,0.12)' } as ViewStyle,
                  default: {
                    shadowColor: '#000',
                    shadowOpacity: 0.12,
                    shadowRadius: 3,
                    shadowOffset: { width: 0, height: 1 },
                    elevation: 1,
                  },
                }),
              },
            ])}
          >
            <Text
              variant="subhead"
              strong={active}
              numberOfLines={1}
              style={{ color: c.label, textAlign: 'center' }}
            >
              {o.label}
            </Text>
          </Springy>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  track: { flexDirection: 'row', borderRadius: 9, padding: 2, gap: 2 },
  segment: { flex: 1, height: 30, borderRadius: 7, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 4 },
});
