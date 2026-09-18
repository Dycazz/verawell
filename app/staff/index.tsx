import React, { useState } from 'react';
import { StyleSheet, Switch, View } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { StaffScreen, Card, Button, Field, Badge, LiveDot, Stagger, Springy, SectionHeader } from '../../src/components';
import { Text, useTheme, radius, space, fonts } from '../../src/theme';
import { useBackend, useShelter, useLiveAlerts, useStaffInbox, useNeeds } from '../../src/data';
import type { AlertKind } from '../../src/data';
import { relativeTime } from '../../src/lib/contact';

const ALERT_KINDS: { key: AlertKind; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
  { key: 'info', label: 'Notice', icon: 'information-circle-outline' },
  { key: 'delivery', label: 'Delivery', icon: 'cube-outline' },
  { key: 'weather', label: 'Weather', icon: 'thunderstorm-outline' },
  { key: 'urgent', label: 'Important', icon: 'alert-circle-outline' },
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
    <StaffScreen
      eyebrow="Console"
      title="Shift"
      subtitle="What guests see on their Today screen comes straight from here."
    >
      <View style={styles.columns}>
        <View style={styles.col}>
          <Stagger index={1}>
            <SectionHeader title="On shift now" />
            <Card>
              <View style={styles.stepperRow}>
                <Stepper
                  value={shift.advocatesOnShift}
                  onChange={(v) => api.setShift({ advocatesOnShift: v })}
                />
                <View style={{ flex: 1 }}>
                  <Text variant="bodyStrong">
                    {shift.advocatesOnShift === 1 ? 'advocate on shift' : 'advocates on shift'}
                  </Text>
                  <Text variant="caption" tone="muted" style={{ marginTop: 2 }}>
                    Guests see the number only — never names.
                  </Text>
                </View>
              </View>

              <View style={[styles.divider, { backgroundColor: c.line }]} />

              <View style={styles.toggleRow}>
                <LiveDot color={shift.officeOpen ? c.onShift : c.caution} />
                <View style={{ flex: 1 }}>
                  <Text variant="bodyStrong">Front office open</Text>
                  <Text variant="caption" tone="muted" style={{ marginTop: 1 }}>
                    {shift.officeOpen ? 'Shown as staffed' : 'Shown as closed'}
                  </Text>
                </View>
                <Switch
                  value={shift.officeOpen}
                  onValueChange={(v) => api.setShift({ officeOpen: v })}
                  trackColor={{ true: c.primary, false: c.lineStrong }}
                  thumbColor={c.surface}
                  accessibilityLabel="Front office open"
                />
              </View>

              <View style={[styles.divider, { backgroundColor: c.line }]} />

              <Field
                label="Note for guests"
                value={note}
                onChangeText={(t) => {
                  setNote(t);
                  setNoteSaved(false);
                }}
                placeholder="e.g. Back at 3:30"
              />
              <View style={styles.saveRow}>
                <Button
                  label={noteSaved ? 'Saved' : 'Save note'}
                  size="sm"
                  variant={noteSaved ? 'soft' : 'primary'}
                  icon={noteSaved ? 'checkmark' : undefined}
                  onPress={async () => {
                    await api.setShift({ note: note.trim() || undefined });
                    setNoteSaved(true);
                  }}
                />
                <Text variant="caption" tone="faint">
                  Updated {relativeTime(shift.updatedAt)}
                </Text>
              </View>
            </Card>
          </Stagger>

          <Stagger index={2} style={{ marginTop: space.xl }}>
            <SectionHeader title="At a glance" />
            <View style={styles.statRow}>
              <Stat
                label="Unread messages"
                value={inbox.unreadThreads}
                icon="mail-unread-outline"
                tone={inbox.unreadThreads > 0 ? 'clay' : 'neutral'}
                onPress={() => router.replace('/staff/inbox')}
              />
              <Stat
                label="Community notes"
                value={inbox.openPublic}
                icon="people-outline"
                tone={inbox.openPublic > 0 ? 'clay' : 'neutral'}
                onPress={() => router.replace('/staff/inbox')}
              />
              <Stat
                label="Urgent needs"
                value={needs.urgent.length}
                icon="basket-outline"
                tone="neutral"
                onPress={() => router.replace('/staff/needs')}
              />
            </View>
          </Stagger>
        </View>

        <View style={styles.col}>
          <Stagger index={3}>
            <SectionHeader title="Post a house notice" />
            <Card>
              <Text variant="caption" tone="muted" style={{ marginBottom: space.md }}>
                Goes to every guest at once. One-way and anonymous — you cannot see who read it.
              </Text>

              <View style={styles.chips}>
                {ALERT_KINDS.map((k) => {
                  const active = k.key === alertKind;
                  return (
                    <Springy
                      key={k.key}
                      onPress={() => setAlertKind(k.key)}
                      scaleTo={0.94}
                      accessibilityRole="button"
                      accessibilityState={{ selected: active }}
                      accessibilityLabel={k.label}
                      style={StyleSheet.flatten([
                        styles.chip,
                        { backgroundColor: active ? c.primary : c.surfaceAlt, borderColor: active ? c.primary : c.line },
                      ])}
                    >
                      <Ionicons name={k.icon} size={14} color={active ? c.onPrimary : c.inkMuted} />
                      <Text variant="label" style={{ color: active ? c.onPrimary : c.inkMuted }}>
                        {k.label}
                      </Text>
                    </Springy>
                  );
                })}
              </View>

              <Field
                multiline
                value={alertBody}
                onChangeText={setAlertBody}
                placeholder="Grocery delivery arrived — fresh produce in the kitchen."
                style={{ marginTop: space.base }}
              />

              <Button
                label="Post to the house"
                icon="megaphone-outline"
                full
                loading={posting}
                disabled={!alertBody.trim()}
                style={{ marginTop: space.base }}
                onPress={postAlert}
              />
            </Card>
          </Stagger>

          <Stagger index={4} style={{ marginTop: space.xl }}>
            <SectionHeader title="Live notices" action={<Badge label={String(alerts.length)} tone="neutral" />} />
            {alerts.length === 0 ? (
              <Card tone="alt" flat>
                <Text variant="callout" tone="muted">
                  Nothing posted.
                </Text>
              </Card>
            ) : (
              <Card padded={false}>
                {alerts.map((a, i) => (
                  <View
                    key={a.id}
                    style={[
                      styles.alertRow,
                      i < alerts.length - 1 && {
                        borderBottomWidth: StyleSheet.hairlineWidth * 2,
                        borderBottomColor: c.line,
                      },
                    ]}
                  >
                    <Ionicons
                      name={ALERT_KINDS.find((k) => k.key === a.kind)?.icon ?? 'information-circle-outline'}
                      size={18}
                      color={a.kind === 'urgent' ? c.crisis : a.kind === 'weather' ? c.caution : c.primary}
                      style={{ marginTop: 2 }}
                    />
                    <View style={{ flex: 1 }}>
                      <Text variant="callout">{a.body}</Text>
                      <Text variant="caption" tone="faint" style={{ marginTop: 3 }}>
                        {relativeTime(a.createdAt)}
                      </Text>
                    </View>
                    <Springy
                      onPress={() => api.removeAlert(a.id)}
                      scaleTo={0.88}
                      accessibilityRole="button"
                      accessibilityLabel="Take down this notice"
                      style={styles.iconBtn}
                    >
                      <Ionicons name="close" size={17} color={c.inkFaint} />
                    </Springy>
                  </View>
                ))}
              </Card>
            )}
          </Stagger>
        </View>
      </View>
    </StaffScreen>
  );
}

function Stepper({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const { c } = useTheme();
  return (
    <View style={[styles.stepper, { borderColor: c.line, backgroundColor: c.surfaceAlt }]}>
      <Springy
        onPress={() => onChange(Math.max(0, value - 1))}
        scaleTo={0.85}
        accessibilityRole="button"
        accessibilityLabel="One fewer advocate"
        style={styles.stepBtn}
      >
        <Ionicons name="remove" size={20} color={c.inkMuted} />
      </Springy>
      <Text style={{ fontFamily: fonts.displayBold, fontSize: 30, color: c.primary, minWidth: 34, textAlign: 'center' }}>
        {value}
      </Text>
      <Springy
        onPress={() => onChange(Math.min(20, value + 1))}
        scaleTo={0.85}
        accessibilityRole="button"
        accessibilityLabel="One more advocate"
        style={styles.stepBtn}
      >
        <Ionicons name="add" size={20} color={c.inkMuted} />
      </Springy>
    </View>
  );
}

function Stat({
  label,
  value,
  icon,
  tone,
  onPress,
}: {
  label: string;
  value: number;
  icon: keyof typeof Ionicons.glyphMap;
  tone: 'clay' | 'neutral';
  onPress: () => void;
}) {
  const { c } = useTheme();
  const tint = tone === 'clay' ? c.clay : c.inkMuted;

  return (
    <Springy
      onPress={onPress}
      scaleTo={0.97}
      accessibilityRole="button"
      accessibilityLabel={`${label}: ${value}`}
      style={StyleSheet.flatten([styles.stat, { backgroundColor: c.surface, borderColor: c.line }])}
    >
      <Ionicons name={icon} size={18} color={tint} />
      <Text style={{ fontFamily: fonts.displayBold, fontSize: 26, color: tint, marginTop: 6 }}>{value}</Text>
      <Text variant="caption" tone="muted">
        {label}
      </Text>
    </Springy>
  );
}

const styles = StyleSheet.create({
  columns: { flexDirection: 'row', flexWrap: 'wrap', gap: space.xl },
  col: { flexGrow: 1, flexBasis: 340, minWidth: 280 },
  stepperRow: { flexDirection: 'row', alignItems: 'center', gap: space.base },
  stepper: { flexDirection: 'row', alignItems: 'center', borderRadius: radius.md, borderWidth: 1.5, padding: 4 },
  stepBtn: { width: 38, height: 38, alignItems: 'center', justifyContent: 'center' },
  divider: { height: StyleSheet.hairlineWidth * 2, marginVertical: space.lg },
  toggleRow: { flexDirection: 'row', alignItems: 'center', gap: space.md },
  saveRow: { flexDirection: 'row', alignItems: 'center', gap: space.base, marginTop: space.base },
  statRow: { flexDirection: 'row', gap: space.md, flexWrap: 'wrap' },
  stat: {
    flexGrow: 1,
    flexBasis: '30%',
    minWidth: 104,
    padding: space.base,
    borderRadius: radius.lg,
    borderWidth: StyleSheet.hairlineWidth * 2,
  },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: space.sm },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: space.md,
    height: 36,
    borderRadius: radius.pill,
    borderWidth: 1.5,
  },
  alertRow: { flexDirection: 'row', gap: space.md, padding: space.base, alignItems: 'flex-start' },
  iconBtn: { width: 32, height: 32, alignItems: 'center', justifyContent: 'center' },
});
