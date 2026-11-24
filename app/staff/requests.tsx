import React from 'react';
import { StyleSheet, View } from 'react-native';

import { StaffScreen, Group, Row, Button, Badge } from '../../src/components';
import { Text, space } from '../../src/theme';
import { useBackend, useShelter } from '../../src/data';
import type { CommunityRequest } from '../../src/data';
import { relativeTime, formatPhone } from '../../src/lib/contact';

export default function Requests() {
  const api = useBackend();
  const { communityRequests } = useShelter();

  const sorted = [...communityRequests].sort(
    (a, b) => Number(a.handled) - Number(b.handled) || b.createdAt - a.createdAt,
  );

  const column = (kind: CommunityRequest['kind'], title: string, empty: string) => {
    const items = sorted.filter((r) => r.kind === kind);
    const open = items.filter((r) => !r.handled).length;
    return (
      <View style={styles.col}>
        <Group header={open > 0 ? `${title} — ${open} open` : title}>
          {items.length === 0 ? (
            <Row title={empty} accessory="none" />
          ) : (
            items.map((r) => (
              <View key={r.id} style={[styles.card, r.handled && { opacity: 0.5 }]}>
                <View style={styles.head}>
                  <Badge label={r.summary} tone={r.handled ? 'grey' : 'tint'} />
                  <Text variant="caption" tone="tertiary">
                    {relativeTime(r.createdAt)}
                  </Text>
                </View>
                <View style={{ marginTop: space.sm, gap: 2 }}>
                  {r.fields.map((f) => (
                    <Text key={f.label} variant="subhead">
                      <Text variant="subhead" tone="secondary">
                        {f.label}:{' '}
                      </Text>
                      {f.value}
                    </Text>
                  ))}
                </View>
                <View style={styles.foot}>
                  <View style={{ flex: 1 }}>
                    <Text variant="footnote" tone="secondary">
                      {r.name ?? 'Anonymous'}
                    </Text>
                    <Text variant="footnote" tone="tertiary">
                      {r.contactBack ? (r.contactBack.includes('@') ? r.contactBack : formatPhone(r.contactBack)) : 'No reply details'}
                    </Text>
                  </View>
                  <Button
                    label={r.handled ? 'Reopen' : 'Mark handled'}
                    size="sm"
                    variant={r.handled ? 'plain' : 'tinted'}
                    onPress={() => api.setCommunityRequestHandled(r.id, !r.handled)}
                  />
                </View>
              </View>
            ))
          )}
        </Group>
      </View>
    );
  };

  return (
    <StaffScreen title="Volunteers & training" subtitle="Submitted through the public app. Details are used once, to reply.">
      <View style={styles.columns}>
        {column('volunteer', 'Volunteer sign-ups', 'No sign-ups yet')}
        {column('training', 'Training requests', 'No requests yet')}
      </View>
    </StaffScreen>
  );
}

const styles = StyleSheet.create({
  columns: { flexDirection: 'row', flexWrap: 'wrap', gap: space.xl },
  col: { flexGrow: 1, flexBasis: 360, minWidth: 280 },
  card: { paddingHorizontal: 16, paddingVertical: space.md },
  head: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  foot: { flexDirection: 'row', alignItems: 'center', gap: space.md, marginTop: space.md },
});
