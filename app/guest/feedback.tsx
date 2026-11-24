import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { Screen, Group, Row, Button, Field, Segmented } from '../../src/components';
import { Text, useTheme, space } from '../../src/theme';
import { useBackend, useShelter } from '../../src/data';
import type { FeedbackKind } from '../../src/data';
import { QuickExit } from '../../src/safety';

const KINDS: { value: FeedbackKind; label: string }[] = [
  { value: 'concern', label: 'Concern' },
  { value: 'idea', label: 'Idea' },
  { value: 'thanks', label: 'Thanks' },
];

export default function Feedback() {
  const { c } = useTheme();
  const api = useBackend();
  const { feedback } = useShelter();

  const [kind, setKind] = useState<FeedbackKind>('idea');
  const [body, setBody] = useState('');
  const [error, setError] = useState<string>();
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const answered = feedback.filter((f) => f.publicReply);

  async function submit() {
    if (body.trim().length < 5) {
      setError('Write a little more so staff can act on it.');
      return;
    }
    setError(undefined);
    setSending(true);
    // Note what is *not* passed: no guest code, no session, nothing.
    await api.submitFeedback(kind, body.trim());
    setSending(false);
    setBody('');
    setSent(true);
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <Screen
        title="Feedback"
        subtitle="Anonymous. This isn't linked to your code, your room or your phone."
        back
        backLabel="House"
        headerRight={<QuickExit />}
      >
        <Group
          padded
          footer="Because it's anonymous, staff can't reply to you directly. Answers appear below as “You said, we did”."
        >
          {sent ? (
            <View style={{ gap: space.md }}>
              <View style={{ flexDirection: 'row', gap: space.sm, alignItems: 'center' }}>
                <Ionicons name="checkmark-circle" size={20} color={c.positive} />
                <Text variant="body">Sent. Thank you.</Text>
              </View>
              <Button label="Share something else" variant="tinted" size="sm" onPress={() => setSent(false)} />
            </View>
          ) : (
            <View style={{ gap: space.base }}>
              <Segmented options={KINDS} value={kind} onChange={setKind} />
              <Field
                label="What would you like to say?"
                multiline
                value={body}
                onChangeText={setBody}
                error={error}
              />
              <Button label="Send anonymously" full loading={sending} onPress={submit} />
            </View>
          )}
        </Group>

        {answered.length > 0 ? (
          <View style={{ marginTop: space['2xl'] }}>
            <Group header="You said, we did">
              {answered.map((f) => (
                <Row key={f.id} icon="chatbubbles" accent="positive" title={f.publicReply!} subtitle={`In reply to: “${f.body}”`} accessory="none" />
              ))}
            </Group>
          </View>
        ) : null}
      </Screen>
    </KeyboardAvoidingView>
  );
}
