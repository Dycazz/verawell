import React from 'react';
import { StyleSheet, View } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { Screen, Springy, Stagger, CrisisBar, CRISIS_DOCK_HEIGHT, elevation } from '../src/components';
import { Text, useTheme, radius, space, fonts } from '../src/theme';
import { useShelter } from '../src/data';
import { useAppIdentity } from '../src/safety';

export default function FrontDoor() {
  const { c } = useTheme();
  const { profile } = useShelter();
  const displayName = useAppIdentity(profile.name);

  return (
    <View style={{ flex: 1 }}>
      <Screen wash bottomInset={CRISIS_DOCK_HEIGHT}>
        <Stagger index={0} style={{ alignItems: 'flex-start', marginBottom: space['2xl'] }}>
          <Monogram />
          <Text variant="display" style={{ marginTop: space.lg }}>
            {displayName}
          </Text>
          <Text variant="callout" tone="muted" style={{ marginTop: space.sm, maxWidth: 380 }}>
            {profile.tagline}
          </Text>
        </Stagger>

        <Stagger index={1}>
          <Door
            icon="heart-outline"
            tone="clay"
            title="Support the shelter"
            body="See what we need this week, give, volunteer, or find a resource. No account needed."
            onPress={() => router.push('/public')}
          />
        </Stagger>

        <Stagger index={2} style={{ marginTop: space.base }}>
          <Door
            icon="home-outline"
            tone="primary"
            title="I'm staying here"
            body="Sign in with the code an advocate gave you. No name, no email."
            onPress={() => router.push('/guest-login')}
          />
        </Stagger>

        <Stagger index={3} style={{ marginTop: space['2xl'], alignItems: 'center' }}>
          <Springy
            onPress={() => router.push('/staff-login')}
            scaleTo={0.95}
            accessibilityRole="button"
            accessibilityLabel="Staff sign in"
            style={styles.staffLink}
          >
            <View style={styles.staffRow}>
              <Ionicons name="lock-closed-outline" size={14} color={c.inkFaint} />
              <Text variant="caption" tone="faint">
                Staff sign in
              </Text>
            </View>
          </Springy>
        </Stagger>
      </Screen>

      <CrisisBar number={profile.crisisLine} />
    </View>
  );
}

/** Typographic mark — the display face doing the branding, rather than a stock glyph. */
function Monogram() {
  const { c, isDark } = useTheme();
  return (
    <View
      style={[
        styles.mark,
        { backgroundColor: c.primary },
        elevation(2, isDark ? '#000' : '#0E4F49'),
      ]}
    >
      <Text style={{ color: c.onPrimary, fontFamily: fonts.displayBold, fontSize: 34, lineHeight: 40 }}>
        V
      </Text>
      <View style={[styles.markDot, { backgroundColor: c.clay }]} />
    </View>
  );
}

function Door({
  icon,
  tone,
  title,
  body,
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  tone: 'primary' | 'clay';
  title: string;
  body: string;
  onPress: () => void;
}) {
  const { c, isDark } = useTheme();
  const fg = tone === 'primary' ? c.primary : c.clay;
  const bg = tone === 'primary' ? c.primarySoft : c.claySoft;

  return (
    <Springy
      onPress={onPress}
      scaleTo={0.98}
      accessibilityRole="button"
      accessibilityLabel={`${title}. ${body}`}
      style={StyleSheet.flatten([
        styles.door,
        { backgroundColor: c.surface, borderColor: c.line },
        elevation(1, isDark ? '#000' : '#4A3F2E'),
      ])}
    >
      <View style={[styles.doorIcon, { backgroundColor: bg }]}>
        <Ionicons name={icon} size={24} color={fg} />
      </View>

      <View style={{ flex: 1 }}>
        <Text variant="heading">{title}</Text>
        <Text variant="callout" tone="muted" style={{ marginTop: 4 }}>
          {body}
        </Text>
      </View>

      <Ionicons name="arrow-forward" size={20} color={c.inkFaint} style={{ marginTop: 4 }} />
    </Springy>
  );
}

const styles = StyleSheet.create({
  mark: {
    width: 68,
    height: 68,
    borderRadius: radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  markDot: { position: 'absolute', right: 10, bottom: 10, width: 7, height: 7, borderRadius: 7 },
  door: {
    flexDirection: 'row',
    gap: space.base,
    alignItems: 'flex-start',
    padding: space.lg,
    borderRadius: radius.lg,
    borderWidth: StyleSheet.hairlineWidth * 2,
  },
  doorIcon: { width: 48, height: 48, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center' },
  staffLink: { paddingVertical: space.md, paddingHorizontal: space.lg },
  staffRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
});
