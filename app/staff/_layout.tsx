import React from 'react';
import { ScrollView, StyleSheet, useWindowDimensions, View } from 'react-native';
import { Redirect, Slot, router, usePathname } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Springy, Badge } from '../../src/components';
import { Text, useTheme, radius, space } from '../../src/theme';
import { useSession } from '../../src/safety';
import { useStaffInbox, useStaffCounts } from '../../src/data';

/** Above this the console gets a desk layout; below it, a phone one. */
const WIDE = 820;

type Icon = keyof typeof Ionicons.glyphMap;
interface NavItem {
  href: string;
  label: string;
  icon: Icon;
  iconOff: Icon;
  /** On a phone only the primary items get a tab; the rest live under More. */
  primary?: boolean;
}

const NAV: NavItem[] = [
  { href: '/staff', label: 'Shift', icon: 'pulse', iconOff: 'pulse-outline', primary: true },
  { href: '/staff/inbox', label: 'Inbox', icon: 'mail', iconOff: 'mail-outline', primary: true },
  { href: '/staff/requests', label: 'Requests', icon: 'people', iconOff: 'people-outline' },
  { href: '/staff/referrals', label: 'Referrals', icon: 'swap-horizontal', iconOff: 'swap-horizontal-outline' },
  { href: '/staff/needs', label: 'Needs', icon: 'basket', iconOff: 'basket-outline', primary: true },
  { href: '/staff/wishlist', label: 'Wishlist', icon: 'cart', iconOff: 'cart-outline' },
  { href: '/staff/schedule', label: 'Schedule', icon: 'calendar', iconOff: 'calendar-outline', primary: true },
  { href: '/staff/content', label: 'Content', icon: 'newspaper', iconOff: 'newspaper-outline' },
  { href: '/staff/chores', label: 'Chores', icon: 'checkbox', iconOff: 'checkbox-outline' },
  { href: '/staff/feedback', label: 'Feedback', icon: 'megaphone', iconOff: 'megaphone-outline' },
  { href: '/staff/codes', label: 'Codes', icon: 'key', iconOff: 'key-outline' },
];

const MORE: NavItem = { href: '/staff/more', label: 'More', icon: 'ellipsis-horizontal-circle', iconOff: 'ellipsis-horizontal-circle-outline' };

export default function StaffLayout() {
  const { c } = useTheme();
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const pathname = usePathname();
  const { session, signOut } = useSession();
  const inbox = useStaffInbox();
  const counts = useStaffCounts();

  if (!session || session.role !== 'staff') return <Redirect href="/staff-login" />;

  const wide = width >= WIDE;
  const pending = inbox.unreadThreads + inbox.openPublic;

  const badgeFor = (href: string) =>
    ({
      '/staff/inbox': pending,
      '/staff/requests': counts.requests,
      '/staff/referrals': counts.referrals,
      '/staff/feedback': counts.feedback,
      '/staff/wishlist': counts.wishlist,
    })[href];

  const isActive = (href: string) =>
    pathname === href || (href !== '/staff' && pathname.startsWith(href));

  const withState = (item: NavItem) => ({
    ...item,
    active: isActive(item.href),
    badge: badgeFor(item.href) || undefined,
  });

  // Desk layout shows everything; phone shows the primaries plus a More tab that
  // is lit whenever the current page is one of the secondaries.
  const nav = NAV.map(withState);
  const secondary = NAV.filter((n) => !n.primary);
  const phoneNav = [
    ...NAV.filter((n) => n.primary).map(withState),
    {
      ...MORE,
      active: pathname.startsWith('/staff/more') || secondary.some((n) => isActive(n.href)),
      badge: secondary.reduce((n, i) => n + (badgeFor(i.href) ?? 0), 0) || undefined,
    },
  ];

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
                  onPress={() => router.replace(item.href as never)}
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
          {phoneNav.map((item) => (
            <Springy
              key={item.href}
              onPress={() => router.replace(item.href as never)}
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
