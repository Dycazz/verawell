import React, { useState } from 'react';
import { Platform, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Springy } from './Pressable';
import { Text, useTheme, radius, space, HIT, fonts } from '../theme';
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
          <Text variant="caption" tone="faint" center style={{ marginTop: space.lg }}>
            {footnote}
          </Text>
        ) : null}
      </ScrollView>

      <View
        style={[
          styles.composer,
          { paddingBottom: insets.bottom || space.md, backgroundColor: c.surface, borderTopColor: c.line },
        ]}
      >
        <View style={[styles.input, { backgroundColor: c.bg, borderColor: c.line }]}>
          <TextInput
            value={draft}
            onChangeText={setDraft}
            placeholder={placeholder}
            placeholderTextColor={c.inkFaint}
            multiline
            style={{
              flex: 1,
              color: c.ink,
              fontFamily: fonts.body,
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
            { backgroundColor: draft.trim() ? c.primary : c.surfaceAlt },
          ])}
        >
          <Ionicons name="arrow-up" size={20} color={draft.trim() ? c.onPrimary : c.inkFaint} />
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
        <Text variant="label" caps tone="faint" style={{ marginBottom: 5, marginLeft: 4 }}>
          {author}
        </Text>
      ) : null}

      <View
        style={[
          styles.bubble,
          mine
            ? { backgroundColor: c.primary, borderBottomRightRadius: radius.sm }
            : {
                backgroundColor: c.surface,
                borderColor: c.line,
                borderWidth: StyleSheet.hairlineWidth * 2,
                borderBottomLeftRadius: radius.sm,
              },
        ]}
      >
        <Text variant="callout" style={{ color: mine ? c.onPrimary : c.ink }}>
          {message.body}
        </Text>
      </View>

      <Text variant="caption" tone="faint" style={{ marginTop: 4, marginHorizontal: 4, fontSize: 11 }}>
        {relativeTime(message.createdAt)}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  bubble: { maxWidth: '86%', paddingHorizontal: space.base, paddingVertical: space.md, borderRadius: radius.lg },
  composer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: space.sm,
    paddingHorizontal: space.base,
    paddingTop: space.md,
    borderTopWidth: StyleSheet.hairlineWidth * 2,
  },
  input: {
    flex: 1,
    minHeight: HIT - 4,
    borderRadius: radius.lg,
    borderWidth: 1.5,
    paddingHorizontal: space.base,
    paddingVertical: space.md,
    justifyContent: 'center',
  },
  send: { width: 46, height: 46, borderRadius: radius.pill, alignItems: 'center', justifyContent: 'center' },
});
