import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, View } from 'react-native';

import { Screen, Group, Row, Button, Field, Segmented, Badge } from '../../src/components';
import { space } from '../../src/theme';
import { useBackend, useShelter } from '../../src/data';
import type { WishKind, WishlistItem } from '../../src/data';
import { QuickExit } from '../../src/safety';

const KINDS: { value: WishKind; label: string }[] = [
  { value: 'grocery', label: 'Grocery' },
  { value: 'big-ticket', label: 'Bigger item' },
];

const STATUS: Record<WishlistItem['status'], { label: string; tone: 'grey' | 'tint' | 'positive' }> = {
  requested: { label: 'Requested', tone: 'grey' },
  approved: { label: 'On the list', tone: 'tint' },
  fulfilled: { label: 'Got it', tone: 'positive' },
  declined: { label: 'Not now', tone: 'grey' },
};

export default function Wishlist() {
  const api = useBackend();
  const { wishlist } = useShelter();

  const [kind, setKind] = useState<WishKind>('grocery');
  const [title, setTitle] = useState('');
  const [note, setNote] = useState('');
  const [sending, setSending] = useState(false);

  const visible = wishlist.filter((w) => w.status !== 'declined');

  async function add() {
    if (!title.trim()) return;
    setSending(true);
    await api.requestWish(kind, title.trim(), note.trim() || undefined);
    setSending(false);
    setTitle('');
    setNote('');
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <Screen
        title="Wishlist"
        subtitle="A shared list for the whole house. Staff review it, and approved items are shared with donors."
        back
        backLabel="House"
        headerRight={<QuickExit />}
      >
        {(['grocery', 'big-ticket'] as WishKind[]).map((k) => {
          const items = visible.filter((w) => w.kind === k);
          return (
            <View key={k} style={{ marginBottom: space['2xl'] }}>
              <Group header={k === 'grocery' ? 'Groceries' : 'Bigger items'}>
                {items.length === 0 ? (
                  <Row title="Nothing requested" accessory="none" />
                ) : (
                  items.map((w) => (
                    <Row
                      key={w.id}
                      title={w.title}
                      subtitle={w.note}
                      accessory="none"
                      right={<Badge label={STATUS[w.status].label} tone={STATUS[w.status].tone} />}
                    />
                  ))
                )}
              </Group>
            </View>
          );
        })}

        <Group padded header="Add to the list" footer="Anonymous — nothing here is tied to your code.">
          <View style={{ gap: space.base }}>
            <Segmented options={KINDS} value={kind} onChange={setKind} />
            <Field label="What would help?" value={title} onChangeText={setTitle} placeholder="Oat milk, a vacuum cleaner…" />
            <Field label="Note (optional)" value={note} onChangeText={setNote} />
            <Button label="Add" full disabled={!title.trim()} loading={sending} onPress={add} />
          </View>
        </Group>
      </Screen>
    </KeyboardAvoidingView>
  );
}
