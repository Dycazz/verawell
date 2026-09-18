import React from 'react';
import { View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { Screen, Group, Row, Button, CRISIS_DOCK_HEIGHT } from '../../src/components';
import { space, useTheme } from '../../src/theme';
import { useShelter, useNeeds } from '../../src/data';
import { openUrl, relativeTime } from '../../src/lib/contact';

export default function Needs() {
  const { profile } = useShelter();
  const needs = useNeeds();
  const updated = needs.all[0]?.updatedAt;

  const groups = [
    { key: 'urgent', header: 'Needed now', items: needs.urgent },
    { key: 'ongoing', header: 'Always welcome', items: needs.ongoing },
    { key: 'stocked', header: 'Well stocked — no need right now', items: needs.stocked },
  ];

  return (
    <Screen
      title="What we need"
      subtitle={updated ? `Kept up to date by staff. Last change ${relativeTime(updated)}.` : undefined}
      bottomInset={CRISIS_DOCK_HEIGHT + space.lg}
    >
      {groups.map((g) =>
        g.items.length === 0 ? null : (
          <View key={g.key} style={{ marginBottom: space['2xl'] }}>
            <Group header={g.header}>
              {g.items.map((n) => (
                <Row
                  key={n.id}
                  title={n.title}
                  subtitle={n.note}
                  accessory="none"
                  right={g.key === 'stocked' ? <StockedTick /> : undefined}
                />
              ))}
            </Group>
          </View>
        ),
      )}

      <Group
        padded
        header="Dropping something off"
        footer="Donations are received at the front office. Please call ahead — don't leave items outside."
      >
        <Button label="Give online" icon="gift" onPress={() => openUrl(profile.donateUrl)} full />
      </Group>
    </Screen>
  );
}

function StockedTick() {
  const { c } = useTheme();
  return <Ionicons name="checkmark" size={17} color={c.positive} />;
}
