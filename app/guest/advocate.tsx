import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, StyleSheet, Switch, View } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { Screen, Group, Row, Button, Field, Badge, LiveDot } from '../../src/components';
import { Text, useTheme, space } from '../../src/theme';
import { useBackend, useShelter, useThreadsForCode } from '../../src/data';
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
        title="Advocate"
        subtitle="Messages go to whoever is on shift. Staff see your code, never a name."
        headerRight={<QuickExit />}
      >
        <Group padded>
          <View style={styles.statusRow}>
            <LiveDot color={shift.advocatesOnShift > 0 ? c.positive : c.warn} />
            <Text variant="subhead" style={{ flex: 1 }}>
              {shift.advocatesOnShift > 0
                ? `${shift.advocatesOnShift} ${shift.advocatesOnShift === 1 ? 'advocate is' : 'advocates are'} on shift right now.`
                : 'No advocate is on shift. Your message will be waiting for the next one.'}
            </Text>
          </View>
        </Group>

        {threads.length > 0 ? (
          <View style={{ marginTop: space['2xl'] }}>
            <Group header="Your conversations">
              {threads.map((t) => {
                const latest = t.messages.at(-1);
                return (
                  <Row
                    key={t.id}
                    title={t.topic}
                    subtitle={`${latest?.from === 'advocate' ? 'Advocate: ' : ''}${latest?.body ?? ''}`}
                    value={relativeTime(latest?.createdAt ?? t.createdAt)}
                    onPress={() => router.push(`/guest-thread/${t.id}`)}
                    right={
                      t.unreadForGuest > 0 ? (
                        <Badge label="New" tone="tint" />
                      ) : t.urgent ? (
                        <Ionicons name="alert-circle" size={17} color={c.crisis} />
                      ) : undefined
                    }
                  />
                );
              })}
              {!composing ? <Row icon="create" title="New message" onPress={() => setComposing(true)} /> : null}
            </Group>
          </View>
        ) : null}

        {showForm ? (
          <View style={{ marginTop: space['2xl'] }}>
            <Group
              padded
              header={threads.length > 0 ? 'New message' : 'Send a message'}
              footer="For an emergency, call 911 or go to the front office. This is not monitored second by second."
            >
              <View style={{ gap: space.base }}>
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

                <View style={styles.urgentRow}>
                  <View style={{ flex: 1 }}>
                    <Text variant="body">This can't wait</Text>
                    <Text variant="footnote" tone="secondary" style={{ marginTop: 1 }}>
                      Puts it at the top of the advocate's list.
                    </Text>
                  </View>
                  <Switch
                    value={urgent}
                    onValueChange={setUrgent}
                    trackColor={{ true: c.crisis, false: c.fillStrong }}
                thumbColor="#FFFFFF"
                    accessibilityLabel="Mark as urgent"
                  />
                </View>

                <Button label="Send" full loading={sending} onPress={send} />
                {threads.length > 0 ? (
                  <Button label="Cancel" variant="plain" onPress={() => setComposing(false)} />
                ) : null}
              </View>
            </Group>
          </View>
        ) : null}
      </Screen>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  statusRow: { flexDirection: 'row', alignItems: 'center', gap: space.md },
  urgentRow: { flexDirection: 'row', alignItems: 'center', gap: space.md },
});
