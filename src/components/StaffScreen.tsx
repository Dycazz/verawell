import React from 'react';
import { useWindowDimensions } from 'react-native';
import { Screen } from './Screen';

/** Console pages share one width and one inset rule so they line up with the nav bar. */
export function StaffScreen({
  children,
  title,
  subtitle,
  headerRight,
}: {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
  headerRight?: React.ReactNode;
}) {
  const { width } = useWindowDimensions();
  const wide = width >= 820;

  return (
    <Screen
      title={title}
      subtitle={subtitle}
      headerRight={headerRight}
      maxWidth={wide ? 1120 : 700}
      topInset={!wide}
    >
      {children}
    </Screen>
  );
}
