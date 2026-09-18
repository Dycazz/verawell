import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { CrisisBar } from '../../src/components';
import { useTheme } from '../../src/theme';
import { useShelter } from '../../src/data';

const TAB_BAR_HEIGHT = 52;
const DOCK_HEIGHT = 60;

export default function PublicLayout() {
  const { c } = useTheme();
  const insets = useSafeAreaInsets();
  const { profile } = useShelter();

  return (
    <View style={{ flex: 1, backgroundColor: c.bg }}>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: c.tint,
          tabBarInactiveTintColor: c.labelSecondary,
          tabBarStyle: {
            height: TAB_BAR_HEIGHT + insets.bottom,
            paddingBottom: insets.bottom,
            paddingTop: 2,
            backgroundColor: c.chrome,
            borderTopColor: c.separator,
            borderTopWidth: StyleSheet.hairlineWidth,
          },
          tabBarLabelStyle: { fontSize: 10, marginTop: 0, marginBottom: 2 },
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: 'Help',
            tabBarIcon: ({ color, focused }) => (
              <Ionicons name={focused ? 'heart' : 'heart-outline'} size={25} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="needs"
          options={{
            title: 'Needs',
            tabBarIcon: ({ color, focused }) => (
              <Ionicons name={focused ? 'basket' : 'basket-outline'} size={25} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="resources"
          options={{
            title: 'Resources',
            tabBarIcon: ({ color, focused }) => (
              <Ionicons name={focused ? 'compass' : 'compass-outline'} size={25} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="contact"
          options={{
            title: 'Contact',
            tabBarIcon: ({ color, focused }) => (
              <Ionicons name={focused ? 'chatbubble' : 'chatbubble-outline'} size={25} color={color} />
            ),
          }}
        />
      </Tabs>

      {/* "Always on screen" taken literally: the dock belongs to the navigator,
          so it survives every tab change and never scrolls away. */}
      <View
        style={[styles.dock, { bottom: TAB_BAR_HEIGHT + insets.bottom, height: DOCK_HEIGHT }]}
        pointerEvents="box-none"
      >
        <CrisisBar number={profile.crisisLine} safeArea={false} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  dock: { position: 'absolute', left: 0, right: 0, justifyContent: 'flex-end' },
});
