import React from 'react';
import { StyleSheet, View } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { StaffScreen, Group, Row, Button, Badge } from '../../src/components';
import { Text, useTheme, space } from '../../src/theme';
import { useBackend, useStaffInbox } from '../../src/data';
import type { PublicMessage } from '../../src/data';
import { relativeTime, formatPhone } from '../../src/lib/contact';

const TOPIC: Record<PublicMessage['topic'], string> = {
  general: 'General',
  donation: 'Donating',
  volunteer: 'Volunteering',
  training: 'Training',
};

export default function StaffInbox() {
  const { c } = useTheme();
  const api = useBackend();
  const inbox = useStaffInbox();

  return (
    <StaffScreen
      title="Inbox"
      subtitle="Guest messages are identified by access code only."
    >
      <View style={styles.columns}>
        <View style={styles.col}>
          <Group
            header={inbox.unreadThreads > 0 ? `From guests — ${inbox.unreadThreads} unread` : 'From guests'}
          >
            {inbox.threads.length === 0 ? (
              <Row title="No guest messages" accessory="none" />
            ) : (
              inbox.threads.map((t) => {
                const latest = t.messages.at(-1);
                return (
                  <Row
                    key={t.id}
                    title={t.guestCode}
                    subtitle={`${t.topic} · ${latest?.from === 'advocate' ? 'You: ' : ''}${latest?.body ?? ''}`}
                    value={relativeTime(latest?.createdAt ?? t.createdAt)}
                    onPress={() => router.push(`/staff-thread/${t.id}`)}
                    icon={t.urgent ? 'alert-circle' : 'person'}
                    accent={t.urgent ? 'crisis' : 'grey'}
                    right={t.unreadForStaff > 0 ? <Badge label="New" tone="crisis" /> : undefined}
                  />
                );
              })
            )}
          </Group>
        </View>

        <View style={styles.col}>
          <Group
            header={
              inbox.openPublic > 0
                ? `From the community — ${inbox.openPublic} open`
                : 'From the community'
            }
          >
            {inbox.publicMessages.length === 0 ? (
              <Row title="Nothing from the public app" accessory="none" />
            ) : (
              inbox.publicMessages.map((m) => (
                <View key={m.id} style={[styles.public, m.handled && { opacity: 0.5 }]}>
                  <View style={styles.publicHead}>
                    <Badge label={TOPIC[m.topic]} tone={m.handled ? 'grey' : 'tint'} />
                    <Text variant="caption" tone="tertiary">
                      {relativeTime(m.createdAt)}
                    </Text>
                  </View>

                  <Text variant="subhead" style={{ marginTop: space.sm }}>
                    {m.body}
                  </Text>

                  <View style={styles.publicFoot}>
                    <View style={{ flex: 1 }}>
                      <Text variant="footnote" tone="secondary">
                        {m.name ?? 'Anonymous'}
                      </Text>
                      <Text variant="footnote" tone="tertiary">
                        {m.contactBack
                          ? m.contactBack.includes('@')
                            ? m.contactBack
                            : formatPhone(m.contactBack)
                          : 'No reply details left'}
                      </Text>
                    </View>
                    <Button
                      label={m.handled ? 'Reopen' : 'Mark handled'}
                      size="sm"
                      variant={m.handled ? 'plain' : 'tinted'}
                      onPress={() => api.setPublicMessageHandled(m.id, !m.handled)}
                    />
                  </View>
                </View>
              ))
            )}
          </Group>

          {inbox.publicMessages.length > 0 ? (
            <View style={styles.legend}>
              <Ionicons name="lock-closed" size={12} color={c.labelTertiary} />
              <Text variant="caption" tone="tertiary">
                Community messages are not connected to any guest record.
              </Text>
            </View>
          ) : null}
        </View>
      </View>
    </StaffScreen>
  );
}

const styles = StyleSheet.create({
  columns: { flexDirection: 'row', flexWrap: 'wrap', gap: space.xl },
  col: { flexGrow: 1, flexBasis: 360, minWidth: 280 },
  public: { paddingHorizontal: 16, paddingVertical: space.md },
  publicHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  publicFoot: { flexDirection: 'row', alignItems: 'center', gap: space.md, marginTop: space.md },
  legend: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: space.sm, marginHorizontal: 16 },
});
