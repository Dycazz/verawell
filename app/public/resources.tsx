import React from 'react';
import { View } from 'react-native';

import { Screen, Group, Row, CRISIS_DOCK_HEIGHT } from '../../src/components';
import { space } from '../../src/theme';
import { useShelter } from '../../src/data';
import type { CommunityResource } from '../../src/data';
import { callNumber, openUrl, formatPhone } from '../../src/lib/contact';

const GROUPS: { key: CommunityResource['category']; header: string }[] = [
  { key: 'crisis', header: 'Crisis lines' },
  { key: 'housing', header: 'Housing & basic needs' },
  { key: 'legal', header: 'Legal help' },
  { key: 'health', header: 'Health' },
  { key: 'food', header: 'Food' },
  { key: 'family', header: 'Families & children' },
];

export default function Resources() {
  const { resources } = useShelter();

  return (
    <Screen
      title="Other places to turn"
      subtitle="Agencies and hotlines run by other organisations."
      bottomInset={CRISIS_DOCK_HEIGHT + space.lg}
    >
      {GROUPS.map((g) => {
        const items = resources.filter((r) => r.category === g.key);
        if (items.length === 0) return null;

        return (
          <View key={g.key} style={{ marginBottom: space['2xl'] }}>
            <Group header={g.header}>
              {items.flatMap((r) => {
                const rows = [
                  <Row
                    key={`${r.id}-call`}
                    title={r.name}
                    subtitle={r.available ? `${r.description} · ${r.available}` : r.description}
                    value={r.phone ? formatPhone(r.phone) : undefined}
                    accent={g.key === 'crisis' ? 'crisis' : 'tint'}
                    icon="call"
                    onPress={r.phone ? () => callNumber(r.phone!) : undefined}
                    accessory="none"
                  />,
                ];
                if (r.url) {
                  rows.push(
                    <Row
                      key={`${r.id}-web`}
                      title="Website"
                      icon="globe"
                      accent="grey"
                      value="Opens browser"
                      onPress={() => openUrl(r.url!)}
                    />,
                  );
                }
                return rows;
              })}
            </Group>
          </View>
        );
      })}
    </Screen>
  );
}
