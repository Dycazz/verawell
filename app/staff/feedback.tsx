import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { StaffScreen, Group, Row, Button, Field, Badge } from '../../src/components';
import { Text, space } from '../../src/theme';
import { useBackend, useShelter } from '../../src/data';
import type { Feedback } from '../../src/data';
import { relativeTime } from '../../src/lib/contact';

const KIND: Record<Feedback['kind'], { label: string; tone: 'crisis' | 'tint' | 'positive' }> = {
  concern: { label: 'Concern', tone: 'crisis' },
  idea: { label: 'Idea', tone: 'tint' },
  thanks: { label: 'Thanks', tone: 'positive' },
};

export default function StaffFeedback() {
  const api = useBackend();
  const { feedback } = useShelter();
  const [drafts, setDrafts] = useState<Record<string, string>>({});

  const rank = { new: 0, seen: 1, resolved: 2 } as const;
  const sorted = [...feedback].sort((a, b) => rank[a.status] - rank[b.status] || b.createdAt - a.createdAt);

  return (
    <StaffScreen
      title="Feedback"
      subtitle="Anonymous — there is no author to find. A reply you publish is shown to every guest as “You said, we did”."
    >
      <View style={styles.wrap}>
        <Group header={`${sorted.length} ${sorted.length === 1 ? 'submission' : 'submissions'}`}>
          {sorted.length === 0 ? (
            <Row title="Nothing yet" accessory="none" />
          ) : (
            sorted.map((f) => (
              <View key={f.id} style={[styles.card, f.status === 'resolved' && { opacity: 0.6 }]}>
                <View style={styles.head}>
                  <View style={{ flexDirection: 'row', gap: space.sm }}>
                    <Badge label={KIND[f.kind].label} tone={KIND[f.kind].tone} />
                    {f.status === 'new' ? <Badge label="New" tone="crisis" /> : null}
                    {f.publicReply ? <Badge label="Reply shared" tone="positive" /> : null}
                  </View>
                  <Text variant="caption" tone="tertiary">
                    {relativeTime(f.createdAt)}
                  </Text>
                </View>

                <Text variant="subhead" style={{ marginTop: space.sm }}>
                  {f.body}
                </Text>

                <View style={{ marginTop: space.md, gap: space.sm }}>
                  <Field
                    placeholder="Public reply (optional) — shown to all guests"
                    value={drafts[f.id] ?? f.publicReply ?? ''}
                    onChangeText={(v) => setDrafts((d) => ({ ...d, [f.id]: v }))}
                  />
                  <View style={styles.actions}>
                    {drafts[f.id] !== undefined && drafts[f.id] !== (f.publicReply ?? '') ? (
                      <Button
                        label="Publish reply"
                        size="sm"
                        variant="tinted"
                        onPress={async () => {
                          await api.updateFeedback(f.id, {
                            publicReply: drafts[f.id].trim() || undefined,
                            status: 'resolved',
                          });
                          setDrafts((d) => {
                            const { [f.id]: _gone, ...rest } = d;
                            return rest;
                          });
                        }}
                      />
                    ) : null}
                    {f.status === 'new' ? (
                      <Button label="Mark seen" size="sm" variant="plain" onPress={() => api.updateFeedback(f.id, { status: 'seen' })} />
                    ) : null}
                    {f.status !== 'resolved' ? (
                      <Button label="Resolve" size="sm" variant="plain" onPress={() => api.updateFeedback(f.id, { status: 'resolved' })} />
                    ) : (
                      <Button label="Reopen" size="sm" variant="plain" onPress={() => api.updateFeedback(f.id, { status: 'seen' })} />
                    )}
                  </View>
                </View>
              </View>
            ))
          )}
        </Group>
      </View>
    </StaffScreen>
  );
}

const styles = StyleSheet.create({
  wrap: { maxWidth: 760 },
  card: { paddingHorizontal: 16, paddingVertical: space.md },
  head: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  actions: { flexDirection: 'row', gap: space.sm, flexWrap: 'wrap' },
});
