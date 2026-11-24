import React from 'react';
import { View } from 'react-native';
import { router } from 'expo-router';
import type { Ionicons } from '@expo/vector-icons';

import { Screen, Group, Row, Button, CRISIS_DOCK_HEIGHT } from '../../src/components';
import { space } from '../../src/theme';
import { useShelter } from '../../src/data';
import type { HelpKind } from '../../src/data';

const KIND: Record<HelpKind, { label: string; icon: keyof typeof Ionicons.glyphMap }> = {
  drive: { label: 'Drives', icon: 'megaphone' },
  dropoff: { label: 'Drop-offs', icon: 'cube' },
  skills: { label: 'Skills', icon: 'construct' },
  event: { label: 'Events', icon: 'calendar' },
};

export default function Ways() {
  const { ways } = useShelter();

  return (
    <Screen
      title="Ways to help"
      subtitle="Money isn't the only thing that helps."
      back
      backLabel="Help"
      bottomInset={CRISIS_DOCK_HEIGHT + space.lg}
    >
      {(Object.keys(KIND) as HelpKind[]).map((kind) => {
        const items = ways.filter((w) => w.kind === kind);
        if (items.length === 0) return null;
        return (
          <View key={kind} style={{ marginBottom: space['2xl'] }}>
            <Group header={KIND[kind].label}>
              {items.map((w) => (
                <Row
                  key={w.id}
                  icon={KIND[kind].icon}
                  accent="positive"
                  title={w.title}
                  subtitle={[w.description, w.when].filter(Boolean).join('\n')}
                  accessory="none"
                />
              ))}
            </Group>
          </View>
        );
      })}

      <Group padded footer="A volunteer coordinator will get in touch.">
        <Button label="I'd like to help" icon="hand-left" full onPress={() => router.push('/public/volunteer')} />
      </Group>
    </Screen>
  );
}
