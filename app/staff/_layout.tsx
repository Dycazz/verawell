import React from 'react';
import { ScrollView, StyleSheet, useWindowDimensions, View } from 'react-native';
import { Redirect, Slot, router, usePathname } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Springy, Badge } from '../../src/components';
import { Text, useTheme, radius, space } from '../../src/theme';
import { useSession } from '../../src/safety';
import { useStaffInbox } from '../../src/data';

/** Above this the console gets a desk layout; below it, a phone one. */
const WIDE = 820;

const NAV = [
  { href: '/staff', label: 'Shift', icon: 'pulse' as const, iconOff: 'pulse-outline' as const },
  { href: '/staff/inbox', label: 'Inbox', icon: 'mail' as const, iconOff: 'mail-outline' as const },
  { href: '/staff/needs', label: 'Needs', icon: 'basket' as const, iconOff: 'basket-outline' as const },
  { href: '/staff/schedule', label: 'Schedule', icon: 'calendar' as const, iconOff: 'calendar-outline' as const },
  { href: '/staff/codes', label: 'Codes', icon: 'key' as const, iconOff: 'key-outline' as const },
];

export default function StaffLayout() {
  const { c } = useTheme();
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const pathname = usePathname();
  const { session, signOut } = useSession();
  const inbox = useStaffInbox();

  if (!session || session.role !== 'staff') return <Redirect href="/staff-login" />;

  const wide = width >= WIDE;
  const pending = inbox.unreadThreads + inbox.openPublic;

  const nav = NAV.map((item) => ({
    ...item,
    active: pathname === item.href || (item.href !== '/staff' && pathname.startsWith(item.href)),
    badge: item.href === '/staff/inbox' && pending > 0 ? pending : undefined,
  }));

  return (
    <View style={{ flex: 1, backgroundColor: c.bg }}>
      {wide ? (
        <View
          style={[
            styles.topBar,
            { paddingTop: insets.top + space.sm, backgroundColor: c.chrome, borderBottomColor: c.separator },
          ]}
        >
          <View style={styles.topInner}>
            <View style={styles.brand}>
              <View style={[styles.mark, { backgroundColor: c.tint }]}>
                <Ionicons name="home" size={15} color={c.onTint} />
              </View>
              <Text variant="headline">VeraWell</Text>
              <Text variant="subhead" tone="tertiary">
                Staff console
              </Text>
            </View>

            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.navRow}>
              {nav.map((item) => (
                <Springy
                  key={item.href}
                  onPress={() => router.replace(item.href)}
                  scaleTo={1}
                  accessibilityRole="button"
                  accessibilityState={{ selected: item.active }}
                  accessibilityLabel={item.label}
                  style={StyleSheet.flatten([
                    styles.pill,
                    item.active && { backgroundColor: c.fill },
                  ])}
                >
                  <Ionicons
                    name={item.active ? item.icon : item.iconOff}
                    size={16}
                    color={item.active ? c.label : c.labelSecondary}
                  />
                  <Text variant="subhead" strong={item.active} tone={item.active ? 'default' : 'secondary'}>
                    {item.label}
                  </Text>
                  {item.badge ? <Badge label={String(item.badge)} tone="crisis" /> : null}
                </Springy>
              ))}
            </ScrollView>

            <Springy
              onPress={() => {
                signOut('manual');
                router.replace('/');
              }}
              scaleTo={1}
              accessibilityRole="button"
              accessibilityLabel="Sign out"
              style={{ padding: space.sm }}
            >
              <Text variant="subhead" style={{ color: c.tint }}>
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
            { paddingBottom: insets.bottom || space.sm, backgroundColor: c.chrome, borderTopColor: c.separator },
          ]}
        >
          {nav.map((item) => (
            <Springy
              key={item.href}
              onPress={() => router.replace(item.href)}
              scaleTo={1}
              accessibilityRole="button"
              accessibilityState={{ selected: item.active }}
              accessibilityLabel={item.label}
              style={styles.bottomItem}
            >
              <View>
                <Ionicons
                  name={item.active ? item.icon : item.iconOff}
                  size={25}
                  color={item.active ? c.tint : c.labelSecondary}
                />
                {item.badge ? (
                  <View style={[styles.dot, { backgroundColor: c.crisis, borderColor: c.chrome }]} />
                ) : null}
              </View>
              <Text
                variant="caption2"
                style={{ marginTop: 1, color: item.active ? c.tint : c.labelSecondary }}
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

const styles = StyleSheet.create({
  topBar: { paddingHorizontal: space.lg, paddingBottom: space.sm, borderBottomWidth: StyleSheet.hairlineWidth },
  topInner: {
    width: '100%',
    maxWidth: 1120,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.lg,
  },
  brand: { flexDirection: 'row', alignItems: 'center', gap: space.sm },
  mark: { width: 24, height: 24, borderRadius: radius.sm, alignItems: 'center', justifyContent: 'center' },
  navRow: { flexDirection: 'row', gap: 2, alignItems: 'center' },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: space.md,
    height: 32,
    borderRadius: radius.sm,
  },
  bottomBar: { flexDirection: 'row', paddingTop: space.xs, borderTopWidth: StyleSheet.hairlineWidth },
  bottomItem: { flex: 1, alignItems: 'center', paddingVertical: 2 },
  dot: { position: 'absolute', top: -1, right: -3, width: 9, height: 9, borderRadius: 9, borderWidth: 1.5 },
});
