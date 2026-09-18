import React, { useRef } from 'react';
import { Animated, Platform, StyleSheet, View, type ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Springy } from './Pressable';
import { Text, useTheme, LAYOUT, space } from '../theme';

export const CONTENT_MAX = 700;
const NAV_HEIGHT = 44;

/**
 * Screen chassis with a collapsing large title.
 *
 * The large title sits in the scroll content and scrolls away; a compact title
 * and a hairline fade into the bar as it goes. This is the standard iOS
 * navigation behaviour, and getting it right is most of why a screen reads as
 * native rather than as a web page in a phone frame.
 */
export function Screen({
  children,
  title,
  subtitle,
  back,
  backLabel = 'Back',
  headerRight,
  scroll = true,
  bottomInset = 0,
  contentStyle,
  maxWidth = CONTENT_MAX,
  topInset = true,
}: {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  back?: boolean;
  backLabel?: string;
  headerRight?: React.ReactNode;
  scroll?: boolean;
  bottomInset?: number;
  contentStyle?: ViewStyle;
  maxWidth?: number;
  topInset?: boolean;
}) {
  const { c } = useTheme();
  const insets = useSafeAreaInsets();
  const y = useRef(new Animated.Value(0)).current;

  const top = topInset ? insets.top : 0;

  // Hand over from large title to compact title across the distance the large
  // title actually travels.
  const collapsed = y.interpolate({
    inputRange: [16, 44],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  const showBar = !!(back || headerRight || title);

  const inner = (
    <View style={[{ width: '100%', maxWidth, alignSelf: 'center' }, contentStyle]}>
      {title ? (
        <View style={styles.titleBlock}>
          <Text variant="largeTitle">{title}</Text>
          {subtitle ? (
            <Text variant="subhead" tone="secondary" style={{ marginTop: 4, maxWidth: 520 }}>
              {subtitle}
            </Text>
          ) : null}
        </View>
      ) : null}
      {children}
    </View>
  );

  const padding = {
    paddingTop: (showBar ? top + NAV_HEIGHT : top) + space.sm,
    paddingHorizontal: LAYOUT.margin,
    paddingBottom: insets.bottom + space['2xl'] + bottomInset,
  };

  return (
    <View style={{ flex: 1, backgroundColor: c.bg }}>
      {scroll ? (
        <Animated.ScrollView
          contentContainerStyle={padding}
          keyboardShouldPersistTaps="handled"
          scrollEventThrottle={16}
          showsVerticalScrollIndicator={Platform.OS === 'web'}
          onScroll={Animated.event([{ nativeEvent: { contentOffset: { y } } }], { useNativeDriver: true })}
        >
          {inner}
        </Animated.ScrollView>
      ) : (
        <View style={[{ flex: 1 }, padding]}>{inner}</View>
      )}

      {showBar ? (
        <View style={[styles.bar, { paddingTop: top, height: top + NAV_HEIGHT }]} pointerEvents="box-none">
          <Animated.View
            style={[
              StyleSheet.absoluteFill,
              { backgroundColor: c.chrome, opacity: collapsed },
            ]}
            pointerEvents="none"
          />
          <Animated.View
            style={[styles.hairline, { backgroundColor: c.separator, opacity: collapsed }]}
            pointerEvents="none"
          />

          <View style={styles.barRow}>
            <View style={styles.barSide}>
              {back ? (
                <Springy
                  onPress={() => (router.canGoBack() ? router.back() : router.replace('/'))}
                  scaleTo={1}
                  accessibilityRole="button"
                  accessibilityLabel={backLabel}
                  style={styles.backBtn}
                >
                  <Ionicons name="chevron-back" size={26} color={c.tint} style={{ marginLeft: -6 }} />
                  <Text variant="body" style={{ color: c.tint }}>
                    {backLabel}
                  </Text>
                </Springy>
              ) : null}
            </View>

            {title ? (
              <Animated.View style={[styles.barTitle, { opacity: collapsed }]} pointerEvents="none">
                <Text variant="headline" numberOfLines={1}>
                  {title}
                </Text>
              </Animated.View>
            ) : null}

            <View style={[styles.barSide, { alignItems: 'flex-end' }]}>{headerRight}</View>
          </View>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  titleBlock: { marginBottom: space.lg, paddingHorizontal: space.xs },
  bar: { position: 'absolute', top: 0, left: 0, right: 0 },
  hairline: { position: 'absolute', left: 0, right: 0, bottom: 0, height: StyleSheet.hairlineWidth },
  barRow: {
    height: NAV_HEIGHT,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: space.sm,
  },
  barSide: { flex: 1, justifyContent: 'center' },
  backBtn: { flexDirection: 'row', alignItems: 'center', height: NAV_HEIGHT, paddingRight: space.sm },
  barTitle: { flex: 2, alignItems: 'center' },
});
