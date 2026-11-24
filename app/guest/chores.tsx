import React from 'react';
import { View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { Screen, Group, Row, Springy } from '../../src/components';
import { Text, useTheme, space } from '../../src/theme';
import { useBackend, useShelter } from '../../src/data';
import { QuickExit } from '../../src/safety';

export default function Chores() {
  const { c } = useTheme();
  const api = useBackend();
  const { chores } = useShelter();

  const areas = [...new Set(chores.map((x) => x.area))];
  const done = chores.filter((x) => x.doneAt).length;

  return (
    <Screen
      title="Chores"
      subtitle={`${done} of ${chores.length} done today. Check-off is anonymous — nobody is recorded.`}
      back
      backLabel="House"
      headerRight={<QuickExit />}
    >
      {areas.map((area) => (
        <View key={area} style={{ marginBottom: space['2xl'] }}>
          <Group header={area}>
            {chores
              .filter((x) => x.area === area)
              .map((ch) => (
                <Row
                  key={ch.id}
                  title={ch.title}
                  accessory="none"
                  onPress={() => api.toggleChore(ch.id)}
                  right={
                    <Ionicons
                      name={ch.doneAt ? 'checkmark-circle' : 'ellipse-outline'}
                      size={24}
                      color={ch.doneAt ? c.positive : c.labelTertiary}
                    />
                  }
                />
              ))}
          </Group>
        </View>
      ))}

      {chores.length === 0 ? (
        <Group padded>
          <Text variant="body" tone="secondary">
            No chores are set up yet.
          </Text>
        </Group>
      ) : null}
    </Screen>
  );
}
