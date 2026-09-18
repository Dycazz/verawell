import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { StaffScreen, Group, Row, Button, Field, Segmented, Springy } from '../../src/components';
import { Text, useTheme, space } from '../../src/theme';
import { useBackend, useCalendarByDay, todayISO } from '../../src/data';
import type { EventKind } from '../../src/data';
import { formatTime, formatDayLabel } from '../../src/lib/contact';

const KINDS: { value: EventKind; label: string }[] = [
  { value: 'meal', label: 'Meal' },
  { value: 'group', label: 'Group' },
  { value: 'appointment', label: 'Drop-in' },
  { value: 'chore', label: 'House' },
  { value: 'curfew', label: 'Quiet' },
];

const TIME_PATTERN = /^([01]?\d|2[0-3]):[0-5]\d$/;

function upcomingDays(count = 7) {
  return Array.from({ length: count }, (_, i) => {
    const iso = new Date(Date.now() + i * 86_400_000).toISOString().slice(0, 10);
    return { iso, label: i === 0 ? 'Today' : i === 1 ? 'Tomorrow' : formatDayLabel(iso).split(',')[0] };
  });
}

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
    <StaffScreen title="House calendar" subtitle="Meals, groups, and quiet hours as guests see them.">
      <View style={styles.columns}>
        <View style={styles.colNarrow}>
          <Group padded header="Add to the calendar">
            <View style={{ gap: space.md }}>
              <View>
                <Text variant="footnote" tone="secondary" style={{ marginBottom: 6 }}>
                  Day
                </Text>
                <View style={[styles.picker, { backgroundColor: c.fill }]}>
                  {upcomingDays().map((d) => (
                    <Springy
                      key={d.iso}
                      onPress={() => setDay(d.iso)}
                      scaleTo={1}
                      accessibilityRole="button"
                      accessibilityState={{ selected: day === d.iso }}
                      accessibilityLabel={d.label}
                      style={styles.pickerItem}
                    >
                      <Text variant="subhead" style={{ flex: 1 }}>
                        {d.label}
                      </Text>
                      {day === d.iso ? <Ionicons name="checkmark" size={17} color={c.tint} /> : null}
                    </Springy>
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
              <Field label="Where (optional)" value={location} onChangeText={setLocation} placeholder="Community room" />

              <View>
                <Text variant="footnote" tone="secondary" style={{ marginBottom: 6 }}>
                  Type
                </Text>
                <Segmented options={KINDS} value={kind} onChange={setKind} />
              </View>

              <Button label="Add" full disabled={!title.trim()} onPress={add} />
            </View>
          </Group>
        </View>

        <View style={styles.col}>
          {upcoming.length === 0 ? (
            <Group>
              <Row title="Nothing scheduled" accessory="none" />
            </Group>
          ) : (
            upcoming.map((d) => (
              <View key={d.day} style={{ marginBottom: space['2xl'] }}>
                <Group header={formatDayLabel(d.day)}>
                  {d.entries.map((e) => (
                    <Row
                      key={e.id}
                      title={`${formatTime(e.time)}  ${e.title}`}
                      subtitle={[KINDS.find((k) => k.value === e.kind)?.label, e.location].filter(Boolean).join(' · ')}
                      accessory="none"
                      right={
                        <Springy
                          onPress={() => api.removeEvent(e.id)}
                          scaleTo={0.9}
                          accessibilityRole="button"
                          accessibilityLabel={`Remove ${e.title}`}
                          style={styles.iconBtn}
                        >
                          <Ionicons name="trash" size={17} color={c.crisis} />
                        </Springy>
                      }
                    />
                  ))}
                </Group>
              </View>
            ))
          )}
        </View>
      </View>
    </StaffScreen>
  );
}

const styles = StyleSheet.create({
  columns: { flexDirection: 'row', flexWrap: 'wrap', gap: space.xl },
  colNarrow: { flexGrow: 1, flexBasis: 310, minWidth: 260 },
  col: { flexGrow: 2, flexBasis: 380, minWidth: 260 },
  iconBtn: { width: 30, height: 30, alignItems: 'center', justifyContent: 'center' },
  picker: { borderRadius: 10, overflow: 'hidden' },
  pickerItem: { flexDirection: 'row', alignItems: 'center', height: 36, paddingHorizontal: 12 },
});
