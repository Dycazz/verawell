import React from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { ThemeProvider, useTheme } from '../src/theme';
import { ShelterProvider } from '../src/data';
import { PrivacyProvider, SessionProvider, ActivityBoundary } from '../src/safety';

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        {/* Privacy settings gate the session, so they resolve first. */}
        <PrivacyProvider>
          <SessionProvider>
            <ShelterProvider>
              <Chrome />
            </ShelterProvider>
          </SessionProvider>
        </PrivacyProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}

function Chrome() {
  const { c, isDark } = useTheme();

  return (
    <ActivityBoundary>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      {/* No font loading gate: the app uses the platform typeface, so there is
          nothing to wait for and nothing to flash. */}
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: c.bg },
          animation: 'slide_from_right',
        }}
      >
        <Stack.Screen name="index" options={{ animation: 'fade' }} />
        <Stack.Screen name="cover" options={{ animation: 'fade' }} />
      </Stack>
    </ActivityBoundary>
  );
}
