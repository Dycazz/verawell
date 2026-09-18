import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, StyleSheet, View } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { Screen, Card, Button, Field, Stagger } from '../src/components';
import { Text, useTheme, radius, space, fonts } from '../src/theme';
import { useSession } from '../src/safety';
import { checkStaffPin, DEMO_STAFF_PIN } from '../src/lib/staffAuth';

export default function StaffLogin() {
  const { c } = useTheme();
  const { signIn } = useSession();

  const [pin, setPin] = useState('');
  const [error, setError] = useState<string>();

  function submit() {
    if (!checkStaffPin(pin)) {
      setError('That PIN is not recognised.');
      return;
    }
    signIn({ role: 'staff', code: 'STAFF', label: 'Advocate' });
    router.replace('/staff');
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <Screen
        back
        eyebrow="Staff console"
        title="Sign in"
        subtitle="For advocates and front-office staff. Guests do not use this door."
        maxWidth={480}
      >
        <Stagger index={1}>
          <Card>
            <Field
              label="Staff PIN"
              value={pin}
              onChangeText={(t) => {
                setPin(t);
                setError(undefined);
              }}
              placeholder="••••"
              keyboardType="number-pad"
              secureTextEntry
              returnKeyType="go"
              onSubmitEditing={submit}
              error={error}
              style={{ fontFamily: fonts.bodySemi, fontSize: 20, letterSpacing: 6 }}
            />
            <Button label="Open console" full style={{ marginTop: space.lg }} onPress={submit} />
          </Card>
        </Stagger>

        <Stagger index={2} style={{ marginTop: space.xl }}>
          <View style={[styles.demo, { borderColor: c.lineStrong }]}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Ionicons name="construct-outline" size={14} color={c.inkFaint} />
              <Text variant="label" caps tone="faint">
                Prototype
              </Text>
            </View>
            <Text variant="caption" tone="muted" style={{ marginTop: 6 }}>
              PIN{' '}
              <Text variant="caption" style={{ fontFamily: fonts.bodySemi, color: c.ink }}>
                {DEMO_STAFF_PIN}
              </Text>
              . A real build would put this behind proper staff accounts — the check here
              runs on the device and protects nothing.
            </Text>
          </View>
        </Stagger>
      </Screen>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  demo: { borderWidth: 1, borderStyle: 'dashed', borderRadius: radius.md, padding: space.base },
});
