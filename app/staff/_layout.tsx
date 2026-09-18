import React from 'react';
import { ScrollView, StyleSheet, useWindowDimensions, View } from 'react-native';
import { Redirect, Slot, router, usePathname } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Springy, Badge } from '../../src/components';
import { Text, useTheme, radius, space, fonts } from '../../src/theme';
import { useSession } from '../../src/safety';
import { useStaffInbox } from '../../src/data';

/** Above this the console gets a desk layout; below it, a phone one. */
const WIDE = 820;

const NAV = [
  { href: '/staff', label: 'Shift', icon: 'pulse-outline' as const },
  { href: '/staff/inbox', label: 'Inbox', icon: 'mail-outline' as const },
  { href: '/staff/needs', label: 'Needs', icon: 'basket-outline' as const },
  { href: '/staff/schedule', label: 'Schedule', icon: 'calendar-outline' as const },
  { href: '/staff/codes', label: 'Codes', icon: 'key-outline' as const },
];

export default function StaffLayout() {
  const { c } = useTheme();
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const pathname = usePathname();
  const { session, signOut } = useSession();
  const inbox = useStaffInbox();

  if (!session || session.role !== 'staff') {
    return <Redirect href="/staff-login" />;
  }

  const wide = width >= WIDE;
  const pending = inbox.unreadThreads + inbox.openPublic;

  const nav = NAV.map((item) => ({
    ...item,
    active: pathname === item.href || (item.href !== '/staff' && pathname.startsWith(item.href)),
    badge: item.href === '/staff/inbox' && pending > 0 ? pending : undefined,
  }));

  return (
    <View style={{ flex: 1, backgroundColor: c.bg }}>
      {/* Desk layout: one horizontal bar carrying brand, sections and sign-out.
          Advocates work this console between other tasks, so the current section
          and the inbox count stay visible at all times. */}
      {wide ? (
        <View style={[styles.topBar, { paddingTop: insets.top + space.md, backgroundColor: c.surface, borderBottomColor: c.line }]}>
          <View style={styles.topInner}>
            <View style={styles.brand}>
              <View style={[styles.mark, { backgroundColor: c.primary }]}>
                <Text style={{ color: c.onPrimary, fontFamily: fonts.displayBold, fontSize: 16 }}>V</Text>
              </View>
              <View>
                <Text variant="subhead">Staff console</Text>
                <Text variant="caption" tone="faint">
                  VeraWell House
                </Text>
              </View>
            </View>

            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.navRow}>
              {nav.map((item) => (
                <NavPill key={item.href} {...item} onPress={() => router.replace(item.href)} />
              ))}
            </ScrollView>

            <Springy
              onPress={() => {
                signOut('manual');
                router.replace('/');
              }}
              scaleTo={0.94}
              accessibilityRole="button"
              accessibilityLabel="Sign out"
              style={StyleSheet.flatten([styles.signOut, { borderColor: c.line }])}
            >
              <Ionicons name="log-out-outline" size={17} color={c.inkMuted} />
              <Text variant="label" tone="muted">
                Sign out
              </Text>
            </Springy>
          </View>
        </View>
      ) : null}

      <View style={{ flex: 1 }}>
        <Slot />
      </View>

      {!wide ? (
        <View
          style={[
            styles.bottomBar,
            { paddingBottom: insets.bottom || space.sm, backgroundColor: c.surface, borderTopColor: c.line },
          ]}
        >
          {nav.map((item) => (
            <Springy
              key={item.href}
              onPress={() => router.replace(item.href)}
              scaleTo={0.9}
              haptic="none"
              accessibilityRole="button"
              accessibilityState={{ selected: item.active }}
              accessibilityLabel={item.label}
              style={styles.bottomItem}
            >
              <View>
                <Ionicons
                  name={item.icon}
                  size={22}
                  color={item.active ? c.primary : c.inkFaint}
                />
                {item.badge ? <View style={[styles.dot, { backgroundColor: c.clay, borderColor: c.surface }]} /> : null}
              </View>
              <Text
                variant="caption"
                style={{ fontSize: 11, marginTop: 2, color: item.active ? c.primary : c.inkFaint }}
              >
                {item.label}
              </Text>
            </Springy>
          ))}
        </View>
      ) : null}
    </View>
  );
}

function NavPill({
  label,
  icon,
  active,
  badge,
  onPress,
}: {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  active: boolean;
  badge?: number;
  onPress: () => void;
}) {
  const { c } = useTheme();
  return (
    <Springy
      onPress={onPress}
      scaleTo={0.95}
      haptic="none"
      accessibilityRole="button"
      accessibilityState={{ selected: active }}
      accessibilityLabel={label}
      style={StyleSheet.flatten([
        styles.pill,
        { backgroundColor: active ? c.primarySoft : 'transparent' },
      ])}
    >
      <Ionicons name={icon} size={17} color={active ? c.primary : c.inkMuted} />
      <Text variant="label" style={{ color: active ? c.primary : c.inkMuted }}>
        {label}
      </Text>
      {badge ? <Badge label={String(badge)} tone="clay" /> : null}
    </Springy>
  );
}

const styles = StyleSheet.create({
  topBar: { paddingHorizontal: space.lg, paddingBottom: space.md, borderBottomWidth: StyleSheet.hairlineWidth * 2 },
  topInner: {
    width: '100%',
    maxWidth: 1180,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.xl,
  },
  brand: { flexDirection: 'row', alignItems: 'center', gap: space.md },
  mark: { width: 34, height: 34, borderRadius: radius.sm, alignItems: 'center', justifyContent: 'center' },
  navRow: { flexDirection: 'row', gap: space.xs, alignItems: 'center' },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    paddingHorizontal: space.base,
    height: 40,
    borderRadius: radius.pill,
  },
  signOut: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: space.base,
    height: 38,
    borderRadius: radius.pill,
    borderWidth: 1,
  },
  bottomBar: {
    flexDirection: 'row',
    paddingTop: space.sm,
    borderTopWidth: StyleSheet.hairlineWidth * 2,
  },
  bottomItem: { flex: 1, alignItems: 'center', paddingVertical: 4 },
  dot: { position: 'absolute', top: -2, right: -4, width: 10, height: 10, borderRadius: 10, borderWidth: 2 },
});
