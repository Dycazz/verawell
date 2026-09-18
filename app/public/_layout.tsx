import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { CrisisBar } from '../../src/components';
import { useTheme, fonts } from '../../src/theme';
import { useShelter } from '../../src/data';

/** Fixed so the crisis dock can be positioned above it without measuring. */
const TAB_BAR_HEIGHT = 60;

export default function PublicLayout() {
  const { c } = useTheme();
  const insets = useSafeAreaInsets();
  const { profile } = useShelter();

  return (
    <View style={{ flex: 1, backgroundColor: c.bg }}>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: c.primary,
          tabBarInactiveTintColor: c.inkFaint,
          tabBarStyle: {
            height: TAB_BAR_HEIGHT + insets.bottom,
            paddingBottom: insets.bottom,
            paddingTop: 6,
            backgroundColor: c.surface,
            borderTopColor: c.line,
            borderTopWidth: StyleSheet.hairlineWidth * 2,
          },
          tabBarLabelStyle: { fontFamily: fonts.bodyMedium, fontSize: 11, marginTop: 2 },
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: 'Help',
            tabBarIcon: ({ color, size }) => <Ionicons name="heart-outline" size={size} color={color} />,
          }}
        />
        <Tabs.Screen
          name="needs"
          options={{
            title: 'Needs',
            tabBarIcon: ({ color, size }) => <Ionicons name="basket-outline" size={size} color={color} />,
          }}
        />
        <Tabs.Screen
          name="resources"
          options={{
            title: 'Resources',
            tabBarIcon: ({ color, size }) => <Ionicons name="compass-outline" size={size} color={color} />,
          }}
        />
        <Tabs.Screen
          name="contact"
          options={{
            title: 'Contact',
            tabBarIcon: ({ color, size }) => <Ionicons name="chatbubble-outline" size={size} color={color} />,
          }}
        />
      </Tabs>

      {/* "Always on screen" from the spec, taken literally: the dock is part of the
          navigator, so it survives every tab change and never scrolls away. */}
      <View
        style={[styles.dock, { bottom: TAB_BAR_HEIGHT + insets.bottom }]}
        pointerEvents="box-none"
      >
        <CrisisBar number={profile.crisisLine} safeArea={false} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  dock: { position: 'absolute', left: 0, right: 0, height: 92 },
});
