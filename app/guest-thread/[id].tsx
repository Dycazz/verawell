import React, { useEffect } from 'react';
import { KeyboardAvoidingView, Platform, StyleSheet, View } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Springy, Badge, Conversation } from '../../src/components';
import { Text, useTheme, space } from '../../src/theme';
import { useBackend, useShelter } from '../../src/data';
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
        <Text variant="title3">Conversation not available</Text>
        <Springy onPress={() => router.replace('/guest/advocate')} scaleTo={1} style={{ marginTop: space.base }}>
          <Text variant="body" style={{ color: c.tint }}>
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
      <View
        style={[
          styles.header,
          { paddingTop: insets.top, backgroundColor: c.chrome, borderBottomColor: c.separator },
        ]}
      >
        <Springy
          onPress={() => (router.canGoBack() ? router.back() : router.replace('/guest/advocate'))}
          scaleTo={1}
          accessibilityRole="button"
          accessibilityLabel="Back to messages"
          style={styles.back}
        >
          <Ionicons name="chevron-back" size={26} color={c.tint} style={{ marginLeft: -6 }} />
        </Springy>

        <View style={{ flex: 1 }}>
          <Text variant="headline" numberOfLines={1}>
            {thread.topic}
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
    gap: space.sm,
    paddingHorizontal: space.sm,
    paddingBottom: space.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  back: { height: 44, justifyContent: 'center', paddingRight: 2 },
  missing: { flex: 1, alignItems: 'center', paddingHorizontal: space.base },
});
