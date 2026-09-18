import React from 'react';
import { StyleSheet, View } from 'react-native';

import { Screen, Group, Badge } from '../../src/components';
import { Text, useTheme, space, LAYOUT } from '../../src/theme';
import { useCalendarByDay, todayISO } from '../../src/data';
import type { CalendarEntry, EventKind } from '../../src/data';
import { formatTime, formatDayLabel } from '../../src/lib/contact';
import { QuickExit } from '../../src/safety';

const KIND_LABEL: Record<EventKind, string> = {
  meal: 'Meal',
  group: 'Group',
  curfew: 'Quiet hours',
  appointment: 'Drop-in',
  chore: 'House',
};

export default function Schedule() {
  const days = useCalendarByDay();
  const today = todayISO();
  const upcoming = days.filter((d) => d.day >= today);

  return (
    <Screen
      title="Schedule"
      subtitle="Times can shift — an advocate will post a notice if they do."
      headerRight={<QuickExit />}
    >
      {upcoming.length === 0 ? (
        <Group padded>
          <Text variant="body" tone="secondary">
            Nothing scheduled yet.
          </Text>
        </Group>
      ) : (
        upcoming.map((d) => (
          <View key={d.day} style={{ marginBottom: space['2xl'] }}>
            <Group header={formatDayLabel(d.day)}>
              {d.entries.map((e) => (
                <EventRow key={e.id} entry={e} today={d.day === today} />
              ))}
            </Group>
          </View>
        ))
      )}
    </Screen>
  );
}

/** Time in a fixed leading column, the way a native calendar day view reads. */
function EventRow({ entry, today }: { entry: CalendarEntry; today: boolean }) {
  const now = new Date();
  const hhmm = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
  const past = today && (entry.endTime ?? entry.time) < hhmm;

  return (
    <View style={[styles.row, past && { opacity: 0.45 }]}>
      <View style={styles.time}>
        <Text variant="subhead" strong tabular>
          {formatTime(entry.time)}
        </Text>
        {entry.endTime ? (
          <Text variant="caption" tone="tertiary" tabular>
            {formatTime(entry.endTime)}
          </Text>
        ) : null}
      </View>

      <View style={{ flex: 1 }}>
        <Text variant="body">{entry.title}</Text>
        <Text variant="footnote" tone="secondary" style={{ marginTop: 1 }}>
          {[KIND_LABEL[entry.kind], entry.location].filter(Boolean).join(' · ')}
        </Text>
        {entry.note ? (
          <Text variant="footnote" tone="tertiary" style={{ marginTop: 2 }}>
            {entry.note}
          </Text>
        ) : null}
      </View>

      {entry.kind === 'curfew' ? <Badge label="Quiet" tone="grey" /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
    minHeight: LAYOUT.rowTall,
    paddingHorizontal: LAYOUT.margin,
    paddingVertical: space.sm,
  },
  time: { width: 62 },
});
