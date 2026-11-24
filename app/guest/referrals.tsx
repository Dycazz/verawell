import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, View } from 'react-native';

import { Screen, Group, Button, Field, Segmented, Badge } from '../../src/components';
import { Text, useTheme, radius, space } from '../../src/theme';
import { useBackend, useShelter } from '../../src/data';
import type { ReferralKind } from '../../src/data';
import { REFERRAL_KINDS, REFERRAL_STATUS as STATUS } from '../../src/lib/labels';
import { relativeTime } from '../../src/lib/contact';
import { QuickExit, useSession } from '../../src/safety';

export default function Referrals() {
  const { c } = useTheme();
  const api = useBackend();
  const { referrals } = useShelter();
  const { session } = useSession();
  const code = session?.role === 'guest' ? session.code : null;
  const mine = referrals.filter((r) => r.guestCode === code);

  const [kind, setKind] = useState<ReferralKind>('housing');
  const [details, setDetails] = useState('');
  const [error, setError] = useState<string>();
  const [sending, setSending] = useState(false);

  async function submit() {
    if (!code) return;
    if (details.trim().length < 5) {
      setError('Tell us a little about what you need.');
      return;
    }
    setError(undefined);
    setSending(true);
    await api.requestReferral(code, kind, details.trim());
    setSending(false);
    setDetails('');
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <Screen
        title="Referrals"
        subtitle="Ask for a connection to legal, housing or financial help. An advocate follows up in person."
        back
        backLabel="House"
        headerRight={<QuickExit />}
      >
        {mine.length > 0 ? (
          <View style={{ marginBottom: space['2xl'] }}>
            <Group header="Your requests">
              {mine.map((r) => (
                <View key={r.id} style={{ paddingHorizontal: 16, paddingVertical: space.md }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Text variant="body" strong>
                      {REFERRAL_KINDS.find((k) => k.value === r.kind)?.label}
                    </Text>
                    <Badge label={STATUS[r.status].label} tone={STATUS[r.status].tone} />
                  </View>
                  <Text variant="subhead" tone="secondary" style={{ marginTop: 2 }}>
                    {r.details}
                  </Text>
                  {r.staffNote ? (
                    <View style={{ marginTop: space.sm, padding: space.md, borderRadius: radius.md, backgroundColor: c.tintFill }}>
                      <Text variant="footnote">Advocate: {r.staffNote}</Text>
                    </View>
                  ) : null}
                  <Text variant="caption" tone="tertiary" style={{ marginTop: space.xs }}>
                    {relativeTime(r.updatedAt)}
                  </Text>
                </View>
              ))}
            </Group>
          </View>
        ) : null}

        <Group padded header="New request" footer="Only advocates see this, and it's matched to your code, never a name.">
          <View style={{ gap: space.base }}>
            <View>
              <Text variant="footnote" tone="secondary" style={{ marginBottom: 6 }}>
                What kind of help
              </Text>
              <Segmented options={REFERRAL_KINDS} value={kind} onChange={setKind} />
            </View>
            <Field label="What do you need?" multiline value={details} onChangeText={setDetails} error={error} />
            <Button label="Send request" full loading={sending} onPress={submit} />
          </View>
        </Group>
      </Screen>
    </KeyboardAvoidingView>
  );
}
