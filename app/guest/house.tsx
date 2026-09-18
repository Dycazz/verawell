import React, { useState } from 'react';
import { StyleSheet, Switch, View } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { Screen, Group, Row, Segmented, Springy } from '../../src/components';
import { Text, useTheme, radius, space, LAYOUT } from '../../src/theme';
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
    <Screen title="House" headerRight={<QuickExit />}>
      <Group header="Guest guidelines">
        {guidelines.map((g) => (
          <Guideline
            key={g.id}
            section={g}
            open={open === g.id}
            onToggle={() => setOpen(open === g.id ? null : g.id)}
          />
        ))}
      </Group>

      <View style={{ marginTop: space['2xl'] }}>
        <Group
          header="Privacy on this phone"
          footer="Nothing about you is saved on this phone. Signing out — by hand, by timeout, or by quick exit — leaves nothing behind."
        >
          <Row
            icon="eye-off"
            accent="grey"
            title="Discreet mode"
            subtitle={`Shows the app as “${COVER_IDENTITY.name}”.`}
            accessory="none"
            right={
              <Switch
                value={privacy.stealthMode}
                onValueChange={(v) => privacy.set('stealthMode', v)}
                trackColor={{ true: c.tint, false: c.fillStrong }}
                thumbColor="#FFFFFF"
                accessibilityLabel="Discreet mode"
              />
            }
          />
          <Row
            icon="notifications-off"
            accent="grey"
            title="Quiet notifications"
            subtitle="Alerts never name the shelter or show message content."
            accessory="none"
            right={
              <Switch
                value={privacy.quietNotifications}
                onValueChange={(v) => privacy.set('quietNotifications', v)}
                trackColor={{ true: c.tint, false: c.fillStrong }}
                thumbColor="#FFFFFF"
                accessibilityLabel="Quiet notifications"
              />
            }
          />
          <Row
            icon="phone-portrait"
            accent="grey"
            title="Lock when I switch apps"
            accessory="none"
            right={
              <Switch
                value={privacy.lockOnBackground}
                onValueChange={(v) => privacy.set('lockOnBackground', v)}
                trackColor={{ true: c.tint, false: c.fillStrong }}
                thumbColor="#FFFFFF"
                accessibilityLabel="Lock when I switch apps"
              />
            }
          />
        </Group>
      </View>

      <View style={{ marginTop: space['2xl'] }}>
        <Group padded header="Sign me out after" footer="Of no tapping or scrolling.">
          <Segmented
            options={AUTO_LOCK_CHOICES.map((m) => ({ value: String(m), label: `${m} min` }))}
            value={String(privacy.autoLockMinutes)}
            onChange={(v) => privacy.set('autoLockMinutes', Number(v))}
          />
        </Group>
      </View>

      <View style={{ marginTop: space['2xl'] }}>
        <Group header="Signed in as" footer={session?.label}>
          <Row title={session?.code ?? ''} accessory="none" />
          <Row
            title="Sign out"
            destructive
            accessory="none"
            onPress={() => {
              signOut('manual');
              router.replace('/');
            }}
          />
        </Group>
      </View>
    </Screen>
  );
}

function Guideline({
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
    <View>
      <Springy
        onPress={onToggle}
        highlight
        accessibilityRole="button"
        accessibilityState={{ expanded: open }}
        accessibilityLabel={section.title}
      >
        <View style={styles.head}>
          <View style={[styles.icon, { backgroundColor: c.iconGrey }]}>
            <Ionicons name={section.icon.replace('-outline', '') as keyof typeof Ionicons.glyphMap} size={16} color="#FFFFFF" />
          </View>
          <Text variant="body" style={{ flex: 1 }}>
            {section.title}
          </Text>
          <Ionicons name={open ? 'chevron-up' : 'chevron-down'} size={17} color={c.labelTertiary} />
        </View>
      </Springy>

      {open ? (
        <View style={styles.body}>
          {section.items.map((item, i) => (
            <View key={i} style={styles.bullet}>
              <View style={[styles.dot, { backgroundColor: c.labelTertiary }]} />
              <Text variant="subhead" style={{ flex: 1 }}>
                {item}
              </Text>
            </View>
          ))}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  head: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
    minHeight: LAYOUT.row,
    paddingHorizontal: LAYOUT.margin,
    paddingVertical: space.sm,
  },
  icon: { width: 29, height: 29, borderRadius: radius.sm, alignItems: 'center', justifyContent: 'center' },
  body: { paddingLeft: LAYOUT.margin + 29 + space.md, paddingRight: LAYOUT.margin, paddingBottom: space.base, gap: space.sm },
  bullet: { flexDirection: 'row', gap: space.sm, alignItems: 'flex-start' },
  dot: { width: 4, height: 4, borderRadius: 4, marginTop: 8 },
});
