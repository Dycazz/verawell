import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { Screen, Card, Button, Badge, Stagger, SectionHeader, CRISIS_DOCK_HEIGHT } from '../../src/components';
import { Text, useTheme, radius, space } from '../../src/theme';
import { useShelter } from '../../src/data';
import type { CommunityResource } from '../../src/data';
import { callNumber, openUrl, formatPhone } from '../../src/lib/contact';

const GROUPS: { key: CommunityResource['category']; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
  { key: 'crisis', label: 'Crisis lines', icon: 'call-outline' },
  { key: 'housing', label: 'Housing & basic needs', icon: 'home-outline' },
  { key: 'legal', label: 'Legal help', icon: 'document-text-outline' },
  { key: 'health', label: 'Health', icon: 'medkit-outline' },
  { key: 'food', label: 'Food', icon: 'restaurant-outline' },
  { key: 'family', label: 'Families & children', icon: 'people-outline' },
];

export default function Resources() {
  const { resources } = useShelter();

  return (
    <Screen
      eyebrow="Community resources"
      title="Other places to turn"
      subtitle="Agencies, hotlines, and numbers worth keeping. These are not run by us."
      bottomInset={CRISIS_DOCK_HEIGHT}
    >
      {GROUPS.map((g, i) => {
        const items = resources.filter((r) => r.category === g.key);
        if (items.length === 0) return null;

        return (
          <Stagger key={g.key} index={i + 1} style={{ marginBottom: space.xl }}>
            <SectionHeader title={g.label} />
            <View style={{ gap: space.md }}>
              {items.map((r) => (
                <ResourceCard key={r.id} resource={r} icon={g.icon} />
              ))}
            </View>
          </Stagger>
        );
      })}
    </Screen>
  );
}

function ResourceCard({ resource, icon }: { resource: CommunityResource; icon: keyof typeof Ionicons.glyphMap }) {
  const { c } = useTheme();
  const isCrisis = resource.category === 'crisis';

  return (
    <Card tone={isCrisis ? 'crisis' : 'surface'}>
      <View style={styles.head}>
        <View style={[styles.icon, { backgroundColor: isCrisis ? c.crisis + '22' : c.primarySoft }]}>
          <Ionicons name={icon} size={19} color={isCrisis ? c.crisis : c.primary} />
        </View>
        <View style={{ flex: 1 }}>
          <Text variant="subhead">{resource.name}</Text>
          {resource.available ? (
            <Text variant="caption" tone="faint" style={{ marginTop: 1 }}>
              {resource.available}
            </Text>
          ) : null}
        </View>
        {isCrisis ? <Badge label="24/7" tone="crisis" /> : null}
      </View>

      <Text variant="callout" tone="muted" style={{ marginTop: space.md }}>
        {resource.description}
      </Text>

      <View style={styles.actions}>
        {resource.phone ? (
          <Button
            label={formatPhone(resource.phone)}
            icon="call-outline"
            size="sm"
            variant={isCrisis ? 'crisis' : 'soft'}
            onPress={() => callNumber(resource.phone!)}
          />
        ) : null}
        {resource.url ? (
          <Button
            label="Website"
            icon="open-outline"
            size="sm"
            variant="ghost"
            onPress={() => openUrl(resource.url!)}
          />
        ) : null}
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  head: { flexDirection: 'row', alignItems: 'center', gap: space.md },
  icon: { width: 38, height: 38, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center' },
  actions: { flexDirection: 'row', flexWrap: 'wrap', gap: space.sm, marginTop: space.lg },
});
