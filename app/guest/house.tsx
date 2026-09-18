import React, { useState } from 'react';
import { StyleSheet, Switch, View } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { Screen, Card, Button, Stagger, Springy, SectionHeader } from '../../src/components';
import { Text, useTheme, radius, space } from '../../src/theme';
import { useShelter } from '../../src/data';
import type { GuidelineSection } from '../../src/data';
import { QuickExit, useSession, usePrivacy, AUTO_LOCK_CHOICES, COVER_IDENTITY } from '../../src/safety';

export default function House() {
  const { c } = useTheme();
  const { guidelines } = useShelter();
  const { session, signOut } = useSession();
  const privacy = usePrivacy();

  const [open, setOpen] = useState<string | null>(guidelines[0]?.id ?? null);

  return (
    <Screen
      eyebrow="House"
      title="Guidelines & settings"
      subtitle="The house rules, and the controls that decide how much this app shows."
      headerRight={<QuickExit />}
    >
      <Stagger index={1}>
        <SectionHeader title="Guest guidelines" />
        <View style={{ gap: space.md }}>
          {guidelines.map((g) => (
            <GuidelineCard
              key={g.id}
              section={g}
              open={open === g.id}
              onToggle={() => setOpen(open === g.id ? null : g.id)}
            />
          ))}
        </View>
      </Stagger>

      <Stagger index={2} style={{ marginTop: space['2xl'] }}>
        <SectionHeader title="Privacy on this phone" />
        <Card padded={false}>
          <Toggle
            icon="eye-off-outline"
            title="Discreet mode"
            body={`Shows the app as “${COVER_IDENTITY.name}” instead of the shelter's name.`}
            value={privacy.stealthMode}
            onChange={(v) => privacy.set('stealthMode', v)}
          />
          <Toggle
            icon="notifications-off-outline"
            title="Quiet notifications"
            body="Lock-screen alerts never name the shelter or show what a message says."
            value={privacy.quietNotifications}
            onChange={(v) => privacy.set('quietNotifications', v)}
          />
          <Toggle
            icon="phone-portrait-outline"
            title="Lock when I switch apps"
            body="Signs you out if the app sits in the background."
            value={privacy.lockOnBackground}
            onChange={(v) => privacy.set('lockOnBackground', v)}
            last
          />
        </Card>

        <Card style={{ marginTop: space.md }}>
          <View style={styles.row}>
            <View style={[styles.icon, { backgroundColor: c.primarySoft }]}>
              <Ionicons name="time-outline" size={19} color={c.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text variant="bodyStrong">Sign me out after</Text>
              <Text variant="caption" tone="muted" style={{ marginTop: 1 }}>
                Of no tapping or scrolling.
              </Text>
            </View>
          </View>

          <View style={styles.chips}>
            {AUTO_LOCK_CHOICES.map((m) => {
              const active = privacy.autoLockMinutes === m;
              return (
                <Springy
                  key={m}
                  onPress={() => privacy.set('autoLockMinutes', m)}
                  scaleTo={0.93}
                  accessibilityRole="button"
                  accessibilityState={{ selected: active }}
                  accessibilityLabel={`${m} minutes`}
                  style={StyleSheet.flatten([
                    styles.chip,
                    { backgroundColor: active ? c.primary : c.surfaceAlt, borderColor: active ? c.primary : c.line },
                  ])}
                >
                  <Text variant="label" style={{ color: active ? c.onPrimary : c.inkMuted }}>
                    {m} min
                  </Text>
                </Springy>
              );
            })}
          </View>
        </Card>

        <Text variant="caption" tone="faint" style={{ marginTop: space.md }}>
          Nothing about you is saved on this phone. Signing out — by hand, by timeout, or by
          quick exit — leaves nothing behind.
        </Text>
      </Stagger>

      <Stagger index={3} style={{ marginTop: space['2xl'] }}>
        <Card tone="alt" flat>
          <Text variant="label" caps tone="faint">
            Signed in as
          </Text>
          <Text variant="heading" style={{ marginTop: 4 }}>
            {session?.code}
          </Text>
          {session?.label ? (
            <Text variant="caption" tone="muted" style={{ marginTop: 2 }}>
              {session.label}
            </Text>
          ) : null}
          <Button
            label="Sign out"
            variant="secondary"
            icon="log-out-outline"
            style={{ marginTop: space.lg }}
            onPress={() => {
              signOut('manual');
              router.replace('/');
            }}
          />
        </Card>
      </Stagger>
    </Screen>
  );
}

function GuidelineCard({
  section,
  open,
  onToggle,
}: {
  section: GuidelineSection;
  open: boolean;
  onToggle: () => void;
}) {
  const { c } = useTheme();

  return (
    <Card padded={false}>
      <Springy
        onPress={onToggle}
        scaleTo={0.99}
        accessibilityRole="button"
        accessibilityState={{ expanded: open }}
        accessibilityLabel={section.title}
        style={{ padding: space.base }}
      >
        <View style={styles.row}>
          <View style={[styles.icon, { backgroundColor: c.surfaceAlt }]}>
            <Ionicons name={section.icon as keyof typeof Ionicons.glyphMap} size={19} color={c.inkMuted} />
          </View>
          <Text variant="subhead" style={{ flex: 1 }}>
            {section.title}
          </Text>
          <Ionicons name={open ? 'chevron-up' : 'chevron-down'} size={18} color={c.inkFaint} />
        </View>
      </Springy>

      {open ? (
        <Stagger index={0} distance={6} style={{ paddingHorizontal: space.base, paddingBottom: space.base }}>
          <View style={[styles.rule, { backgroundColor: c.line }]} />
          <View style={{ gap: space.md }}>
            {section.items.map((item, i) => (
              <View key={i} style={styles.bulletRow}>
                <View style={[styles.bullet, { backgroundColor: c.primary }]} />
                <Text variant="callout" style={{ flex: 1 }}>
                  {item}
                </Text>
              </View>
            ))}
          </View>
        </Stagger>
      ) : null}
    </Card>
  );
}

function Toggle({
  icon,
  title,
  body,
  value,
  onChange,
  last,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  body: string;
  value: boolean;
  onChange: (v: boolean) => void;
  last?: boolean;
}) {
  const { c } = useTheme();
  return (
    <View
      style={[
        styles.toggleRow,
        !last && { borderBottomWidth: StyleSheet.hairlineWidth * 2, borderBottomColor: c.line },
      ]}
    >
      <View style={[styles.icon, { backgroundColor: c.primarySoft }]}>
        <Ionicons name={icon} size={19} color={c.primary} />
      </View>
      <View style={{ flex: 1 }}>
        <Text variant="bodyStrong">{title}</Text>
        <Text variant="caption" tone="muted" style={{ marginTop: 1 }}>
          {body}
        </Text>
      </View>
      <Switch
        value={value}
        onValueChange={onChange}
        trackColor={{ true: c.primary, false: c.lineStrong }}
        thumbColor={c.surface}
        accessibilityLabel={title}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: space.md },
  toggleRow: { flexDirection: 'row', alignItems: 'center', gap: space.md, padding: space.base },
  icon: { width: 38, height: 38, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center' },
  rule: { height: StyleSheet.hairlineWidth * 2, marginBottom: space.base },
  bulletRow: { flexDirection: 'row', gap: space.md, alignItems: 'flex-start' },
  bullet: { width: 5, height: 5, borderRadius: 5, marginTop: 9 },
  chips: { flexDirection: 'row', gap: space.sm, marginTop: space.base, flexWrap: 'wrap' },
  chip: {
    paddingHorizontal: space.base,
    height: 38,
    borderRadius: radius.pill,
    borderWidth: 1.5,
    justifyContent: 'center',
  },
});
