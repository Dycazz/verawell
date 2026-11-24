import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, View } from 'react-native';

import { Screen, Group, Button, Field, Springy, CRISIS_DOCK_HEIGHT } from '../../src/components';
import { Text, useTheme, radius, space } from '../../src/theme';
import { useBackend } from '../../src/data';

const INTERESTS = ['Donations & drives', 'Meals', 'Childcare', 'Driving', 'Skills teaching', 'Events', 'Office help'];

export default function Volunteer() {
  const { c } = useTheme();
  const api = useBackend();

  const [name, setName] = useState('');
  const [contact, setContact] = useState('');
  const [picked, setPicked] = useState<string[]>([]);
  const [availability, setAvailability] = useState('');
  const [note, setNote] = useState('');
  const [error, setError] = useState<string>();
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const toggle = (i: string) => setPicked((p) => (p.includes(i) ? p.filter((x) => x !== i) : [...p, i]));

  async function submit() {
    if (!contact.trim()) {
      setError('We need a phone or email to reach you about volunteering.');
      return;
    }
    setError(undefined);
    setSending(true);
    await api.submitCommunityRequest({
      kind: 'volunteer',
      name: name.trim() || undefined,
      contactBack: contact.trim(),
      summary: picked.length ? picked.join(', ') : 'Open to anything',
      fields: [
        { label: 'Interests', value: picked.join(', ') || 'Open to anything' },
        { label: 'Availability', value: availability.trim() || 'Not given' },
        ...(note.trim() ? [{ label: 'Note', value: note.trim() }] : []),
      ],
    });
    setSending(false);
    setSent(true);
  }

  if (sent) {
    return (
      <Screen title="Thank you" back backLabel="Help" bottomInset={CRISIS_DOCK_HEIGHT + space.lg}>
        <Group padded footer="Your details go to the volunteer coordinator only, and are used once to reach you.">
          <Text variant="body">Your sign-up is with the volunteer coordinator. Expect to hear back within a few days.</Text>
        </Group>
      </Screen>
    );
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <Screen
        title="Volunteer"
        subtitle="Tell us what you'd enjoy and when you're free."
        back
        backLabel="Help"
        bottomInset={CRISIS_DOCK_HEIGHT + space.lg}
      >
        <Group padded>
          <View style={{ gap: space.base }}>
            <Field label="Your name (optional)" value={name} onChangeText={setName} autoCapitalize="words" />
            <Field
              label="Phone or email"
              value={contact}
              onChangeText={setContact}
              autoCapitalize="none"
              keyboardType="email-address"
              error={error}
            />

            <View>
              <Text variant="footnote" tone="secondary" style={{ marginBottom: 6 }}>
                What interests you
              </Text>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: space.sm }}>
                {INTERESTS.map((i) => {
                  const on = picked.includes(i);
                  return (
                    <Springy
                      key={i}
                      onPress={() => toggle(i)}
                      scaleTo={0.96}
                      accessibilityRole="button"
                      accessibilityState={{ selected: on }}
                      accessibilityLabel={i}
                      style={{
                        paddingHorizontal: space.md,
                        paddingVertical: space.sm,
                        borderRadius: radius.md,
                        backgroundColor: on ? c.tint : c.fill,
                      }}
                    >
                      <Text variant="subhead" style={{ color: on ? c.onTint : c.label }}>
                        {i}
                      </Text>
                    </Springy>
                  );
                })}
              </View>
            </View>

            <Field
              label="When you're free"
              value={availability}
              onChangeText={setAvailability}
              placeholder="Weekday evenings, most Saturdays…"
            />
            <Field label="Anything else (optional)" multiline value={note} onChangeText={setNote} />

            <Button label="Sign up" full loading={sending} onPress={submit} />
          </View>
        </Group>
      </Screen>
    </KeyboardAvoidingView>
  );
}
