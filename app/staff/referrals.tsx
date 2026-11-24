import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { StaffScreen, Group, Row, Button, Field, Badge, Segmented } from '../../src/components';
import { Text, space } from '../../src/theme';
import { useBackend, useShelter } from '../../src/data';
import type { ReferralRequest } from '../../src/data';
import { relativeTime } from '../../src/lib/contact';
import { REFERRAL_KINDS, REFERRAL_STATUS } from '../../src/lib/labels';

const STATUSES: { value: ReferralRequest['status']; label: string }[] = [
  { value: 'new', label: 'New' },
  { value: 'in-progress', label: 'Working' },
  { value: 'referred', label: 'Referred' },
  { value: 'closed', label: 'Closed' },
];

export default function Referrals() {
  const api = useBackend();
  const { referrals } = useShelter();
  const [notes, setNotes] = useState<Record<string, string>>({});

  const sorted = [...referrals].sort(
    (a, b) =>
      Number(a.status === 'closed') - Number(b.status === 'closed') || b.updatedAt - a.updatedAt,
  );

  return (
    <StaffScreen
      title="Referrals"
      subtitle="Matched to a guest code, never a name. Notes you write are visible to that guest."
    >
      <View style={styles.wrap}>
        <Group header={`${sorted.length} ${sorted.length === 1 ? 'request' : 'requests'}`}>
          {sorted.length === 0 ? (
            <Row title="No referral requests yet" accessory="none" />
          ) : (
            sorted.map((r) => (
              <View key={r.id} style={[styles.card, r.status === 'closed' && { opacity: 0.55 }]}>
                <View style={styles.head}>
                  <View style={{ flexDirection: 'row', gap: space.sm, alignItems: 'center' }}>
                    <Text variant="body" strong>
                      {r.guestCode}
                    </Text>
                    <Badge label={REFERRAL_KINDS.find((k) => k.value === r.kind)?.label ?? r.kind} tone="tint" />
                    <Badge label={REFERRAL_STATUS[r.status].label} tone={REFERRAL_STATUS[r.status].tone} />
                  </View>
                  <Text variant="caption" tone="tertiary">
                    {relativeTime(r.createdAt)}
                  </Text>
                </View>

                <Text variant="subhead" style={{ marginTop: space.sm }}>
                  {r.details}
                </Text>

                <View style={{ marginTop: space.md, gap: space.sm }}>
                  <Segmented
                    options={STATUSES}
                    value={r.status}
                    onChange={(status) => api.updateReferral(r.id, { status })}
                  />
                  <Field
                    placeholder="Note for the guest (optional)"
                    value={notes[r.id] ?? r.staffNote ?? ''}
                    onChangeText={(v) => setNotes((n) => ({ ...n, [r.id]: v }))}
                  />
                  {notes[r.id] !== undefined && notes[r.id] !== (r.staffNote ?? '') ? (
                    <Button
                      label="Save note"
                      size="sm"
                      variant="tinted"
                      onPress={async () => {
                        await api.updateReferral(r.id, { staffNote: notes[r.id].trim() || undefined });
                        setNotes((n) => {
                          const { [r.id]: _gone, ...rest } = n;
                          return rest;
                        });
                      }}
                    />
                  ) : null}
                </View>
              </View>
            ))
          )}
        </Group>
      </View>
    </StaffScreen>
  );
}

const styles = StyleSheet.create({
  wrap: { maxWidth: 760 },
  card: { paddingHorizontal: 16, paddingVertical: space.md },
  head: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
});
