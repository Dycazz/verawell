import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { Screen, Card, Button, Badge, Stagger, SectionHeader, CRISIS_DOCK_HEIGHT } from '../../src/components';
import { Text, useTheme, radius, space } from '../../src/theme';
import { useShelter, useNeeds } from '../../src/data';
import type { NeedItem } from '../../src/data';
import { openUrl, relativeTime } from '../../src/lib/contact';

const CATEGORY_ICON: Record<NeedItem['category'], keyof typeof Ionicons.glyphMap> = {
  household: 'home-outline',
  food: 'restaurant-outline',
  hygiene: 'water-outline',
  kids: 'happy-outline',
  bedding: 'bed-outline',
  other: 'cube-outline',
};

export default function Needs() {
  const { profile } = useShelter();
  const needs = useNeeds();
  const lastUpdated = needs.all[0]?.updatedAt;

  const groups = [
    { key: 'urgent', label: 'Needed now', items: needs.urgent, tone: 'clay' as const },
    { key: 'ongoing', label: 'Always welcome', items: needs.ongoing, tone: 'primary' as const },
    { key: 'stocked', label: 'Well stocked — no need right now', items: needs.stocked, tone: 'onShift' as const },
  ];

  return (
    <Screen
      eyebrow="Current needs"
      title="What we need"
      subtitle={
        lastUpdated
          ? `Kept up to date by staff. Last change ${relativeTime(lastUpdated)}.`
          : 'Kept up to date by staff.'
      }
      bottomInset={CRISIS_DOCK_HEIGHT}
    >
      {groups.map((g, i) =>
        g.items.length === 0 ? null : (
          <Stagger key={g.key} index={i + 1} style={{ marginBottom: space.xl }}>
            <SectionHeader title={g.label} action={<Badge label={String(g.items.length)} tone={g.tone} />} />
            <Card padded={false}>
              {g.items.map((n, idx) => (
                <NeedRow key={n.id} need={n} last={idx === g.items.length - 1} dim={g.key === 'stocked'} />
              ))}
            </Card>
          </Stagger>
        ),
      )}

      <Stagger index={5}>
        <Card tone="primary">
          <Text variant="heading">Dropping something off</Text>
          <Text variant="callout" tone="muted" style={{ marginTop: space.sm }}>
            Donations are received at the front office. Call ahead and an advocate will meet
            you at the door — please don't leave items outside.
          </Text>
          <View style={{ flexDirection: 'row', gap: space.sm, marginTop: space.lg, flexWrap: 'wrap' }}>
            <Button label="Give online" icon="gift-outline" onPress={() => openUrl(profile.donateUrl)} />
          </View>
        </Card>
      </Stagger>
    </Screen>
  );
}

function NeedRow({ need, last, dim }: { need: NeedItem; last: boolean; dim: boolean }) {
  const { c } = useTheme();

  return (
    <View
      style={[
        styles.row,
        !last && { borderBottomWidth: StyleSheet.hairlineWidth * 2, borderBottomColor: c.line },
        dim && { opacity: 0.6 },
      ]}
    >
      <View style={[styles.icon, { backgroundColor: c.surfaceAlt }]}>
        <Ionicons name={CATEGORY_ICON[need.category]} size={19} color={c.inkMuted} />
      </View>
      <View style={{ flex: 1 }}>
        <Text variant="bodyStrong">{need.title}</Text>
        {need.note ? (
          <Text variant="caption" tone="muted" style={{ marginTop: 2 }}>
            {need.note}
          </Text>
        ) : null}
      </View>
      {need.urgency === 'stocked' ? (
        <Ionicons name="checkmark-circle" size={20} color={c.onShift} />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: space.base, padding: space.base },
  icon: { width: 38, height: 38, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center' },
});
