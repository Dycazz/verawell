import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { StaffScreen, Group, Row, Button, ContentEditor } from '../../src/components';
import { space, useTheme } from '../../src/theme';
import { useBackend, useShelter } from '../../src/data';
import type { Chore } from '../../src/data';

export default function StaffChores() {
  const { c } = useTheme();
  const api = useBackend();
  const { chores } = useShelter();
  const done = chores.filter((x) => x.doneAt).length;

  return (
    <StaffScreen
      title="Chores"
      subtitle="Guests check items off anonymously — you see how much is done, never by whom."
      headerRight={undefined}
    >
      <View style={{ marginBottom: space['2xl'], maxWidth: 520 }}>
        <Group header="Today" footer="Reset at the start of each day so the list is fresh.">
          <Row
            icon="checkbox"
            accent="positive"
            title={`${done} of ${chores.length} done`}
            accessory="none"
            right={<Ionicons name={done === chores.length && chores.length > 0 ? 'checkmark-circle' : 'ellipse-outline'} size={22} color={c.positive} />}
          />
          <View style={styles.reset}>
            <Button label="Reset for a new day" variant="tinted" size="sm" disabled={done === 0} onPress={() => api.resetChores()} />
          </View>
        </Group>
      </View>

      <ContentEditor<Chore & Record<string, unknown>>
        noun="chore"
        items={chores as (Chore & Record<string, unknown>)[]}
        fields={[
          { key: 'title', label: 'Chore', placeholder: 'Wipe kitchen counters' },
          { key: 'area', label: 'Area', placeholder: 'Kitchen' },
        ]}
        titleOf={(x) => x.title}
        subtitleOf={(x) => `${x.area}${x.doneAt ? ' · done' : ''}`}
        onSave={(x) => api.upsertChore({ id: x.id, title: x.title, area: x.area })}
        onRemove={(id) => api.removeChore(id)}
      />
    </StaffScreen>
  );
}

const styles = StyleSheet.create({
  reset: { padding: 12, alignItems: 'flex-start' },
});
