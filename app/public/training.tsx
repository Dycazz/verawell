import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, View } from 'react-native';

import { Screen, Group, Button, Field, CRISIS_DOCK_HEIGHT } from '../../src/components';
import { Text, space } from '../../src/theme';
import { useBackend } from '../../src/data';

export default function Training() {
  const api = useBackend();

  const [org, setOrg] = useState('');
  const [name, setName] = useState('');
  const [contact, setContact] = useState('');
  const [topic, setTopic] = useState('');
  const [size, setSize] = useState('');
  const [timing, setTiming] = useState('');
  const [error, setError] = useState<string>();
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  async function submit() {
    if (!contact.trim() || topic.trim().length < 3) {
      setError('Add a way to reach you and what you would like covered.');
      return;
    }
    setError(undefined);
    setSending(true);
    await api.submitCommunityRequest({
      kind: 'training',
      name: name.trim() || undefined,
      contactBack: contact.trim(),
      summary: org.trim() || 'Individual',
      fields: [
        { label: 'Organisation', value: org.trim() || 'Individual' },
        { label: 'Topic', value: topic.trim() },
        { label: 'Group size', value: size.trim() || 'Not given' },
        { label: 'Preferred timing', value: timing.trim() || 'Flexible' },
      ],
    });
    setSending(false);
    setSent(true);
  }

  if (sent) {
    return (
      <Screen title="Request sent" back backLabel="Help" bottomInset={CRISIS_DOCK_HEIGHT + space.lg}>
        <Group padded footer="Training requests are reviewed by staff, usually within a week.">
          <Text variant="body">Thank you. We'll reply to the contact you left.</Text>
        </Group>
      </Screen>
    );
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <Screen
        title="Request a training"
        subtitle="Staff can lead sessions on recognising abuse, responding well, and supporting survivors."
        back
        backLabel="Help"
        bottomInset={CRISIS_DOCK_HEIGHT + space.lg}
      >
        <Group padded>
          <View style={{ gap: space.base }}>
            <Field label="Organisation (optional)" value={org} onChangeText={setOrg} autoCapitalize="words" />
            <Field label="Your name (optional)" value={name} onChangeText={setName} autoCapitalize="words" />
            <Field
              label="Phone or email"
              value={contact}
              onChangeText={setContact}
              autoCapitalize="none"
              keyboardType="email-address"
            />
            <Field
              label="What would you like covered?"
              multiline
              value={topic}
              onChangeText={setTopic}
              placeholder="e.g. Recognising signs of abuse for our front-desk team"
              error={error}
            />
            <Field label="Approximate group size" value={size} onChangeText={setSize} keyboardType="number-pad" />
            <Field label="Preferred timing" value={timing} onChangeText={setTiming} placeholder="Next quarter, weekday mornings…" />
            <Button label="Send request" full loading={sending} onPress={submit} />
          </View>
        </Group>
      </Screen>
    </KeyboardAvoidingView>
  );
}
