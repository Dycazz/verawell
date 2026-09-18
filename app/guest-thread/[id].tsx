import React, { useEffect } from 'react';
import { KeyboardAvoidingView, Platform, StyleSheet, View } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Springy, Badge, Conversation } from '../../src/components';
import { Text, useTheme, radius, space } from '../../src/theme';
import { useBackend, useShelter } from '../../src/data';
import { relativeTime } from '../../src/lib/contact';
import { QuickExit, useSession } from '../../src/safety';

export default function GuestThread() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { c } = useTheme();
  const insets = useSafeAreaInsets();
  const api = useBackend();
  const { threads } = useShelter();
  const { session } = useSession();

  const thread = threads.find((t) => t.id === id);
  // A guest can only ever open a thread opened under their own code.
  const permitted = !!thread && session?.role === 'guest' && thread.guestCode === session.code;

  useEffect(() => {
    if (permitted && thread && thread.unreadForGuest > 0) api.markThreadRead(thread.id, 'guest');
  }, [permitted, thread, api]);

  if (!permitted || !thread) {
    return (
      <View style={[styles.missing, { backgroundColor: c.bg, paddingTop: insets.top + space['3xl'] }]}>
        <Text variant="heading">Conversation not available</Text>
        <Springy onPress={() => router.replace('/guest/advocate')} style={{ marginTop: space.lg }}>
          <Text variant="callout" tone="primary">
            Back to messages
          </Text>
        </Springy>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: c.bg }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={[styles.header, { paddingTop: insets.top + space.md, borderBottomColor: c.line }]}>
        <Springy
          onPress={() => (router.canGoBack() ? router.back() : router.replace('/guest/advocate'))}
          scaleTo={0.9}
          accessibilityRole="button"
          accessibilityLabel="Back"
          style={StyleSheet.flatten([styles.backBtn, { backgroundColor: c.surfaceAlt }])}
        >
          <Ionicons name="chevron-back" size={22} color={c.ink} />
        </Springy>

        <View style={{ flex: 1 }}>
          <Text variant="subhead" numberOfLines={1}>
            {thread.topic}
          </Text>
          <Text variant="caption" tone="faint">
            Started {relativeTime(thread.createdAt)}
          </Text>
        </View>

        {thread.urgent ? <Badge label="Urgent" tone="crisis" /> : null}
        <QuickExit compact />
      </View>

      <Conversation
        messages={thread.messages}
        viewer="guest"
        onSend={(body) => api.replyToThread(thread.id, 'guest', body)}
        footnote="Only you and the advocates on shift can see this."
      />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
    paddingHorizontal: space.lg,
    paddingBottom: space.md,
    borderBottomWidth: StyleSheet.hairlineWidth * 2,
  },
  backBtn: { width: 40, height: 40, borderRadius: radius.pill, alignItems: 'center', justifyContent: 'center' },
  missing: { flex: 1, alignItems: 'center', paddingHorizontal: space.lg },
});
