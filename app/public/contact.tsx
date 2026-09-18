import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, View } from 'react-native';

import { Screen, Group, Row, Button, Field, Segmented, CRISIS_DOCK_HEIGHT } from '../../src/components';
import { Text, space } from '../../src/theme';
import { useShelter, useBackend } from '../../src/data';
import type { PublicMessage } from '../../src/data';
import { callNumber, formatPhone } from '../../src/lib/contact';

const TOPICS: { value: PublicMessage['topic']; label: string }[] = [
  { value: 'general', label: 'General' },
  { value: 'donation', label: 'Donating' },
  { value: 'volunteer', label: 'Helping' },
  { value: 'training', label: 'Training' },
];

export default function Contact() {
  const { profile } = useShelter();
  const api = useBackend();

  const [topic, setTopic] = useState<PublicMessage['topic']>('general');
  const [name, setName] = useState('');
  const [contactBack, setContactBack] = useState('');
  const [body, setBody] = useState('');
  const [error, setError] = useState<string>();
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  async function submit() {
    if (body.trim().length < 5) {
      setError('Please add a little more so we know how to help.');
      return;
    }
    setError(undefined);
    setSending(true);
    await api.submitPublicMessage({
      topic,
      body: body.trim(),
      name: name.trim() || undefined,
      contactBack: contactBack.trim() || undefined,
    });
    setSending(false);
    setSent(true);
  }

  if (sent) {
    return (
      <Screen title="Message sent" bottomInset={CRISIS_DOCK_HEIGHT + space.lg}>
        <Group
          padded
          footer={
            contactBack.trim()
              ? 'An advocate will get back to you, usually within a business day.'
              : 'You did not leave contact details, so we have no way to reply. Call the office if you need an answer.'
          }
        >
          <Text variant="body">Thank you — your note is with the front office.</Text>
          <Button
            label="Send another"
            variant="tinted"
            size="sm"
            style={{ marginTop: space.base }}
            onPress={() => {
              setSent(false);
              setBody('');
              setName('');
              setContactBack('');
              setTopic('general');
            }}
          />
        </Group>
      </Screen>
    );
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <Screen
        title="Contact"
        subtitle="The office line is answered during business hours. The crisis line at the bottom is answered any time."
        bottomInset={CRISIS_DOCK_HEIGHT + space.lg}
      >
        <Group header="By phone">
          <Row
            icon="call"
            title="Front office"
            subtitle="Mon–Fri, 9am–5pm"
            value={formatPhone(profile.officePhone)}
            onPress={() => callNumber(profile.officePhone)}
            accessory="none"
          />
        </Group>

        <View style={{ height: space['2xl'] }} />

        <Group padded header="Or send a message">
          <View style={{ gap: space.base }}>
            <View>
              <Text variant="footnote" tone="secondary" style={{ marginBottom: 6 }}>
                What it's about
              </Text>
              <Segmented options={TOPICS} value={topic} onChange={setTopic} />
            </View>

            <Field
              label="Message"
              multiline
              value={body}
              onChangeText={setBody}
              placeholder="How can we help?"
              error={error}
            />

            <Field
              label="Your name (optional)"
              value={name}
              onChangeText={setName}
              placeholder="Leave blank to stay anonymous"
              autoCapitalize="words"
            />

            <Field
              label="How to reach you (optional)"
              value={contactBack}
              onChangeText={setContactBack}
              placeholder="Email or phone"
              autoCapitalize="none"
              keyboardType="email-address"
              hint="Only add this if you want a reply. We use it once and don't add you to any list."
            />

            <Button label="Send message" full loading={sending} onPress={submit} />
          </View>
        </Group>
      </Screen>
    </KeyboardAvoidingView>
  );
}
