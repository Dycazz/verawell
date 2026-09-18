import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform } from 'react-native';
import { router } from 'expo-router';

import { Screen, Group, Button, Field } from '../src/components';
import { Text, space, weight } from '../src/theme';
import { useSession } from '../src/safety';
import { checkStaffPin, DEMO_STAFF_PIN } from '../src/lib/staffAuth';

export default function StaffLogin() {
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
        title="Staff console"
        subtitle="For advocates and front-office staff. Guests do not use this door."
        maxWidth={520}
      >
        <Group padded>
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
            style={{ fontSize: 20, letterSpacing: 6, ...weight('600') }}
          />
          <Button label="Open console" full size="lg" style={{ marginTop: space.base }} onPress={submit} />
        </Group>

        <Text variant="footnote" tone="tertiary" center style={{ marginTop: space.xl }}>
          Prototype build — PIN {DEMO_STAFF_PIN}. A real build would put this behind proper staff
          accounts; this check runs on the device and protects nothing.
        </Text>
      </Screen>
    </KeyboardAvoidingView>
  );
}
