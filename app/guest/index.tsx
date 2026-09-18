import React from 'react';
import { StyleSheet, View } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { Screen, Card, Button, Badge, LiveDot, Stagger, SectionHeader } from '../../src/components';
import { Text, useTheme, radius, space, fonts } from '../../src/theme';
import { useShelter, useLiveAlerts, useNextEvent } from '../../src/data';
import type { ShelterAlert } from '../../src/data';
import { relativeTime, formatTime, formatDayLabel } from '../../src/lib/contact';
import { QuickExit, useSession } from '../../src/safety';

const ALERT_STYLE: Record<
  ShelterAlert['kind'],
  { icon: keyof typeof Ionicons.glyphMap; tone: 'primary' | 'clay' | 'crisis' | 'caution'; label: string }
> = {
  info: { icon: 'information-circle-outline', tone: 'primary', label: 'Notice' },
  delivery: { icon: 'cube-outline', tone: 'primary', label: 'Delivery' },
  weather: { icon: 'thunderstorm-outline', tone: 'caution', label: 'Weather' },
  urgent: { icon: 'alert-circle-outline', tone: 'crisis', label: 'Important' },
};

function greeting(): string {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

export default function GuestToday() {
  const { shift } = useShelter();
  const alerts = useLiveAlerts();
  const next = useNextEvent();
  const { session } = useSession();

  return (
    <Screen
      wash
      eyebrow={greeting()}
      title="Today"
      subtitle={session?.label ? `Signed in as ${session.code} · ${session.label}` : undefined}
      headerRight={<QuickExit />}
    >
      <Stagger index={1}>
        <ShiftCard
          advocates={shift.advocatesOnShift}
          officeOpen={shift.officeOpen}
          note={shift.note}
          nextChangeover={shift.nextChangeover}
          updatedAt={shift.updatedAt}
        />
      </Stagger>

      <Stagger index={2} style={{ marginTop: space.xl }}>
        <Button
          label="Message an advocate"
          icon="chatbubble-ellipses-outline"
          full
          size="lg"
          onPress={() => router.push('/guest/advocate')}
        />
      </Stagger>

      {next ? (
        <Stagger index={3} style={{ marginTop: space.xl }}>
          <SectionHeader title="Next up" />
          <Card>
            <View style={styles.nextRow}>
              <View style={{ alignItems: 'center', minWidth: 62 }}>
                <Text variant="heading" tone="primary">
                  {formatTime(next.time)}
                </Text>
                <Text variant="caption" tone="faint">
                  {formatDayLabel(next.day)}
                </Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text variant="subhead">{next.title}</Text>
                {next.location ? (
                  <Text variant="caption" tone="muted" style={{ marginTop: 2 }}>
                    {next.location}
                  </Text>
                ) : null}
              </View>
              <Button
                label="All"
                variant="ghost"
                size="sm"
                iconRight="chevron-forward"
                onPress={() => router.push('/guest/schedule')}
              />
            </View>
          </Card>
        </Stagger>
      ) : null}

      <Stagger index={4} style={{ marginTop: space.xl }}>
        <SectionHeader title="House notices" />
        {alerts.length === 0 ? (
          <Card tone="alt" flat>
            <Text variant="callout" tone="muted">
              Nothing posted right now.
            </Text>
          </Card>
        ) : (
          <View style={{ gap: space.md }}>
            {alerts.map((a) => (
              <AlertCard key={a.id} alert={a} />
            ))}
          </View>
        )}
        <Text variant="caption" tone="faint" style={{ marginTop: space.md }}>
          Notices go to everyone in the house. Staff cannot see who has read them.
        </Text>
      </Stagger>
    </Screen>
  );
}

/**
 * Staff status and advocate count in one card — they answer the same question
 * ("is there someone I can talk to right now?") and splitting them would make a
 * guest read two things to get one answer. No names, by design.
 */
function ShiftCard({
  advocates,
  officeOpen,
  note,
  nextChangeover,
  updatedAt,
}: {
  advocates: number;
  officeOpen: boolean;
  note?: string;
  nextChangeover?: string;
  updatedAt: number;
}) {
  const { c } = useTheme();
  const none = advocates === 0;

  return (
    <Card tone={none ? 'caution' : 'primary'}>
      <View style={styles.shiftHead}>
        <View style={{ flex: 1 }}>
          <View style={styles.liveRow}>
            <LiveDot color={none ? c.caution : c.onShift} />
            <Text variant="label" caps style={{ color: none ? c.caution : c.onShift }}>
              {officeOpen ? 'Front office open' : 'Front office closed'}
            </Text>
          </View>

          <View style={styles.countRow}>
            <Text
              style={{
                fontFamily: fonts.displayBold,
                fontSize: 48,
                lineHeight: 54,
                color: none ? c.caution : c.primary,
              }}
            >
              {advocates}
            </Text>
            <Text variant="heading" tone="muted" style={{ marginBottom: 8 }}>
              {advocates === 1 ? 'advocate on shift' : 'advocates on shift'}
            </Text>
          </View>
        </View>

        <View style={[styles.shiftIcon, { backgroundColor: none ? c.caution + '22' : c.surface }]}>
          <Ionicons
            name={none ? 'moon-outline' : 'people-outline'}
            size={22}
            color={none ? c.caution : c.primary}
          />
        </View>
      </View>

      {note ? (
        <Text variant="callout" tone="muted" style={{ marginTop: space.md }}>
          {note}
        </Text>
      ) : null}

      <View style={styles.shiftFooter}>
        {nextChangeover ? <Badge label={`Shift change ${formatTime(nextChangeover)}`} tone="neutral" /> : null}
        <Text variant="caption" tone="faint">
          Updated {relativeTime(updatedAt)}
        </Text>
      </View>
    </Card>
  );
}

function AlertCard({ alert }: { alert: ShelterAlert }) {
  const { c } = useTheme();
  const s = ALERT_STYLE[alert.kind];
  const tint = { primary: c.primary, clay: c.clay, crisis: c.crisis, caution: c.caution }[s.tone];

  return (
    <Card tone={s.tone === 'primary' ? 'surface' : s.tone}>
      <View style={{ flexDirection: 'row', gap: space.md }}>
        <Ionicons name={s.icon} size={20} color={tint} style={{ marginTop: 1 }} />
        <View style={{ flex: 1 }}>
          <View style={styles.alertHead}>
            <Text variant="label" caps style={{ color: tint }}>
              {s.label}
            </Text>
            <Text variant="caption" tone="faint">
              {relativeTime(alert.createdAt)}
            </Text>
          </View>
          <Text variant="callout" style={{ marginTop: 6 }}>
            {alert.body}
          </Text>
        </View>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  shiftHead: { flexDirection: 'row', alignItems: 'flex-start', gap: space.md },
  liveRow: { flexDirection: 'row', alignItems: 'center', gap: 7 },
  countRow: { flexDirection: 'row', alignItems: 'flex-end', gap: space.md, marginTop: space.sm },
  shiftIcon: { width: 44, height: 44, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center' },
  shiftFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: space.lg,
    gap: space.md,
    flexWrap: 'wrap',
  },
  nextRow: { flexDirection: 'row', alignItems: 'center', gap: space.base },
  alertHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
});
