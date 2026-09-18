import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Text, useTheme, space } from '../theme';

export function SectionHeader({
  title,
  action,
  style,
}: {
  title: string;
  action?: React.ReactNode;
  style?: object;
}) {
  const { c } = useTheme();
  return (
    <View style={[styles.header, style]}>
      <Text variant="label" caps tone="faint" style={{ color: c.inkFaint }}>
        {title}
      </Text>
      {action}
    </View>
  );
}

export function Divider({ inset = 0 }: { inset?: number }) {
  const { c } = useTheme();
  return <View style={{ height: StyleSheet.hairlineWidth * 2, backgroundColor: c.line, marginLeft: inset }} />;
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: space.md,
    marginTop: space.sm,
  },
});
