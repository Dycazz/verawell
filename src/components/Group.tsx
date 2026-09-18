import React from 'react';
import { StyleSheet, View, type ViewStyle } from 'react-native';
import { Text, useTheme, LAYOUT, space } from '../theme';

/**
 * An iOS inset grouped section.
 *
 * No shadow and no border — the container reads as raised purely because its
 * fill differs from the grouped background behind it. That is the whole trick,
 * and it is why native lists look calm where a wall of drop-shadowed cards does
 * not. Separators are drawn between children automatically and inset to line up
 * with the label above them.
 */
export function Group({
  children,
  header,
  footer,
  /** Padding for prose blocks; rows manage their own. */
  padded,
  tone = 'surface',
  separatorInset = LAYOUT.separatorInset,
  style,
}: {
  children: React.ReactNode;
  header?: string;
  footer?: string;
  padded?: boolean;
  tone?: 'surface' | 'tint' | 'crisis' | 'warn' | 'positive';
  separatorInset?: number;
  style?: ViewStyle;
}) {
  const { c } = useTheme();

  const bg = {
    surface: c.surface,
    tint: c.tintFill,
    crisis: c.crisisFill,
    warn: c.warnFill,
    positive: c.positiveFill,
  }[tone];

  const items = React.Children.toArray(children).filter(Boolean);

  return (
    <View style={style}>
      {header ? (
        <Text variant="footnote" tone="secondary" style={styles.header}>
          {header}
        </Text>
      ) : null}

      <View style={[styles.group, { backgroundColor: bg }, padded && styles.padded]}>
        {items.map((child, i) => (
          <React.Fragment key={i}>
            {child}
            {/* Separators divide rows. A padded group holds one block of
                content, so ruling between its parts would be noise. */}
            {!padded && i < items.length - 1 ? (
              <View style={[styles.separator, { backgroundColor: c.separator, marginLeft: separatorInset }]} />
            ) : null}
          </React.Fragment>
        ))}
      </View>

      {footer ? (
        <Text variant="footnote" tone="secondary" style={styles.footer}>
          {footer}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  group: { borderRadius: LAYOUT.groupRadius, overflow: 'hidden' },
  padded: { padding: LAYOUT.margin },
  // Title case, not uppercase: matches Health and SwiftUI grouped sections, and
  // keeps the screen from turning into a column of shouting micro-labels.
  header: { marginBottom: 7, marginLeft: LAYOUT.margin, marginTop: space.xs },
  footer: { marginTop: 7, marginHorizontal: LAYOUT.margin },
  separator: { height: StyleSheet.hairlineWidth },
});
