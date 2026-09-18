import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { StaffScreen, Group, Row, Button, Field, Segmented, Springy } from '../../src/components';
import { Text, useTheme, space } from '../../src/theme';
import { useBackend, useNeeds } from '../../src/data';
import type { NeedItem, Urgency } from '../../src/data';
import { relativeTime } from '../../src/lib/contact';

const URGENCIES: { value: Urgency; label: string }[] = [
  { value: 'urgent', label: 'Needed now' },
  { value: 'ongoing', label: 'Welcome' },
  { value: 'stocked', label: 'Stocked' },
];

const CATEGORIES: { value: NeedItem['category']; label: string }[] = [
  { value: 'household', label: 'Household' },
  { value: 'food', label: 'Food' },
  { value: 'hygiene', label: 'Hygiene' },
  { value: 'kids', label: 'Kids' },
  { value: 'bedding', label: 'Bedding' },
  { value: 'other', label: 'Other' },
];

export default function StaffNeeds() {
  const { c } = useTheme();
  const api = useBackend();
  const needs = useNeeds();

  const [title, setTitle] = useState('');
  const [note, setNote] = useState('');
  const [urgency, setUrgency] = useState<Urgency>('urgent');
  const [category, setCategory] = useState<NeedItem['category']>('household');

  async function add() {
    if (!title.trim()) return;
    await api.upsertNeed({
      id: `n${Date.now().toString(36)}`,
      title: title.trim(),
      note: note.trim() || undefined,
      urgency,
      category,
    });
    setTitle('');
    setNote('');
  }

  return (
    <StaffScreen title="Current needs" subtitle="This list is what the public app shows.">
      <View style={styles.columns}>
        <View style={styles.colNarrow}>
          <Group padded header="Add an item">
            <View style={{ gap: space.md }}>
              <Field label="Item" value={title} onChangeText={setTitle} placeholder="Twin sheet sets" />
              <Field label="Note (optional)" value={note} onChangeText={setNote} placeholder="New or gently used" />

              <View>
                <Text variant="footnote" tone="secondary" style={{ marginBottom: 6 }}>
                  Priority
                </Text>
                <Segmented options={URGENCIES} value={urgency} onChange={setUrgency} />
              </View>

              <View>
                <Text variant="footnote" tone="secondary" style={{ marginBottom: 6 }}>
                  Category
                </Text>
                {/* Six options is too many for a segmented control, so this uses
                    the other native picker: a list with a checkmark on the
                    selection. */}
                <View style={[styles.picker, { backgroundColor: c.fill }]}>
                  {CATEGORIES.map((cat) => (
                    <Springy
                      key={cat.value}
                      onPress={() => setCategory(cat.value)}
                      scaleTo={1}
                      accessibilityRole="button"
                      accessibilityState={{ selected: category === cat.value }}
                      accessibilityLabel={cat.label}
                      style={styles.pickerItem}
                    >
                      <Text variant="subhead" style={{ flex: 1 }}>
                        {cat.label}
                      </Text>
                      {category === cat.value ? (
                        <Ionicons name="checkmark" size={17} color={c.tint} />
                      ) : null}
                    </Springy>
                  ))}
                </View>
              </View>

              <Button label="Add to the list" full disabled={!title.trim()} onPress={add} />
            </View>
          </Group>
        </View>

        <View style={styles.col}>
          {URGENCIES.map((u) => {
            const items = needs[u.value];
            return (
              <View key={u.value} style={{ marginBottom: space['2xl'] }}>
                <Group header={`${u.label} (${items.length})`}>
                  {items.length === 0 ? (
                    <Row title="Nothing here" accessory="none" />
                  ) : (
                    items.map((n) => (
                      <Row
                        key={n.id}
                        title={n.title}
                        subtitle={[n.note, CATEGORIES.find((x) => x.value === n.category)?.label, relativeTime(n.updatedAt)]
                          .filter(Boolean)
                          .join(' · ')}
                        accessory="none"
                        right={
                          <View style={{ flexDirection: 'row', gap: space.xs }}>
                            <Springy
                              onPress={() => api.upsertNeed({ ...n, urgency: next(n.urgency) })}
                              scaleTo={0.9}
                              accessibilityRole="button"
                              accessibilityLabel={`Change priority of ${n.title}`}
                              style={styles.iconBtn}
                            >
                              <Ionicons name="swap-vertical" size={18} color={c.tint} />
                            </Springy>
                            <Springy
                              onPress={() => api.removeNeed(n.id)}
                              scaleTo={0.9}
                              accessibilityRole="button"
                              accessibilityLabel={`Remove ${n.title}`}
                              style={styles.iconBtn}
                            >
                              <Ionicons name="trash" size={17} color={c.crisis} />
                            </Springy>
                          </View>
                        }
                      />
                    ))
                  )}
                </Group>
              </View>
            );
          })}
        </View>
      </View>
    </StaffScreen>
  );
}

/** Cycles the three priorities, so one control covers all of them. */
function next(current: Urgency): Urgency {
  const order: Urgency[] = ['urgent', 'ongoing', 'stocked'];
  return order[(order.indexOf(current) + 1) % order.length];
}

const styles = StyleSheet.create({
  columns: { flexDirection: 'row', flexWrap: 'wrap', gap: space.xl },
  colNarrow: { flexGrow: 1, flexBasis: 310, minWidth: 260 },
  col: { flexGrow: 2, flexBasis: 380, minWidth: 260 },
  iconBtn: { width: 30, height: 30, alignItems: 'center', justifyContent: 'center' },
  picker: { borderRadius: 10, overflow: 'hidden' },
  pickerItem: { flexDirection: 'row', alignItems: 'center', height: 36, paddingHorizontal: 12 },
});
