import React, { useEffect } from 'react';
import { KeyboardAvoidingView, Platform, StyleSheet, View } from 'react-native';
import { useLocalSearchParams, Redirect, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Springy, Badge, Conversation } from '../../src/components';
import { Text, useTheme, space } from '../../src/theme';
import { useBackend, useShelter } from '../../src/data';
import { relativeTime } from '../../src/lib/contact';
import { useSession } from '../../src/safety';

export default function StaffThread() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { c } = useTheme();
  const insets = useSafeAreaInsets();
  const api = useBackend();
  const { threads } = useShelter();
  const { session } = useSession();

  const thread = threads.find((t) => t.id === id);

  useEffect(() => {
    if (thread && thread.unreadForStaff > 0) api.markThreadRead(thread.id, 'staff');
  }, [thread, api]);

  if (!session || session.role !== 'staff') return <Redirect href="/staff-login" />;

  if (!thread) {
    return (
      <View style={[styles.missing, { backgroundColor: c.bg, paddingTop: insets.top + space['3xl'] }]}>
        <Text variant="title3">Conversation not found</Text>
        <Springy onPress={() => router.replace('/staff/inbox')} scaleTo={1} style={{ marginTop: space.base }}>
          <Text variant="body" style={{ color: c.tint }}>
            Back to inbox
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
          onPress={() => (router.canGoBack() ? router.back() : router.replace('/staff/inbox'))}
          scaleTo={1}
          accessibilityRole="button"
          accessibilityLabel="Back to inbox"
          style={styles.back}
        >
          <Ionicons name="chevron-back" size={26} color={c.tint} style={{ marginLeft: -6 }} />
          <Text variant="body" style={{ color: c.tint }}>
            Inbox
          </Text>
        </Springy>

        <View style={{ flex: 1 }}>
          <Text variant="headline" numberOfLines={1}>
            {thread.guestCode}
          </Text>
          <Text variant="caption" tone="secondary" numberOfLines={1}>
            {thread.topic} · started {relativeTime(thread.createdAt)}
          </Text>
        </View>

        {thread.urgent ? <Badge label="Urgent" tone="crisis" /> : null}
      </View>

      <Conversation
        messages={thread.messages}
        viewer="advocate"
        onSend={(body) => api.replyToThread(thread.id, 'advocate', body)}
        placeholder="Reply as an advocate"
        footnote="You are replying to an access code. This guest's name is not stored anywhere in this app."
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
  back: { height: 44, flexDirection: 'row', alignItems: 'center', paddingRight: space.xs },
  missing: { flex: 1, alignItems: 'center', paddingHorizontal: space.base },
});
