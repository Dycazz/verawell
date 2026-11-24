import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, View } from 'react-native';
import { router } from 'expo-router';

import { Screen, Group, Row, Button, Field, Badge } from '../../src/components';
import { space } from '../../src/theme';
import { useBackend, useThreadsForCode } from '../../src/data';
import { relativeTime } from '../../src/lib/contact';
import { QuickExit, useSession } from '../../src/safety';

export default function Helpdesk() {
  const api = useBackend();
  const { session } = useSession();
  const code = session?.role === 'guest' ? session.code : null;
  const threads = useThreadsForCode(code).filter((t) => t.channel === 'helpdesk');

  const [topic, setTopic] = useState('');
  const [body, setBody] = useState('');
  const [error, setError] = useState<string>();
  const [sending, setSending] = useState(false);

  async function send() {
    if (body.trim().length < 3) {
      setError('Add your question first.');
      return;
    }
    if (!code) return;
    setError(undefined);
    setSending(true);
    const id = await api.openThread(code, topic.trim() || 'Question', body.trim(), false, 'helpdesk');
    setSending(false);
    setTopic('');
    setBody('');
    router.push(`/guest-thread/${id}`);
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <Screen
        title="Help desk"
        subtitle="Quick questions — laundry, mail, guests, supplies. Answered during office hours."
        back
        backLabel="House"
        headerRight={<QuickExit />}
      >
        {threads.length > 0 ? (
          <View style={{ marginBottom: space['2xl'] }}>
            <Group header="Your questions">
              {threads.map((t) => {
                const latest = t.messages.at(-1);
                return (
                  <Row
                    key={t.id}
                    title={t.topic}
                    subtitle={`${latest?.from === 'advocate' ? 'Staff: ' : ''}${latest?.body ?? ''}`}
                    value={relativeTime(latest?.createdAt ?? t.createdAt)}
                    onPress={() => router.push(`/guest-thread/${t.id}`)}
                    right={t.unreadForGuest > 0 ? <Badge label="Reply" tone="tint" /> : undefined}
                  />
                );
              })}
            </Group>
          </View>
        ) : null}

        <Group
          padded
          header="Ask something"
          footer="For anything urgent use the Advocate tab, or call 911 in an emergency."
        >
          <View style={{ gap: space.base }}>
            <Field label="Subject (optional)" value={topic} onChangeText={setTopic} placeholder="Laundry, mail, supplies…" />
            <Field label="Question" multiline value={body} onChangeText={setBody} error={error} />
            <Button label="Send" full loading={sending} onPress={send} />
          </View>
        </Group>
      </Screen>
    </KeyboardAvoidingView>
  );
}
