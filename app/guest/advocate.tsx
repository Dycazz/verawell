import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, StyleSheet, Switch, View } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { Screen, Card, Button, Field, Badge, LiveDot, Stagger, Springy, SectionHeader } from '../../src/components';
import { Text, useTheme, radius, space } from '../../src/theme';
import { useBackend, useShelter, useThreadsForCode } from '../../src/data';
import type { AdvocateThread } from '../../src/data';
import { relativeTime } from '../../src/lib/contact';
import { QuickExit, useSession } from '../../src/safety';

export default function Advocate() {
  const { c } = useTheme();
  const api = useBackend();
  const { shift } = useShelter();
  const { session } = useSession();
  const code = session?.role === 'guest' ? session.code : null;
  const threads = useThreadsForCode(code);

  const [composing, setComposing] = useState(false);
  const [topic, setTopic] = useState('');
  const [body, setBody] = useState('');
  const [urgent, setUrgent] = useState(false);
  const [error, setError] = useState<string>();
  const [sending, setSending] = useState(false);

  const showForm = composing || threads.length === 0;

  async function send() {
    if (body.trim().length < 3) {
      setError('Add a short note so an advocate knows how to help.');
      return;
    }
    if (!code) return;

    setError(undefined);
    setSending(true);
    const id = await api.openThread(code, topic.trim() || 'General', body.trim(), urgent);
    setSending(false);

    setTopic('');
    setBody('');
    setUrgent(false);
    setComposing(false);
    router.push(`/guest-thread/${id}`);
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <Screen
        eyebrow="Advocate"
        title="Talk to someone"
        subtitle="Messages go to whoever is on shift. Staff see your code, never a name."
        headerRight={<QuickExit />}
      >
        <Stagger index={1}>
          <Card tone={shift.advocatesOnShift > 0 ? 'primary' : 'caution'} flat>
            <View style={styles.statusRow}>
              <LiveDot color={shift.advocatesOnShift > 0 ? c.onShift : c.caution} />
              <Text variant="callout" style={{ flex: 1 }}>
                {shift.advocatesOnShift > 0
                  ? `${shift.advocatesOnShift} ${shift.advocatesOnShift === 1 ? 'advocate is' : 'advocates are'} on shift right now.`
                  : 'No advocate is on shift. Your message will be waiting for the next one.'}
              </Text>
            </View>
          </Card>
        </Stagger>

        {threads.length > 0 ? (
          <Stagger index={2} style={{ marginTop: space.xl }}>
            <SectionHeader
              title="Your conversations"
              action={
                !composing ? (
                  <Button label="New" icon="add" size="sm" variant="soft" onPress={() => setComposing(true)} />
                ) : undefined
              }
            />
            <Card padded={false}>
              {threads.map((t, i) => (
                <ThreadRow key={t.id} thread={t} last={i === threads.length - 1} />
              ))}
            </Card>
          </Stagger>
        ) : null}

        {showForm ? (
          <Stagger index={3} style={{ marginTop: space.xl }}>
            <SectionHeader
              title={threads.length > 0 ? 'New message' : 'Send a message'}
              action={
                composing && threads.length > 0 ? (
                  <Button label="Cancel" size="sm" variant="ghost" onPress={() => setComposing(false)} />
                ) : undefined
              }
            />
            <Card>
              <View style={{ gap: space.lg }}>
                <Field
                  label="Subject (optional)"
                  value={topic}
                  onChangeText={setTopic}
                  placeholder="Bus pass, room change, appointment…"
                />
                <Field
                  label="Message"
                  multiline
                  value={body}
                  onChangeText={setBody}
                  placeholder="What do you need?"
                  error={error}
                />

                <View style={[styles.urgentRow, { borderColor: urgent ? c.crisis : c.line }]}>
                  <Ionicons
                    name="alert-circle-outline"
                    size={20}
                    color={urgent ? c.crisis : c.inkFaint}
                  />
                  <View style={{ flex: 1 }}>
                    <Text variant="bodyStrong">This can't wait</Text>
                    <Text variant="caption" tone="muted" style={{ marginTop: 1 }}>
                      Puts it at the top of the advocate's list.
                    </Text>
                  </View>
                  <Switch
                    value={urgent}
                    onValueChange={setUrgent}
                    trackColor={{ true: c.crisis, false: c.lineStrong }}
                    thumbColor={c.surface}
                    accessibilityLabel="Mark as urgent"
                  />
                </View>

                <Button label="Send" icon="send" full loading={sending} onPress={send} />

                <Text variant="caption" tone="faint">
                  For an emergency, call 911 or go to the front office. This is not monitored
                  second by second.
                </Text>
              </View>
            </Card>
          </Stagger>
        ) : null}
      </Screen>
    </KeyboardAvoidingView>
  );
}

function ThreadRow({ thread, last }: { thread: AdvocateThread; last: boolean }) {
  const { c } = useTheme();
  const latest = thread.messages.at(-1);

  return (
    <Springy
      onPress={() => router.push(`/guest-thread/${thread.id}`)}
      scaleTo={0.99}
      accessibilityRole="button"
      accessibilityLabel={`${thread.topic}. ${thread.unreadForGuest > 0 ? 'New reply. ' : ''}${latest?.body ?? ''}`}
      style={StyleSheet.flatten([
        styles.threadRow,
        !last && { borderBottomWidth: StyleSheet.hairlineWidth * 2, borderBottomColor: c.line },
      ])}
    >
      <View
        style={[
          styles.threadIcon,
          { backgroundColor: thread.unreadForGuest > 0 ? c.primarySoft : c.surfaceAlt },
        ]}
      >
        <Ionicons
          name="chatbubble-outline"
          size={18}
          color={thread.unreadForGuest > 0 ? c.primary : c.inkFaint}
        />
      </View>

      <View style={{ flex: 1 }}>
        <View style={styles.threadHead}>
          <Text variant="bodyStrong" numberOfLines={1} style={{ flex: 1 }}>
            {thread.topic}
          </Text>
          <Text variant="caption" tone="faint">
            {relativeTime(latest?.createdAt ?? thread.createdAt)}
          </Text>
        </View>
        <Text variant="caption" tone="muted" numberOfLines={1} style={{ marginTop: 2 }}>
          {latest?.from === 'advocate' ? 'Advocate: ' : ''}
          {latest?.body}
        </Text>
      </View>

      {thread.unreadForGuest > 0 ? <Badge label="New" tone="primary" /> : null}
      {thread.urgent ? <Ionicons name="alert-circle" size={16} color={c.crisis} /> : null}
    </Springy>
  );
}

const styles = StyleSheet.create({
  statusRow: { flexDirection: 'row', alignItems: 'center', gap: space.md },
  urgentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
    padding: space.base,
    borderRadius: radius.md,
    borderWidth: 1.5,
  },
  threadRow: { flexDirection: 'row', alignItems: 'center', gap: space.md, padding: space.base },
  threadIcon: { width: 38, height: 38, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center' },
  threadHead: { flexDirection: 'row', alignItems: 'center', gap: space.sm },
});
