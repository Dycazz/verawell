import React from 'react';
import { useWindowDimensions } from 'react-native';
import { Screen } from './Screen';

/**
 * Console pages share one width and one inset rule, so they stay aligned with the
 * nav bar above them and do not each re-derive the desk-vs-phone decision.
 */
export function StaffScreen({
  children,
  eyebrow,
  title,
  subtitle,
  headerRight,
}: {
  children: React.ReactNode;
  eyebrow?: string;
  title: string;
  subtitle?: string;
  headerRight?: React.ReactNode;
}) {
  const { width } = useWindowDimensions();
  const wide = width >= 820;

  return (
    <Screen
      eyebrow={eyebrow}
      title={title}
      subtitle={subtitle}
      headerRight={headerRight}
      maxWidth={wide ? 1180 : 720}
      topInset={!wide}
    >
      {children}
    </Screen>
  );
}
