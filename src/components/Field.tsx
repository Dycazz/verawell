import React, { useState } from 'react';
import { StyleSheet, TextInput, View, type TextInputProps } from 'react-native';
import { Text, useTheme, radius, space, fonts, HIT } from '../theme';

interface Props extends TextInputProps {
  label?: string;
  hint?: string;
  error?: string;
  multiline?: boolean;
}

export function Field({ label, hint, error, multiline, style, ...rest }: Props) {
  const { c } = useTheme();
  const [focused, setFocused] = useState(false);

  return (
    <View style={{ gap: space.sm }}>
      {label ? (
        <Text variant="label" caps tone="faint">
          {label}
        </Text>
      ) : null}

      <TextInput
        placeholderTextColor={c.inkFaint}
        onFocus={(e) => {
          setFocused(true);
          rest.onFocus?.(e);
        }}
        onBlur={(e) => {
          setFocused(false);
          rest.onBlur?.(e);
        }}
        multiline={multiline}
        style={StyleSheet.flatten([
          {
            minHeight: multiline ? 112 : HIT,
            paddingHorizontal: space.base,
            paddingVertical: multiline ? space.md : space.sm,
            textAlignVertical: multiline ? 'top' : 'center',
            borderRadius: radius.md,
            borderWidth: 1.5,
            borderColor: error ? c.crisis : focused ? c.primary : c.line,
            backgroundColor: c.surface,
            color: c.ink,
            fontFamily: fonts.body,
            fontSize: 16,
            lineHeight: 22,
          },
          style,
        ])}
        {...rest}
      />

      {error ? (
        <Text variant="caption" tone="crisis">
          {error}
        </Text>
      ) : hint ? (
        <Text variant="caption" tone="faint">
          {hint}
        </Text>
      ) : null}
    </View>
  );
}
