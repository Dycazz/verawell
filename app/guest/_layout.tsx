import React from 'react';
import { StyleSheet } from 'react-native';
import { Redirect, Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTheme, fonts } from '../../src/theme';
import { useSession } from '../../src/safety';
import { useThreadsForCode } from '../../src/data';

export default function GuestLayout() {
  const { c } = useTheme();
  const insets = useSafeAreaInsets();
  const { session } = useSession();
  const threads = useThreadsForCode(session?.role === 'guest' ? session.code : null);

  // The guard lives here rather than in each screen, so an expired session drops
  // the whole tab group at once — including any screen already mounted behind it.
  if (!session || session.role !== 'guest') {
    return <Redirect href="/guest-login" />;
  }

  const unread = threads.reduce((n, t) => n + t.unreadForGuest, 0);

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: c.primary,
        tabBarInactiveTintColor: c.inkFaint,
        tabBarStyle: {
          height: 60 + insets.bottom,
          paddingBottom: insets.bottom,
          paddingTop: 6,
          backgroundColor: c.surface,
          borderTopColor: c.line,
          borderTopWidth: StyleSheet.hairlineWidth * 2,
        },
        tabBarLabelStyle: { fontFamily: fonts.bodyMedium, fontSize: 11, marginTop: 2 },
        tabBarBadgeStyle: { backgroundColor: c.clay, color: c.onClay, fontFamily: fonts.bodySemi, fontSize: 11 },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Today',
          tabBarIcon: ({ color, size }) => <Ionicons name="sunny-outline" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="safety"
        options={{
          title: 'Safety',
          tabBarIcon: ({ color, size }) => <Ionicons name="shield-outline" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="schedule"
        options={{
          title: 'Schedule',
          tabBarIcon: ({ color, size }) => <Ionicons name="calendar-outline" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="advocate"
        options={{
          title: 'Advocate',
          tabBarBadge: unread > 0 ? unread : undefined,
          tabBarIcon: ({ color, size }) => <Ionicons name="chatbubbles-outline" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="house"
        options={{
          title: 'House',
          tabBarIcon: ({ color, size }) => <Ionicons name="book-outline" size={size} color={color} />,
        }}
      />
    </Tabs>
  );
}
