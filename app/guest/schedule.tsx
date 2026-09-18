import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { Screen, Card, Stagger, SectionHeader, Badge } from '../../src/components';
import { Text, useTheme, radius, space } from '../../src/theme';
import { useCalendarByDay, todayISO } from '../../src/data';
import type { CalendarEntry, EventKind } from '../../src/data';
import { formatTime, formatDayLabel } from '../../src/lib/contact';
import { QuickExit } from '../../src/safety';

const KIND: Record<EventKind, { icon: keyof typeof Ionicons.glyphMap; tone: 'primary' | 'clay' | 'caution' | 'neutral'; label: string }> = {
  meal: { icon: 'restaurant-outline', tone: 'clay', label: 'Meal' },
  group: { icon: 'people-outline', tone: 'primary', label: 'Group' },
  curfew: { icon: 'moon-outline', tone: 'caution', label: 'Quiet hours' },
  appointment: { icon: 'calendar-outline', tone: 'primary', label: 'Drop-in' },
  chore: { icon: 'sparkles-outline', tone: 'neutral', label: 'House' },
};

export default function Schedule() {
  const days = useCalendarByDay();
  const today = todayISO();
  const upcoming = days.filter((d) => d.day >= today);

  return (
    <Screen
      eyebrow="House calendar"
      title="Schedule"
      subtitle="Meals, groups, and quiet hours. Times can shift — an advocate will post a notice if they do."
      headerRight={<QuickExit />}
    >
      {upcoming.length === 0 ? (
        <Card tone="alt" flat>
          <Text variant="callout" tone="muted">
            Nothing scheduled yet.
          </Text>
        </Card>
      ) : (
        upcoming.map((d, i) => (
          <Stagger key={d.day} index={i + 1} style={{ marginBottom: space.xl }}>
            <SectionHeader
              title={formatDayLabel(d.day)}
              action={d.day === today ? <Badge label="Today" tone="primary" dot /> : undefined}
            />
            <Card padded={false}>
              {d.entries.map((e, idx) => (
                <EventRow key={e.id} entry={e} last={idx === d.entries.length - 1} />
              ))}
            </Card>
          </Stagger>
        ))
      )}
    </Screen>
  );
}

function EventRow({ entry, last }: { entry: CalendarEntry; last: boolean }) {
  const { c } = useTheme();
  const k = KIND[entry.kind];
  const tint = { primary: c.primary, clay: c.clay, caution: c.caution, neutral: c.inkMuted }[k.tone];
  const tintSoft = { primary: c.primarySoft, clay: c.claySoft, caution: c.cautionSoft, neutral: c.surfaceAlt }[k.tone];

  return (
    <View
      style={[
        styles.row,
        !last && { borderBottomWidth: StyleSheet.hairlineWidth * 2, borderBottomColor: c.line },
      ]}
    >
      <View style={styles.time}>
        <Text variant="bodyStrong">{formatTime(entry.time)}</Text>
        {entry.endTime ? (
          <Text variant="caption" tone="faint">
            to {formatTime(entry.endTime)}
          </Text>
        ) : null}
      </View>

      {/* Rail: keeps the eye on a single vertical line down the day. */}
      <View style={styles.rail}>
        <View style={[styles.dot, { backgroundColor: tint }]} />
        {!last ? <View style={[styles.railLine, { backgroundColor: c.line }]} /> : null}
      </View>

      <View style={{ flex: 1, paddingBottom: last ? 0 : space.xs }}>
        <Text variant="bodyStrong">{entry.title}</Text>
        <View style={styles.meta}>
          <View style={[styles.kindChip, { backgroundColor: tintSoft }]}>
            <Ionicons name={k.icon} size={12} color={tint} />
            <Text variant="caption" style={{ color: tint, fontSize: 11 }}>
              {k.label}
            </Text>
          </View>
          {entry.location ? (
            <Text variant="caption" tone="muted">
              {entry.location}
            </Text>
          ) : null}
        </View>
        {entry.note ? (
          <Text variant="caption" tone="muted" style={{ marginTop: 4 }}>
            {entry.note}
          </Text>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: space.md, paddingHorizontal: space.base, paddingVertical: space.md },
  time: { width: 74 },
  rail: { width: 12, alignItems: 'center', paddingTop: 6 },
  dot: { width: 9, height: 9, borderRadius: 9 },
  railLine: { width: 2, flex: 1, marginTop: 4, borderRadius: 2 },
  meta: { flexDirection: 'row', alignItems: 'center', gap: space.sm, marginTop: 5, flexWrap: 'wrap' },
  kindChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radius.pill,
  },
});
