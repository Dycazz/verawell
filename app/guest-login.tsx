import React, { useEffect, useMemo, useState } from 'react';
import { KeyboardAvoidingView, Platform, View } from 'react-native';
import { router } from 'expo-router';

import { Screen, Group, Row, Button, Field } from '../src/components';
import { Text, space, weight } from '../src/theme';
import { useBackend, useShelter } from '../src/data';
import { useSession, usePrivacy } from '../src/safety';

const LOCK_COPY: Record<string, string> = {
  idle: 'Signed out automatically after a few quiet minutes.',
  background: 'Signed out when the app went to the background.',
  'quick-exit': 'Signed out.',
  manual: 'Signed out.',
};

export default function GuestLogin() {
  const api = useBackend();
  const { codes } = useShelter();
  const { signIn, lastLockReason } = useSession();
  const { autoLockMinutes } = usePrivacy();

  const [code, setCode] = useState('');
  const [error, setError] = useState<string>();
  const [checking, setChecking] = useState(false);
  const [notice, setNotice] = useState<string | undefined>(
    lastLockReason ? LOCK_COPY[lastLockReason] : undefined,
  );

  useEffect(() => {
    if (code) setNotice(undefined);
  }, [code]);

  const demoCode = useMemo(() => codes.find((g) => g.active)?.code, [codes]);

  async function submit() {
    const entered = code.trim().toUpperCase();
    if (!entered) {
      setError('Enter the code from your advocate.');
      return;
    }
    setChecking(true);
    const ok = await api.verifyGuestCode(entered);
    setChecking(false);

    if (!ok) {
      setError("That code isn't active. Check it with any advocate — they can issue a new one.");
      return;
    }

    signIn({ role: 'guest', code: entered, label: codes.find((g) => g.code === entered)?.label });
    router.replace('/guest');
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <Screen
        back
        title="Guest sign in"
        subtitle="No name, no email, no phone number. The code is the only thing that identifies you."
        maxWidth={520}
      >
        <Group padded footer={notice}>
          <Field
            label="Access code"
            value={code}
            onChangeText={(t) => {
              setCode(t.toUpperCase());
              setError(undefined);
            }}
            placeholder="HARBOR-482"
            autoCapitalize="characters"
            autoCorrect={false}
            spellCheck={false}
            returnKeyType="go"
            onSubmitEditing={submit}
            error={error}
            style={{ fontSize: 20, letterSpacing: 2, ...weight('600') }}
          />
          <Button label="Sign in" full size="lg" loading={checking} style={{ marginTop: space.base }} onPress={submit} />
        </Group>

        <View style={{ marginTop: space['2xl'] }}>
          <Group header="What this app does and doesn't do">
            <Row icon="person" accent="grey" title="Never asks for your legal name, birthday, or ID." accessory="none" />
            <Row icon="location" accent="grey" title="Never tracks where you are, foreground or background." accessory="none" />
            <Row
              icon="time"
              accent="grey"
              title={`Signs you out after ${autoLockMinutes} ${autoLockMinutes === 1 ? 'minute' : 'minutes'} of no use.`}
              accessory="none"
            />
            <Row icon="trash" accent="grey" title="Keeps nothing about you on this phone." accessory="none" />
          </Group>
        </View>

        {demoCode ? (
          <Text variant="footnote" tone="tertiary" center style={{ marginTop: space.xl }}>
            Prototype build — sign in with {demoCode}
          </Text>
        ) : null}
      </Screen>
    </KeyboardAvoidingView>
  );
}
