import React, { useState } from 'react';
import { Platform, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Springy } from './Pressable';
import { Text, useTheme, radius, space, LAYOUT, weight } from '../theme';
import { relativeTime } from '../lib/contact';
import type { ThreadMessage } from '../data';

/**
 * Message list and composer, shared by the guest thread and the advocate thread.
 * `viewer` decides which side is "mine", so the two screens differ only in their
 * header and their footer note rather than carrying two copies of this.
 */
export function Conversation({
  messages,
  viewer,
  onSend,
  footnote,
  placeholder = 'Write a message',
}: {
  messages: ThreadMessage[];
  viewer: 'guest' | 'advocate';
  onSend: (body: string) => void | Promise<void>;
  footnote?: string;
  placeholder?: string;
}) {
  const { c } = useTheme();
  const insets = useSafeAreaInsets();
  const [draft, setDraft] = useState('');

  const send = () => {
    const body = draft.trim();
    if (!body) return;
    setDraft('');
    void onSend(body);
  };

  return (
    <>
      <ScrollView
        contentContainerStyle={{ padding: space.lg, gap: space.md }}
        keyboardShouldPersistTaps="handled"
      >
        {messages.map((m) => (
          <Bubble key={m.id} message={m} mine={m.from === viewer} />
        ))}

        {footnote ? (
          <Text variant="footnote" tone="secondary" center style={{ marginTop: space.lg }}>
            {footnote}
          </Text>
        ) : null}
      </ScrollView>

      <View
        style={[
          styles.composer,
          { paddingBottom: insets.bottom || space.md, backgroundColor: c.chrome, borderTopColor: c.separator },
        ]}
      >
        <View style={[styles.input, { backgroundColor: c.fill }]}>
          <TextInput
            value={draft}
            onChangeText={setDraft}
            placeholder={placeholder}
            placeholderTextColor={c.labelTertiary}
            multiline
            style={{
              flex: 1,
              color: c.label,
              ...weight('400'),
              fontSize: 16,
              lineHeight: 22,
              maxHeight: 110,
              paddingTop: Platform.OS === 'ios' ? 6 : 0,
            }}
          />
        </View>

        <Springy
          onPress={send}
          disabled={!draft.trim()}
          scaleTo={0.9}
          accessibilityRole="button"
          accessibilityLabel="Send message"
          style={StyleSheet.flatten([
            styles.send,
            { backgroundColor: draft.trim() ? c.tint : c.fillStrong },
          ])}
        >
          <Ionicons name="arrow-up" size={19} color={draft.trim() ? c.onTint : c.labelTertiary} />
        </Springy>
      </View>
    </>
  );
}

function Bubble({ message, mine }: { message: ThreadMessage; mine: boolean }) {
  const { c } = useTheme();
  const author = message.from === 'advocate' ? 'Advocate' : 'Guest';

  return (
    <View style={{ alignItems: mine ? 'flex-end' : 'flex-start' }}>
      {!mine ? (
        <Text variant="caption" tone="secondary" style={{ marginBottom: 4, marginLeft: 6 }}>
          {author}
        </Text>
      ) : null}

      <View
        style={[
          styles.bubble,
          mine
            ? { backgroundColor: c.tint }
            : { backgroundColor: c.fill },
        ]}
      >
        <Text variant="body" style={{ color: mine ? c.onTint : c.label }}>
          {message.body}
        </Text>
      </View>

      <Text variant="caption2" tone="tertiary" style={{ marginTop: 3, marginHorizontal: 6 }}>
        {relativeTime(message.createdAt)}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  bubble: { maxWidth: '78%', paddingHorizontal: 14, paddingVertical: 9, borderRadius: 18 },
  composer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: space.sm,
    paddingHorizontal: space.base,
    paddingTop: space.md,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  input: {
    flex: 1,
    minHeight: 40,
    borderRadius: 18,
    paddingHorizontal: space.md,
    paddingVertical: space.md,
    justifyContent: 'center',
  },
  send: { width: 40, height: 40, borderRadius: radius.pill, alignItems: 'center', justifyContent: 'center' },
});
