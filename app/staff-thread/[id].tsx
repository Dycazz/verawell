import React, { useEffect } from 'react';
import { KeyboardAvoidingView, Platform, StyleSheet, View } from 'react-native';
import { useLocalSearchParams, Redirect, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Springy, Badge, Conversation } from '../../src/components';
import { Text, useTheme, radius, space, fonts } from '../../src/theme';
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
        <Text variant="heading">Conversation not found</Text>
        <Springy onPress={() => router.replace('/staff/inbox')} style={{ marginTop: space.lg }}>
          <Text variant="callout" tone="primary">
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
      <View style={[styles.header, { paddingTop: insets.top + space.md, borderBottomColor: c.line }]}>
        <Springy
          onPress={() => (router.canGoBack() ? router.back() : router.replace('/staff/inbox'))}
          scaleTo={0.9}
          accessibilityRole="button"
          accessibilityLabel="Back to inbox"
          style={StyleSheet.flatten([styles.backBtn, { backgroundColor: c.surfaceAlt }])}
        >
          <Ionicons name="chevron-back" size={22} color={c.ink} />
        </Springy>

        <View style={{ flex: 1 }}>
          <Text style={{ fontFamily: fonts.bodySemi, fontSize: 15, color: c.ink, letterSpacing: 0.5 }}>
            {thread.guestCode}
          </Text>
          <Text variant="caption" tone="faint">
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
    gap: space.md,
    paddingHorizontal: space.lg,
    paddingBottom: space.md,
    borderBottomWidth: StyleSheet.hairlineWidth * 2,
  },
  backBtn: { width: 40, height: 40, borderRadius: radius.pill, alignItems: 'center', justifyContent: 'center' },
  missing: { flex: 1, alignItems: 'center', paddingHorizontal: space.lg },
});
