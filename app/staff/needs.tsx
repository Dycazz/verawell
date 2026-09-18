import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { StaffScreen, Card, Button, Field, Badge, Stagger, Springy, SectionHeader } from '../../src/components';
import { Text, useTheme, radius, space } from '../../src/theme';
import { useBackend, useNeeds } from '../../src/data';
import type { NeedItem, Urgency } from '../../src/data';
import { relativeTime } from '../../src/lib/contact';

const URGENCIES: { key: Urgency; label: string; tone: 'clay' | 'primary' | 'onShift' }[] = [
  { key: 'urgent', label: 'Needed now', tone: 'clay' },
  { key: 'ongoing', label: 'Always welcome', tone: 'primary' },
  { key: 'stocked', label: 'Well stocked', tone: 'onShift' },
];

const CATEGORIES: { key: NeedItem['category']; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
  { key: 'household', label: 'Household', icon: 'home-outline' },
  { key: 'food', label: 'Food', icon: 'restaurant-outline' },
  { key: 'hygiene', label: 'Hygiene', icon: 'water-outline' },
  { key: 'kids', label: 'Kids', icon: 'happy-outline' },
  { key: 'bedding', label: 'Bedding', icon: 'bed-outline' },
  { key: 'other', label: 'Other', icon: 'cube-outline' },
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
    setUrgency('urgent');
    setCategory('household');
  }

  return (
    <StaffScreen
      eyebrow="Console"
      title="Current needs"
      subtitle="This list is what the public app shows. Changes appear there immediately."
    >
      <View style={styles.columns}>
        <View style={styles.colNarrow}>
          <Stagger index={1}>
            <SectionHeader title="Add an item" />
            <Card>
              <View style={{ gap: space.lg }}>
                <Field label="Item" value={title} onChangeText={setTitle} placeholder="Twin sheet sets" />
                <Field
                  label="Note (optional)"
                  value={note}
                  onChangeText={setNote}
                  placeholder="New or gently used"
                />

                <View style={{ gap: space.sm }}>
                  <Text variant="label" caps tone="faint">
                    Priority
                  </Text>
                  <View style={styles.chips}>
                    {URGENCIES.map((u) => (
                      <Chip
                        key={u.key}
                        label={u.label}
                        active={urgency === u.key}
                        onPress={() => setUrgency(u.key)}
                      />
                    ))}
                  </View>
                </View>

                <View style={{ gap: space.sm }}>
                  <Text variant="label" caps tone="faint">
                    Category
                  </Text>
                  <View style={styles.chips}>
                    {CATEGORIES.map((cat) => (
                      <Chip
                        key={cat.key}
                        label={cat.label}
                        icon={cat.icon}
                        active={category === cat.key}
                        onPress={() => setCategory(cat.key)}
                      />
                    ))}
                  </View>
                </View>

                <Button label="Add to the list" icon="add" full disabled={!title.trim()} onPress={add} />
              </View>
            </Card>
          </Stagger>
        </View>

        <View style={styles.col}>
          {URGENCIES.map((u, i) => {
            const items = needs[u.key];
            return (
              <Stagger key={u.key} index={i + 2} style={{ marginBottom: space.xl }}>
                <SectionHeader title={u.label} action={<Badge label={String(items.length)} tone={u.tone} />} />
                {items.length === 0 ? (
                  <Card tone="alt" flat>
                    <Text variant="callout" tone="muted">
                      Nothing here.
                    </Text>
                  </Card>
                ) : (
                  <Card padded={false}>
                    {items.map((n, idx) => (
                      <View
                        key={n.id}
                        style={[
                          styles.row,
                          idx < items.length - 1 && {
                            borderBottomWidth: StyleSheet.hairlineWidth * 2,
                            borderBottomColor: c.line,
                          },
                        ]}
                      >
                        <View style={{ flex: 1 }}>
                          <Text variant="bodyStrong">{n.title}</Text>
                          {n.note ? (
                            <Text variant="caption" tone="muted" style={{ marginTop: 2 }}>
                              {n.note}
                            </Text>
                          ) : null}
                          <Text variant="caption" tone="faint" style={{ marginTop: 3 }}>
                            {CATEGORIES.find((cat) => cat.key === n.category)?.label} · {relativeTime(n.updatedAt)}
                          </Text>
                        </View>

                        <Springy
                          onPress={() => api.upsertNeed({ ...n, urgency: nextUrgency(n.urgency) })}
                          scaleTo={0.88}
                          accessibilityRole="button"
                          accessibilityLabel={`Change priority of ${n.title}`}
                          style={StyleSheet.flatten([styles.iconBtn, { backgroundColor: c.surfaceAlt }])}
                        >
                          <Ionicons name="swap-vertical-outline" size={17} color={c.inkMuted} />
                        </Springy>

                        <Springy
                          onPress={() => api.removeNeed(n.id)}
                          scaleTo={0.88}
                          accessibilityRole="button"
                          accessibilityLabel={`Remove ${n.title}`}
                          style={StyleSheet.flatten([styles.iconBtn, { backgroundColor: c.surfaceAlt }])}
                        >
                          <Ionicons name="trash-outline" size={16} color={c.inkMuted} />
                        </Springy>
                      </View>
                    ))}
                  </Card>
                )}
              </Stagger>
            );
          })}
        </View>
      </View>
    </StaffScreen>
  );
}

/** Cycles urgent → ongoing → stocked → urgent, so one control covers all three. */
function nextUrgency(current: Urgency): Urgency {
  const order: Urgency[] = ['urgent', 'ongoing', 'stocked'];
  return order[(order.indexOf(current) + 1) % order.length];
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
  row: { flexDirection: 'row', alignItems: 'center', gap: space.sm, padding: space.base },
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
