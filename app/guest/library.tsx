import React, { useState } from 'react';
import { View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { Screen, Group, Row, Segmented } from '../../src/components';
import { Text, useTheme, space } from '../../src/theme';
import { useShelter } from '../../src/data';
import type { LibraryArticle } from '../../src/data';
import { QuickExit } from '../../src/safety';

const CATEGORIES: { value: 'all' | LibraryArticle['category']; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'rights', label: 'Rights' },
  { value: 'housing', label: 'Housing' },
  { value: 'money', label: 'Money' },
  { value: 'health', label: 'Health' },
];

export default function Library() {
  const { c } = useTheme();
  const { library } = useShelter();
  const [filter, setFilter] = useState<'all' | LibraryArticle['category']>('all');
  const [open, setOpen] = useState<string | null>(null);

  const items = library.filter((a) => filter === 'all' || a.category === filter);

  return (
    <Screen title="Guides & resources" subtitle="Plain-language help for what comes next." back backLabel="House" headerRight={<QuickExit />}>
      <Segmented options={CATEGORIES} value={filter} onChange={setFilter} style={{ marginBottom: space.lg }} />

      <Group>
        {items.length === 0 ? <Row title="Nothing in this category yet" accessory="none" /> : null}
        {items.map((a) => (
          <View key={a.id}>
            <Row
              title={a.title}
              subtitle={a.summary}
              accessory="none"
              onPress={() => setOpen(open === a.id ? null : a.id)}
              right={<Ionicons name={open === a.id ? 'chevron-up' : 'chevron-down'} size={17} color={c.labelTertiary} />}
            />
            {open === a.id ? (
              <View style={{ paddingHorizontal: 16, paddingBottom: space.base, gap: space.sm }}>
                {a.body.split(/\n\s*\n/).map((para, i) => (
                  <Text key={i} variant="body" tone="secondary">
                    {para}
                  </Text>
                ))}
              </View>
            ) : null}
          </View>
        ))}
      </Group>
    </Screen>
  );
}
