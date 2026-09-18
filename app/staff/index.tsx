import React, { useState } from 'react';
import { StyleSheet, Switch, View } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { StaffScreen, Group, Row, Button, Field, Segmented, Springy, LiveDot } from '../../src/components';
import { Text, useTheme, radius, space } from '../../src/theme';
import { useBackend, useShelter, useLiveAlerts, useStaffInbox, useNeeds } from '../../src/data';
import type { AlertKind } from '../../src/data';
import { relativeTime } from '../../src/lib/contact';

const KINDS: { value: AlertKind; label: string }[] = [
  { value: 'info', label: 'Notice' },
  { value: 'delivery', label: 'Delivery' },
  { value: 'weather', label: 'Weather' },
  { value: 'urgent', label: 'Important' },
];

export default function StaffShift() {
  const { c } = useTheme();
  const api = useBackend();
  const { shift } = useShelter();
  const alerts = useLiveAlerts();
  const inbox = useStaffInbox();
  const needs = useNeeds();

  const [note, setNote] = useState(shift.note ?? '');
  const [noteSaved, setNoteSaved] = useState(false);
  const [alertBody, setAlertBody] = useState('');
  const [alertKind, setAlertKind] = useState<AlertKind>('info');
  const [posting, setPosting] = useState(false);

  async function postAlert() {
    if (!alertBody.trim()) return;
    setPosting(true);
    await api.postAlert(alertBody.trim(), alertKind);
    setPosting(false);
    setAlertBody('');
    setAlertKind('info');
  }

  return (
    <StaffScreen title="Shift" subtitle="What guests see on their Today screen comes straight from here.">
      <View style={styles.columns}>
        <View style={styles.col}>
          <Group padded header="On shift now" footer="Guests see the number only — never names.">
            <View style={styles.stepperRow}>
              <Stepper value={shift.advocatesOnShift} onChange={(v) => api.setShift({ advocatesOnShift: v })} />
              <Text variant="body" tone="secondary" style={{ flex: 1 }}>
                {shift.advocatesOnShift === 1 ? 'advocate on shift' : 'advocates on shift'}
              </Text>
            </View>
          </Group>

          <View style={{ height: space.lg }} />

          <Group>
            <Row
              title="Front office open"
              subtitle={shift.officeOpen ? 'Shown as staffed' : 'Shown as closed'}
              accessory="none"
              right={
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.sm }}>
                  <LiveDot color={shift.officeOpen ? c.positive : c.warn} />
                  <Switch
                    value={shift.officeOpen}
                    onValueChange={(v) => api.setShift({ officeOpen: v })}
                    trackColor={{ true: c.tint, false: c.fillStrong }}
                thumbColor="#FFFFFF"
                    accessibilityLabel="Front office open"
                  />
                </View>
              }
            />
          </Group>

          <View style={{ height: space.lg }} />

          <Group padded header="Note for guests" footer={`Updated ${relativeTime(shift.updatedAt)}.`}>
            <Field
              value={note}
              onChangeText={(t) => {
                setNote(t);
                setNoteSaved(false);
              }}
              placeholder="e.g. Back at 3:30"
            />
            <Button
              label={noteSaved ? 'Saved' : 'Save note'}
              size="sm"
              variant={noteSaved ? 'tinted' : 'filled'}
              style={{ marginTop: space.md }}
              onPress={async () => {
                await api.setShift({ note: note.trim() || undefined });
                setNoteSaved(true);
              }}
            />
          </Group>

          <View style={{ height: space['2xl'] }} />

          <Group header="At a glance">
            <Row
              icon="mail"
              accent={inbox.unreadThreads > 0 ? 'crisis' : 'grey'}
              title="Unread guest messages"
              value={String(inbox.unreadThreads)}
              onPress={() => router.replace('/staff/inbox')}
            />
            <Row
              icon="people"
              accent={inbox.openPublic > 0 ? 'warn' : 'grey'}
              title="Open community notes"
              value={String(inbox.openPublic)}
              onPress={() => router.replace('/staff/inbox')}
            />
            <Row
              icon="basket"
              accent="grey"
              title="Urgent needs listed"
              value={String(needs.urgent.length)}
              onPress={() => router.replace('/staff/needs')}
            />
          </Group>
        </View>

        <View style={styles.col}>
          <Group
            padded
            header="Post a house notice"
            footer="Goes to every guest at once. One-way and anonymous — you cannot see who read it."
          >
            <Segmented options={KINDS} value={alertKind} onChange={setAlertKind} />
            <Field
              multiline
              value={alertBody}
              onChangeText={setAlertBody}
              placeholder="Grocery delivery arrived — fresh produce in the kitchen."
              style={{ marginTop: space.md }}
            />
            <Button
              label="Post to the house"
              full
              loading={posting}
              disabled={!alertBody.trim()}
              style={{ marginTop: space.md }}
              onPress={postAlert}
            />
          </Group>

          <View style={{ height: space['2xl'] }} />

          <Group header={`Live notices (${alerts.length})`}>
            {alerts.length === 0 ? (
              <Row title="Nothing posted" accessory="none" />
            ) : (
              alerts.map((a) => (
                <Row
                  key={a.id}
                  title={a.body}
                  subtitle={`${KINDS.find((k) => k.value === a.kind)?.label} · ${relativeTime(a.createdAt)}`}
                  accessory="none"
                  right={
                    <Springy
                      onPress={() => api.removeAlert(a.id)}
                      scaleTo={0.9}
                      accessibilityRole="button"
                      accessibilityLabel="Take down this notice"
                      style={styles.iconBtn}
                    >
                      <Ionicons name="close-circle" size={20} color={c.labelTertiary} />
                    </Springy>
                  }
                />
              ))
            )}
          </Group>
        </View>
      </View>
    </StaffScreen>
  );
}

function Stepper({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const { c } = useTheme();
  return (
    <View style={[styles.stepper, { backgroundColor: c.fill }]}>
      <Springy
        onPress={() => onChange(Math.max(0, value - 1))}
        scaleTo={0.9}
        accessibilityRole="button"
        accessibilityLabel="One fewer advocate"
        style={styles.stepBtn}
      >
        <Ionicons name="remove" size={19} color={c.label} />
      </Springy>
      <Text variant="title2" tabular style={{ minWidth: 30, textAlign: 'center' }}>
        {value}
      </Text>
      <Springy
        onPress={() => onChange(Math.min(20, value + 1))}
        scaleTo={0.9}
        accessibilityRole="button"
        accessibilityLabel="One more advocate"
        style={styles.stepBtn}
      >
        <Ionicons name="add" size={19} color={c.label} />
      </Springy>
    </View>
  );
}

const styles = StyleSheet.create({
  columns: { flexDirection: 'row', flexWrap: 'wrap', gap: space.xl },
  col: { flexGrow: 1, flexBasis: 330, minWidth: 260 },
  stepperRow: { flexDirection: 'row', alignItems: 'center', gap: space.base },
  stepper: { flexDirection: 'row', alignItems: 'center', borderRadius: radius.md, padding: 3 },
  stepBtn: { width: 34, height: 34, alignItems: 'center', justifyContent: 'center' },
  iconBtn: { width: 28, height: 28, alignItems: 'center', justifyContent: 'center' },
});
