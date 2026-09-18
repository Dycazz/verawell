import React from 'react';
import { StyleSheet, View } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { Screen, Group, Row, Springy, CrisisBar, CRISIS_DOCK_HEIGHT } from '../src/components';
import { Text, useTheme, radius, space } from '../src/theme';
import { useShelter } from '../src/data';
import { useAppIdentity } from '../src/safety';

export default function FrontDoor() {
  const { c } = useTheme();
  const { profile } = useShelter();
  const displayName = useAppIdentity(profile.name);

  return (
    <View style={{ flex: 1, backgroundColor: c.bg }}>
      <Screen bottomInset={CRISIS_DOCK_HEIGHT + space.lg}>
        <View style={styles.masthead}>
          <View style={[styles.mark, { backgroundColor: c.tint }]}>
            <Ionicons name="home" size={26} color={c.onTint} />
          </View>
          <Text variant="title1" style={{ marginTop: space.base }}>
            {displayName}
          </Text>
          <Text variant="subhead" tone="secondary" style={{ marginTop: 4 }}>
            {profile.tagline}
          </Text>
        </View>

        <Group>
          <Row
            icon="heart"
            accent="crisis"
            title="Support the shelter"
            subtitle="Current needs, giving, and resources. No account."
            onPress={() => router.push('/public')}
          />
          <Row
            icon="home"
            accent="tint"
            title="I'm staying here"
            subtitle="Sign in with the code from your advocate."
            onPress={() => router.push('/guest-login')}
          />
        </Group>

        <View style={{ alignItems: 'center', marginTop: space['2xl'] }}>
          <Springy
            onPress={() => router.push('/staff-login')}
            scaleTo={1}
            accessibilityRole="button"
            accessibilityLabel="Staff sign in"
            style={{ padding: space.md }}
          >
            <Text variant="subhead" style={{ color: c.tint }}>
              Staff sign in
            </Text>
          </Springy>
        </View>
      </Screen>

      <View style={styles.dock}>
        <CrisisBar number={profile.crisisLine} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  masthead: { alignItems: 'center', paddingTop: space['3xl'], paddingBottom: space['2xl'] },
  mark: { width: 60, height: 60, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  dock: { position: 'absolute', left: 0, right: 0, bottom: 0 },
});
