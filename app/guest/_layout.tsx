import React from 'react';
import { StyleSheet } from 'react-native';
import { Redirect, Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTheme } from '../../src/theme';
import { useSession } from '../../src/safety';
import { useThreadsForCode } from '../../src/data';

export default function GuestLayout() {
  const { c } = useTheme();
  const insets = useSafeAreaInsets();
  const { session } = useSession();
  const threads = useThreadsForCode(session?.role === 'guest' ? session.code : null);

  // The guard lives here so an expired session drops the whole tab group at
  // once, including any screen already mounted behind it.
  if (!session || session.role !== 'guest') {
    return <Redirect href="/guest-login" />;
  }

  const unread = threads.reduce((n, t) => n + t.unreadForGuest, 0);

  const tab = (name: string, title: string, on: keyof typeof Ionicons.glyphMap, off: keyof typeof Ionicons.glyphMap, badge?: number) => (
    <Tabs.Screen
      name={name}
      options={{
        title,
        tabBarBadge: badge,
        tabBarIcon: ({ color, focused }) => <Ionicons name={focused ? on : off} size={25} color={color} />,
      }}
    />
  );

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: c.tint,
        tabBarInactiveTintColor: c.labelSecondary,
        tabBarStyle: {
          height: 52 + insets.bottom,
          paddingBottom: insets.bottom,
          paddingTop: 2,
          backgroundColor: c.chrome,
          borderTopColor: c.separator,
          borderTopWidth: StyleSheet.hairlineWidth,
        },
        tabBarLabelStyle: { fontSize: 10, marginTop: 0, marginBottom: 2 },
        tabBarBadgeStyle: { backgroundColor: c.crisis, fontSize: 11 },
      }}
    >
      {tab('index', 'Today', 'today', 'today-outline')}
      {tab('safety', 'Safety', 'shield-checkmark', 'shield-outline')}
      {tab('schedule', 'Schedule', 'calendar', 'calendar-outline')}
      {tab('advocate', 'Advocate', 'chatbubble', 'chatbubble-outline', unread > 0 ? unread : undefined)}
      {tab('house', 'House', 'book', 'book-outline')}
    </Tabs>
  );
}
