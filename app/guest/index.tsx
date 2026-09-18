import React from 'react';
import { StyleSheet, View } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { Screen, Group, Row, Button, LiveDot } from '../../src/components';
import { Text, useTheme, space } from '../../src/theme';
import { useShelter, useLiveAlerts, useNextEvent } from '../../src/data';
import type { ShelterAlert } from '../../src/data';
import { relativeTime, formatTime, formatDayLabel } from '../../src/lib/contact';
import { QuickExit, useSession } from '../../src/safety';

const ALERT: Record<
  ShelterAlert['kind'],
  { icon: keyof typeof Ionicons.glyphMap; accent: 'tint' | 'crisis' | 'warn' | 'grey'; label: string }
> = {
  info: { icon: 'information-circle', accent: 'grey', label: 'Notice' },
  delivery: { icon: 'cube', accent: 'tint', label: 'Delivery' },
  weather: { icon: 'thunderstorm', accent: 'warn', label: 'Weather' },
  urgent: { icon: 'alert-circle', accent: 'crisis', label: 'Important' },
};

export default function GuestToday() {
  const { c } = useTheme();
  const { shift } = useShelter();
  const alerts = useLiveAlerts();
  const next = useNextEvent();
  const { session } = useSession();

  const none = shift.advocatesOnShift === 0;

  return (
    <Screen title="Today" headerRight={<QuickExit />}>
      {/* Staff status and advocate count answer the same question — "is there
          someone I can talk to right now?" — so they share one block. No names. */}
      <Group
        padded
        footer={
          shift.nextChangeover
            ? `Shift change at ${formatTime(shift.nextChangeover)}. Updated ${relativeTime(shift.updatedAt)}.`
            : `Updated ${relativeTime(shift.updatedAt)}.`
        }
      >
        <View style={styles.statusHead}>
          <LiveDot color={none ? c.warn : c.positive} />
          <Text variant="subhead" strong tone={none ? 'warn' : 'positive'}>
            {shift.officeOpen ? 'Front office open' : 'Front office closed'}
          </Text>
        </View>

        <View style={styles.countRow}>
          <Text variant="largeTitle" tabular style={{ fontSize: 44, lineHeight: 50 }}>
            {shift.advocatesOnShift}
          </Text>
          <Text variant="title3" tone="secondary" style={{ marginBottom: 7 }}>
            {shift.advocatesOnShift === 1 ? 'advocate on shift' : 'advocates on shift'}
          </Text>
        </View>

        {shift.note ? (
          <Text variant="subhead" tone="secondary" style={{ marginTop: space.sm }}>
            {shift.note}
          </Text>
        ) : null}

        <Button
          label="Message an advocate"
          size="lg"
          full
          style={{ marginTop: space.base }}
          onPress={() => router.push('/guest/advocate')}
        />
      </Group>

      {next ? (
        <View style={{ marginTop: space['2xl'] }}>
          <Group header="Next up">
            <Row
              title={next.title}
              subtitle={[formatDayLabel(next.day), formatTime(next.time), next.location]
                .filter(Boolean)
                .join(' · ')}
              onPress={() => router.push('/guest/schedule')}
            />
          </Group>
        </View>
      ) : null}

      <View style={{ marginTop: space['2xl'] }}>
        <Group
          header="House notices"
          footer="Notices go to everyone in the house. Staff cannot see who has read them."
        >
          {alerts.length === 0 ? (
            <Row title="Nothing posted right now" accessory="none" />
          ) : (
            alerts.map((a) => {
              const s = ALERT[a.kind];
              return (
                <Row
                  key={a.id}
                  icon={s.icon}
                  accent={s.accent}
                  title={a.body}
                  subtitle={`${s.label} · ${relativeTime(a.createdAt)}`}
                  accessory="none"
                />
              );
            })
          )}
        </Group>
      </View>

      {session?.label ? (
        <Text variant="footnote" tone="tertiary" center style={{ marginTop: space.xl }}>
          Signed in as {session.code} · {session.label}
        </Text>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  statusHead: { flexDirection: 'row', alignItems: 'center', gap: 7 },
  countRow: { flexDirection: 'row', alignItems: 'flex-end', gap: space.sm, marginTop: space.xs },
});
