import React from 'react';
import { View } from 'react-native';
import type { Ionicons } from '@expo/vector-icons';

import { Screen, Group, Row } from '../../src/components';
import { space } from '../../src/theme';
import { useShelter } from '../../src/data';
import type { PlaceKind } from '../../src/data';
import { callNumber, formatPhone } from '../../src/lib/contact';
import { QuickExit } from '../../src/safety';

const KINDS: { kind: PlaceKind; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
  { kind: 'transit', label: 'Getting around', icon: 'bus' },
  { kind: 'grocery', label: 'Groceries', icon: 'basket' },
  { kind: 'clinic', label: 'Clinics', icon: 'medkit' },
  { kind: 'pharmacy', label: 'Pharmacies', icon: 'medical' },
  { kind: 'library', label: 'Libraries', icon: 'book' },
  { kind: 'other', label: 'Other', icon: 'ellipsis-horizontal' },
];

export default function Neighborhood() {
  const { places } = useShelter();

  return (
    <Screen
      title="Neighbourhood"
      subtitle="Distances are from the shelter. This app never asks where you are."
      back
      backLabel="House"
      headerRight={<QuickExit />}
    >
      {KINDS.map(({ kind, label, icon }) => {
        const items = places.filter((p) => p.kind === kind);
        if (items.length === 0) return null;
        return (
          <View key={kind} style={{ marginBottom: space['2xl'] }}>
            <Group header={label}>
              {items.map((p) => (
                <Row
                  key={p.id}
                  icon={icon}
                  accent="positive"
                  title={p.name}
                  subtitle={[p.note, p.address, p.distance].filter(Boolean).join('\n')}
                  value={p.phone ? formatPhone(p.phone) : undefined}
                  onPress={p.phone ? () => callNumber(p.phone!) : undefined}
                  accessory="none"
                />
              ))}
            </Group>
          </View>
        );
      })}
    </Screen>
  );
}
