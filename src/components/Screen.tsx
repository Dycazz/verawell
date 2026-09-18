import React from 'react';
import { Platform, ScrollView, StyleSheet, View, type ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Springy } from './Pressable';
import { Stagger } from './Stagger';
import { Text, useTheme, space, radius } from '../theme';

/** The console is read on laptops; everything else is a phone. */
export const CONTENT_MAX = 720;

interface ScreenProps {
  children: React.ReactNode;
  /** Small uppercase line above the title. */
  eyebrow?: string;
  title?: string;
  subtitle?: string;
  /** Soft colour wash behind the header — used on landing screens only. */
  wash?: boolean;
  back?: boolean;
  headerRight?: React.ReactNode;
  scroll?: boolean;
  /** Extra bottom padding so sticky bars never cover the last row. */
  bottomInset?: number;
  contentStyle?: ViewStyle;
  maxWidth?: number;
  /** Off when a parent chrome (the staff console bar) already cleared the notch. */
  topInset?: boolean;
}

export function Screen({
  children,
  eyebrow,
  title,
  subtitle,
  wash,
  back,
  headerRight,
  scroll = true,
  bottomInset = 0,
  contentStyle,
  maxWidth = CONTENT_MAX,
  topInset = true,
}: ScreenProps) {
  const { c, isDark } = useTheme();
  const insets = useSafeAreaInsets();

  const header =
    title || back || eyebrow ? (
      <Stagger index={0} style={{ marginBottom: space.lg }}>
        {(back || headerRight) && (
          <View style={styles.topRow}>
            {back ? (
              <Springy
                onPress={() => (router.canGoBack() ? router.back() : router.replace('/'))}
                scaleTo={0.9}
                accessibilityRole="button"
                accessibilityLabel="Go back"
                style={StyleSheet.flatten([styles.backBtn, { backgroundColor: c.surfaceAlt }])}
              >
                <Ionicons name="chevron-back" size={22} color={c.ink} />
              </Springy>
            ) : (
              <View />
            )}
            {headerRight}
          </View>
        )}

        {eyebrow ? (
          <Text variant="label" caps tone="primary" style={{ marginBottom: 6 }}>
            {eyebrow}
          </Text>
        ) : null}
        {title ? <Text variant="display">{title}</Text> : null}
        {subtitle ? (
          <Text variant="callout" tone="muted" style={{ marginTop: space.sm, maxWidth: 520 }}>
            {subtitle}
          </Text>
        ) : null}
      </Stagger>
    ) : null;

  const inner = (
    <View style={[{ width: '100%', maxWidth, alignSelf: 'center' }, contentStyle]}>
      {header}
      {children}
    </View>
  );

  const padding = {
    paddingTop: (topInset ? insets.top : 0) + space.base,
    paddingHorizontal: space.lg,
    paddingBottom: insets.bottom + space.xl + bottomInset,
  };

  return (
    <View style={{ flex: 1, backgroundColor: c.bg }}>
      {wash ? (
        <LinearGradient
          colors={[
            isDark ? 'rgba(121,196,180,0.10)' : 'rgba(14,79,73,0.10)',
            isDark ? 'rgba(121,196,180,0)' : 'rgba(14,79,73,0)',
          ]}
          style={StyleSheet.absoluteFill}
          pointerEvents="none"
        />
      ) : null}

      {scroll ? (
        <ScrollView
          contentContainerStyle={padding}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={Platform.OS === 'web'}
        >
          {inner}
        </ScrollView>
      ) : (
        <View style={[{ flex: 1 }, padding]}>{inner}</View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: space.base,
    minHeight: 44,
  },
  backBtn: { width: 44, height: 44, borderRadius: radius.pill, alignItems: 'center', justifyContent: 'center' },
});
