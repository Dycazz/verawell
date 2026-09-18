import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { StaffScreen, Card, Button, Field, Badge, Stagger, Springy, SectionHeader } from '../../src/components';
import { Text, useTheme, radius, space } from '../../src/theme';
import { useBackend, useCalendarByDay, todayISO } from '../../src/data';
import type { EventKind } from '../../src/data';
import { formatTime, formatDayLabel } from '../../src/lib/contact';

const KINDS: { key: EventKind; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
  { key: 'meal', label: 'Meal', icon: 'restaurant-outline' },
  { key: 'group', label: 'Group', icon: 'people-outline' },
  { key: 'appointment', label: 'Drop-in', icon: 'calendar-outline' },
  { key: 'chore', label: 'House', icon: 'sparkles-outline' },
  { key: 'curfew', label: 'Quiet hours', icon: 'moon-outline' },
];

/** The next week, which is as far ahead as a house calendar usefully goes. */
function upcomingDays(count = 7) {
  return Array.from({ length: count }, (_, i) => {
    const iso = new Date(Date.now() + i * 86_400_000).toISOString().slice(0, 10);
    return { iso, label: i === 0 ? 'Today' : i === 1 ? 'Tomorrow' : formatDayLabel(iso).split(',')[0] };
  });
}

const TIME_PATTERN = /^([01]?\d|2[0-3]):[0-5]\d$/;

export default function StaffSchedule() {
  const { c } = useTheme();
  const api = useBackend();
  const days = useCalendarByDay();
  const today = todayISO();

  const [day, setDay] = useState(today);
  const [time, setTime] = useState('');
  const [title, setTitle] = useState('');
  const [location, setLocation] = useState('');
  const [kind, setKind] = useState<EventKind>('group');
  const [error, setError] = useState<string>();

  async function add() {
    if (!title.trim()) return;
    if (!TIME_PATTERN.test(time.trim())) {
      setError('Use 24-hour time, like 17:30.');
      return;
    }
    setError(undefined);
    await api.upsertEvent({
      id: `c${Date.now().toString(36)}`,
      day,
      time: time.trim().padStart(5, '0'),
      title: title.trim(),
      kind,
      location: location.trim() || undefined,
    });
    setTitle('');
    setTime('');
    setLocation('');
  }

  const upcoming = days.filter((d) => d.day >= today);

  return (
    <StaffScreen
      eyebrow="Console"
      title="House calendar"
      subtitle="Meals, groups, and quiet hours as guests see them."
    >
      <View style={styles.columns}>
        <View style={styles.colNarrow}>
          <Stagger index={1}>
            <SectionHeader title="Add to the calendar" />
            <Card>
              <View style={{ gap: space.lg }}>
                <View style={{ gap: space.sm }}>
                  <Text variant="label" caps tone="faint">
                    Day
                  </Text>
                  <View style={styles.chips}>
                    {upcomingDays().map((d) => (
                      <Chip key={d.iso} label={d.label} active={day === d.iso} onPress={() => setDay(d.iso)} />
                    ))}
                  </View>
                </View>

                <Field
                  label="Time (24h)"
                  value={time}
                  onChangeText={(t) => {
                    setTime(t);
                    setError(undefined);
                  }}
                  placeholder="17:30"
                  keyboardType="numbers-and-punctuation"
                  error={error}
                />

                <Field label="What" value={title} onChangeText={setTitle} placeholder="Housing support group" />
                <Field
                  label="Where (optional)"
                  value={location}
                  onChangeText={setLocation}
                  placeholder="Community room"
                />

                <View style={{ gap: space.sm }}>
                  <Text variant="label" caps tone="faint">
                    Type
                  </Text>
                  <View style={styles.chips}>
                    {KINDS.map((k) => (
                      <Chip
                        key={k.key}
                        label={k.label}
                        icon={k.icon}
                        active={kind === k.key}
                        onPress={() => setKind(k.key)}
                      />
                    ))}
                  </View>
                </View>

                <Button label="Add" icon="add" full disabled={!title.trim()} onPress={add} />
              </View>
            </Card>
          </Stagger>
        </View>

        <View style={styles.col}>
          {upcoming.length === 0 ? (
            <Card tone="alt" flat>
              <Text variant="callout" tone="muted">
                Nothing scheduled.
              </Text>
            </Card>
          ) : (
            upcoming.map((d, i) => (
              <Stagger key={d.day} index={i + 2} style={{ marginBottom: space.xl }}>
                <SectionHeader
                  title={formatDayLabel(d.day)}
                  action={d.day === today ? <Badge label="Today" tone="primary" dot /> : undefined}
                />
                <Card padded={false}>
                  {d.entries.map((e, idx) => (
                    <View
                      key={e.id}
                      style={[
                        styles.row,
                        idx < d.entries.length - 1 && {
                          borderBottomWidth: StyleSheet.hairlineWidth * 2,
                          borderBottomColor: c.line,
                        },
                      ]}
                    >
                      <Text variant="bodyStrong" style={{ width: 66 }}>
                        {formatTime(e.time)}
                      </Text>
                      <View style={{ flex: 1 }}>
                        <Text variant="bodyStrong">{e.title}</Text>
                        <Text variant="caption" tone="muted" style={{ marginTop: 2 }}>
                          {KINDS.find((k) => k.key === e.kind)?.label}
                          {e.location ? ` · ${e.location}` : ''}
                        </Text>
                      </View>
                      <Springy
                        onPress={() => api.removeEvent(e.id)}
                        scaleTo={0.88}
                        accessibilityRole="button"
                        accessibilityLabel={`Remove ${e.title}`}
                        style={StyleSheet.flatten([styles.iconBtn, { backgroundColor: c.surfaceAlt }])}
                      >
                        <Ionicons name="trash-outline" size={16} color={c.inkMuted} />
                      </Springy>
                    </View>
                  ))}
                </Card>
              </Stagger>
            ))
          )}
        </View>
      </View>
    </StaffScreen>
  );
}

function Chip({
  label,
  icon,
  active,
  onPress,
}: {
  label: string;
  icon?: keyof typeof Ionicons.glyphMap;
  active: boolean;
  onPress: () => void;
}) {
  const { c } = useTheme();
  return (
    <Springy
      onPress={onPress}
      scaleTo={0.93}
      haptic="none"
      accessibilityRole="button"
      accessibilityState={{ selected: active }}
      accessibilityLabel={label}
      style={StyleSheet.flatten([
        styles.chip,
        { backgroundColor: active ? c.primary : c.surfaceAlt, borderColor: active ? c.primary : c.line },
      ])}
    >
      {icon ? <Ionicons name={icon} size={13} color={active ? c.onPrimary : c.inkMuted} /> : null}
      <Text variant="label" style={{ color: active ? c.onPrimary : c.inkMuted }}>
        {label}
      </Text>
    </Springy>
  );
}

const styles = StyleSheet.create({
  columns: { flexDirection: 'row', flexWrap: 'wrap', gap: space.xl },
  colNarrow: { flexGrow: 1, flexBasis: 320, minWidth: 280 },
  col: { flexGrow: 2, flexBasis: 400, minWidth: 280 },
  row: { flexDirection: 'row', alignItems: 'center', gap: space.md, padding: space.base },
  iconBtn: { width: 34, height: 34, borderRadius: radius.sm, alignItems: 'center', justifyContent: 'center' },
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
});
