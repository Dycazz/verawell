import React from 'react';
import { StyleSheet, View } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { StaffScreen, Card, Button, Badge, Stagger, Springy, SectionHeader } from '../../src/components';
import { Text, useTheme, radius, space, fonts } from '../../src/theme';
import { useBackend, useStaffInbox } from '../../src/data';
import type { AdvocateThread, PublicMessage } from '../../src/data';
import { relativeTime, formatPhone } from '../../src/lib/contact';

const TOPIC_LABEL: Record<PublicMessage['topic'], string> = {
  general: 'General',
  donation: 'Donating',
  volunteer: 'Volunteering',
  training: 'Training',
};

export default function StaffInbox() {
  const inbox = useStaffInbox();

  return (
    <StaffScreen
      eyebrow="Console"
      title="Inbox"
      subtitle="Guest messages are identified by access code only. Community messages come from the public app."
    >
      <View style={styles.columns}>
        <View style={styles.col}>
          <Stagger index={1}>
            <SectionHeader
              title="From guests"
              action={
                inbox.unreadThreads > 0 ? <Badge label={`${inbox.unreadThreads} unread`} tone="clay" /> : undefined
              }
            />
            {inbox.threads.length === 0 ? (
              <Card tone="alt" flat>
                <Text variant="callout" tone="muted">
                  No guest messages.
                </Text>
              </Card>
            ) : (
              <Card padded={false}>
                {inbox.threads.map((t, i) => (
                  <ThreadRow key={t.id} thread={t} last={i === inbox.threads.length - 1} />
                ))}
              </Card>
            )}
          </Stagger>
        </View>

        <View style={styles.col}>
          <Stagger index={2}>
            <SectionHeader
              title="From the community"
              action={inbox.openPublic > 0 ? <Badge label={`${inbox.openPublic} open`} tone="clay" /> : undefined}
            />
            {inbox.publicMessages.length === 0 ? (
              <Card tone="alt" flat>
                <Text variant="callout" tone="muted">
                  Nothing from the public app.
                </Text>
              </Card>
            ) : (
              <View style={{ gap: space.md }}>
                {inbox.publicMessages.map((m) => (
                  <PublicCard key={m.id} message={m} />
                ))}
              </View>
            )}
          </Stagger>
        </View>
      </View>
    </StaffScreen>
  );
}

function ThreadRow({ thread, last }: { thread: AdvocateThread; last: boolean }) {
  const { c } = useTheme();
  const latest = thread.messages.at(-1);
  const unread = thread.unreadForStaff > 0;

  return (
    <Springy
      onPress={() => router.push(`/staff-thread/${thread.id}`)}
      scaleTo={0.99}
      accessibilityRole="button"
      accessibilityLabel={`${thread.guestCode}, ${thread.topic}${unread ? ', unread' : ''}`}
      style={StyleSheet.flatten([
        styles.threadRow,
        !last && { borderBottomWidth: StyleSheet.hairlineWidth * 2, borderBottomColor: c.line },
      ])}
    >
      <View style={[styles.codeChip, { backgroundColor: thread.urgent ? c.crisisSoft : c.surfaceAlt }]}>
        <Ionicons
          name={thread.urgent ? 'alert-circle' : 'person-outline'}
          size={17}
          color={thread.urgent ? c.crisis : c.inkMuted}
        />
      </View>

      <View style={{ flex: 1 }}>
        <View style={styles.threadHead}>
          <Text style={{ fontFamily: fonts.bodySemi, fontSize: 14, color: c.ink, letterSpacing: 0.5 }}>
            {thread.guestCode}
          </Text>
          <Text variant="caption" tone="faint">
            {relativeTime(latest?.createdAt ?? thread.createdAt)}
          </Text>
        </View>
        <Text variant="caption" tone="muted" numberOfLines={1} style={{ marginTop: 2 }}>
          {thread.topic} · {latest?.from === 'guest' ? '' : 'You: '}
          {latest?.body}
        </Text>
      </View>

      {unread ? <Badge label="New" tone="clay" /> : null}
      <Ionicons name="chevron-forward" size={17} color={c.inkFaint} />
    </Springy>
  );
}

function PublicCard({ message }: { message: PublicMessage }) {
  const { c } = useTheme();
  const api = useBackend();

  return (
    <Card style={message.handled ? { opacity: 0.6 } : undefined}>
      <View style={styles.publicHead}>
        <Badge label={TOPIC_LABEL[message.topic]} tone={message.handled ? 'neutral' : 'primary'} />
        <Text variant="caption" tone="faint">
          {relativeTime(message.createdAt)}
        </Text>
      </View>

      <Text variant="callout" style={{ marginTop: space.md }}>
        {message.body}
      </Text>

      <View style={[styles.publicMeta, { borderTopColor: c.line }]}>
        <View style={{ flex: 1 }}>
          <Text variant="caption" tone="muted">
            {message.name ?? 'Anonymous'}
          </Text>
          {message.contactBack ? (
            <Text variant="caption" tone="faint" style={{ marginTop: 1 }}>
              {message.contactBack.includes('@') ? message.contactBack : formatPhone(message.contactBack)}
            </Text>
          ) : (
            <Text variant="caption" tone="faint" style={{ marginTop: 1 }}>
              No reply details left
            </Text>
          )}
        </View>

        <Button
          label={message.handled ? 'Reopen' : 'Mark handled'}
          size="sm"
          variant={message.handled ? 'ghost' : 'soft'}
          icon={message.handled ? 'refresh' : 'checkmark'}
          onPress={() => api.setPublicMessageHandled(message.id, !message.handled)}
        />
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  columns: { flexDirection: 'row', flexWrap: 'wrap', gap: space.xl },
  col: { flexGrow: 1, flexBasis: 360, minWidth: 280 },
  threadRow: { flexDirection: 'row', alignItems: 'center', gap: space.md, padding: space.base },
  codeChip: { width: 38, height: 38, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center' },
  threadHead: { flexDirection: 'row', alignItems: 'center', gap: space.sm },
  publicHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  publicMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
    marginTop: space.lg,
    paddingTop: space.md,
    borderTopWidth: StyleSheet.hairlineWidth * 2,
  },
});
