import React from 'react';
import { View } from 'react-native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useFonts } from 'expo-font';
import { Fraunces_600SemiBold, Fraunces_700Bold } from '@expo-google-fonts/fraunces';
import {
  IBMPlexSans_400Regular,
  IBMPlexSans_500Medium,
  IBMPlexSans_600SemiBold,
} from '@expo-google-fonts/ibm-plex-sans';

import { ThemeProvider, useTheme, palettes } from '../src/theme';
import { ShelterProvider } from '../src/data';
import { PrivacyProvider, SessionProvider, ActivityBoundary } from '../src/safety';

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Fraunces_600SemiBold,
    Fraunces_700Bold,
    IBMPlexSans_400Regular,
    IBMPlexSans_500Medium,
    IBMPlexSans_600SemiBold,
  });

  return (
    <SafeAreaProvider>
      <ThemeProvider>
        {/* Privacy settings gate the session, so they have to resolve first. */}
        <PrivacyProvider>
          <SessionProvider>
            <ShelterProvider>
              <Chrome ready={fontsLoaded} />
            </ShelterProvider>
          </SessionProvider>
        </PrivacyProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}

function Chrome({ ready }: { ready: boolean }) {
  const { c, isDark } = useTheme();

  if (!ready) {
    // Held on a plain background rather than a spinner: a flash of unstyled type
    // is more jarring than a beat of stillness.
    return <View style={{ flex: 1, backgroundColor: palettes[isDark ? 'dark' : 'light'].bg }} />;
  }

  return (
    <ActivityBoundary>
      <StatusBar style={isDark ? 'light' : 'dark'} />
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
