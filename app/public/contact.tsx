import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { Screen, Card, Button, Field, Stagger, Springy, SectionHeader, CRISIS_DOCK_HEIGHT } from '../../src/components';
import { Text, useTheme, radius, space } from '../../src/theme';
import { useShelter, useBackend } from '../../src/data';
import type { PublicMessage } from '../../src/data';
import { callNumber, formatPhone } from '../../src/lib/contact';

const TOPICS: { key: PublicMessage['topic']; label: string }[] = [
  { key: 'general', label: 'General' },
  { key: 'donation', label: 'Donating' },
  { key: 'volunteer', label: 'Volunteering' },
  { key: 'training', label: 'Training' },
];

export default function Contact() {
  const { c } = useTheme();
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
      <Screen eyebrow="Contact" title="Message sent" bottomInset={CRISIS_DOCK_HEIGHT}>
        <Stagger index={1}>
          <Card tone="primary">
            <View style={[styles.tick, { backgroundColor: c.primary }]}>
              <Ionicons name="checkmark" size={24} color={c.onPrimary} />
            </View>
            <Text variant="heading" style={{ marginTop: space.base }}>
              Thank you
            </Text>
            <Text variant="callout" tone="muted" style={{ marginTop: space.sm }}>
              {contactBack.trim()
                ? 'An advocate will get back to you, usually within a business day.'
                : 'Your note is with the front office. You did not leave contact details, so we have no way to reply — call us if you need an answer.'}
            </Text>
            <Button
              label="Send another"
              variant="secondary"
              size="sm"
              style={{ marginTop: space.lg }}
              onPress={() => {
                setSent(false);
                setBody('');
                setName('');
                setContactBack('');
                setTopic('general');
              }}
            />
          </Card>
        </Stagger>
      </Screen>
    );
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <Screen
        eyebrow="Contact"
        title="Reach the shelter"
        subtitle="The office line is answered during business hours. The crisis line at the bottom of the screen is answered any time."
        bottomInset={CRISIS_DOCK_HEIGHT}
      >
        <Stagger index={1}>
          <Card>
            <View style={styles.head}>
              <View style={[styles.icon, { backgroundColor: c.primarySoft }]}>
                <Ionicons name="call-outline" size={20} color={c.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text variant="subhead">Front office</Text>
                <Text variant="caption" tone="muted">
                  Mon–Fri, 9am–5pm
                </Text>
              </View>
            </View>
            <Button
              label={formatPhone(profile.officePhone)}
              icon="call"
              full
              style={{ marginTop: space.base }}
              onPress={() => callNumber(profile.officePhone)}
            />
          </Card>
        </Stagger>

        <Stagger index={2} style={{ marginTop: space.xl }}>
          <SectionHeader title="Or send a message" />
          <Card>
            <View style={{ gap: space.lg }}>
              <View style={{ gap: space.sm }}>
                <Text variant="label" caps tone="faint">
                  What's it about
                </Text>
                <View style={styles.chips}>
                  {TOPICS.map((t) => {
                    const active = t.key === topic;
                    return (
                      <Springy
                        key={t.key}
                        onPress={() => setTopic(t.key)}
                        scaleTo={0.94}
                        accessibilityRole="button"
                        accessibilityState={{ selected: active }}
                        accessibilityLabel={t.label}
                        style={StyleSheet.flatten([
                          styles.chip,
                          {
                            backgroundColor: active ? c.primary : c.surfaceAlt,
                            borderColor: active ? c.primary : c.line,
                          },
                        ])}
                      >
                        <Text variant="label" style={{ color: active ? c.onPrimary : c.inkMuted }}>
                          {t.label}
                        </Text>
                      </Springy>
                    );
                  })}
                </View>
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

              <Button
                label="Send message"
                icon="send"
                full
                loading={sending}
                onPress={submit}
              />
            </View>
          </Card>
        </Stagger>
      </Screen>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  head: { flexDirection: 'row', alignItems: 'center', gap: space.md },
  icon: { width: 40, height: 40, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center' },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: space.sm },
  chip: {
    paddingHorizontal: space.base,
    height: 38,
    borderRadius: radius.pill,
    borderWidth: 1.5,
    justifyContent: 'center',
  },
  tick: { width: 46, height: 46, borderRadius: radius.pill, alignItems: 'center', justifyContent: 'center' },
});
