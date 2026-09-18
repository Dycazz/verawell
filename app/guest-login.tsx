import React, { useEffect, useMemo, useState } from 'react';
import { KeyboardAvoidingView, Platform, StyleSheet, View } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { Screen, Card, Button, Field, Stagger } from '../src/components';
import { Text, useTheme, radius, space, fonts } from '../src/theme';
import { useBackend, useShelter } from '../src/data';
import { useSession, usePrivacy } from '../src/safety';

const LOCK_COPY: Record<string, string> = {
  idle: 'Signed out automatically after a few quiet minutes.',
  background: 'Signed out when the app went to the background.',
  'quick-exit': 'Signed out.',
  manual: 'Signed out.',
};

export default function GuestLogin() {
  const { c } = useTheme();
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

  // Only show the sign-out notice once; it should not survive a retry.
  useEffect(() => {
    if (!code) return;
    setNotice(undefined);
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

    const match = codes.find((g) => g.code === entered);
    signIn({ role: 'guest', code: entered, label: match?.label });
    router.replace('/guest');
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <Screen
        back
        wash
        eyebrow="Guest sign in"
        title="Your code"
        subtitle="No name, no email, no phone number. The code is the only thing that identifies you, and staff see only the code."
      >
        {notice ? (
          <Stagger index={1} style={{ marginBottom: space.lg }}>
            <Card tone="alt" flat>
              <View style={styles.noticeRow}>
                <Ionicons name="lock-closed-outline" size={17} color={c.inkMuted} />
                <Text variant="caption" tone="muted" style={{ flex: 1 }}>
                  {notice}
                </Text>
              </View>
            </Card>
          </Stagger>
        ) : null}

        <Stagger index={2}>
          <Card>
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
              style={{ fontFamily: fonts.bodySemi, fontSize: 20, letterSpacing: 2 }}
            />
            <Button
              label="Sign in"
              full
              loading={checking}
              style={{ marginTop: space.lg }}
              onPress={submit}
            />
          </Card>
        </Stagger>

        <Stagger index={3} style={{ marginTop: space.xl }}>
          <Card tone="primary">
            <Text variant="subhead" style={{ marginBottom: space.md }}>
              What this app does and doesn't do
            </Text>
            <Promise icon="person-outline" text="Never asks for your legal name, birthday, or ID." />
            <Promise icon="location-outline" text="Never tracks where you are — not now, not in the background." />
            <Promise
              icon="time-outline"
              text={`Signs you out on its own after ${autoLockMinutes} ${autoLockMinutes === 1 ? 'minute' : 'minutes'} of no use.`}
            />
            <Promise icon="trash-outline" text="Keeps nothing about you on this phone after you sign out." last />
          </Card>
        </Stagger>

        {demoCode ? (
          <Stagger index={4} style={{ marginTop: space.xl }}>
            <View style={[styles.demo, { borderColor: c.lineStrong }]}>
              <Text variant="label" caps tone="faint">
                Prototype
              </Text>
              <Text variant="caption" tone="muted" style={{ marginTop: 4 }}>
                This is a demo build with seeded data. Sign in with{' '}
                <Text variant="caption" style={{ fontFamily: fonts.bodySemi, color: c.ink }}>
                  {demoCode}
                </Text>
                .
              </Text>
            </View>
          </Stagger>
        ) : null}
      </Screen>
    </KeyboardAvoidingView>
  );
}

function Promise({
  icon,
  text,
  last,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  text: string;
  last?: boolean;
}) {
  const { c } = useTheme();
  return (
    <View style={[styles.promise, !last && { marginBottom: space.md }]}>
      <Ionicons name={icon} size={17} color={c.primary} style={{ marginTop: 2 }} />
      <Text variant="callout" tone="muted" style={{ flex: 1 }}>
        {text}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  noticeRow: { flexDirection: 'row', alignItems: 'center', gap: space.md },
  promise: { flexDirection: 'row', gap: space.md, alignItems: 'flex-start' },
  demo: {
    borderWidth: 1,
    borderStyle: 'dashed',
    borderRadius: radius.md,
    padding: space.base,
  },
});
