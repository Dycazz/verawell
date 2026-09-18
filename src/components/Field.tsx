import React from 'react';
import { StyleSheet, TextInput, View, type TextInputProps } from 'react-native';
import { Text, useTheme, radius, space, LAYOUT, weight } from '../theme';

/**
 * Filled input, no outline. Borders on every field were doing nothing that the
 * fill does not already do, and they made every form look like a wireframe.
 */
export function Field({
  label,
  hint,
  error,
  multiline,
  style,
  ...rest
}: TextInputProps & { label?: string; hint?: string; error?: string }) {
  const { c } = useTheme();

  return (
    <View>
      {label ? (
        <Text variant="footnote" tone="secondary" style={{ marginBottom: 6 }}>
          {label}
        </Text>
      ) : null}

      <TextInput
        placeholderTextColor={c.labelTertiary}
        multiline={multiline}
        style={StyleSheet.flatten([
          {
            minHeight: multiline ? 96 : LAYOUT.row,
            paddingHorizontal: space.md,
            paddingVertical: multiline ? space.md : space.sm,
            textAlignVertical: multiline ? 'top' : 'center',
            borderRadius: radius.md,
            backgroundColor: c.fill,
            color: c.label,
            fontSize: 17,
            lineHeight: 22,
            ...weight('400'),
          },
          !!error && { backgroundColor: c.crisisFill },
          style,
        ])}
        {...rest}
      />

      {error ? (
        <Text variant="footnote" tone="crisis" style={{ marginTop: 6 }}>
          {error}
        </Text>
      ) : hint ? (
        <Text variant="footnote" tone="secondary" style={{ marginTop: 6 }}>
          {hint}
        </Text>
      ) : null}
    </View>
  );
}
