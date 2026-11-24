import React from 'react';
import { View } from 'react-native';

import { Screen, Group, Badge, CRISIS_DOCK_HEIGHT } from '../../src/components';
import { Text, space } from '../../src/theme';
import { useNews } from '../../src/data';
import { relativeTime } from '../../src/lib/contact';

export default function News() {
  const posts = useNews();

  return (
    <Screen
      title="News"
      subtitle="Updates from the shelter. Nothing here identifies a guest."
      bottomInset={CRISIS_DOCK_HEIGHT + space.lg}
    >
      {posts.length === 0 ? (
        <Group padded>
          <Text variant="body" tone="secondary">
            No news yet. Check back soon.
          </Text>
        </Group>
      ) : (
        <View style={{ gap: space['2xl'] }}>
          {posts.map((p) => (
            <Group key={p.id} padded>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.sm, marginBottom: space.sm }}>
                {p.pinned ? <Badge label="Pinned" tone="tint" /> : null}
                <Text variant="caption" tone="tertiary">
                  {relativeTime(p.createdAt)}
                </Text>
              </View>
              <Text variant="headline">{p.title}</Text>
              <Text variant="body" tone="secondary" style={{ marginTop: space.xs }}>
                {p.body}
              </Text>
            </Group>
          ))}
        </View>
      )}
    </Screen>
  );
}
