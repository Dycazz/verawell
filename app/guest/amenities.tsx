import React from 'react';

import { Screen, Group, Row } from '../../src/components';
import { useShelter } from '../../src/data';
import { QuickExit } from '../../src/safety';

export default function Amenities() {
  const { amenities } = useShelter();

  return (
    <Screen title="Amenities" subtitle="What's available and where to find it." back backLabel="House" headerRight={<QuickExit />}>
      <Group>
        {amenities.map((a) => (
          <Row
            key={a.id}
            icon="location"
            accent="grey"
            title={a.name}
            subtitle={[a.description, a.location, a.hours].filter(Boolean).join('\n')}
            accessory="none"
          />
        ))}
      </Group>
    </Screen>
  );
}
