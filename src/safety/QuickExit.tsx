import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Springy } from '../components/Pressable';
import { Text, useTheme, radius, space } from '../theme';
import { useSession } from './session';

/**
 * Quick exit.
 *
 * Standard pattern in apps built for people who may be watched: one tap drops the
 * session and replaces the screen with something unremarkable. It is styled to be
 * findable without being conspicuous — a red panic button on screen is itself a
 * tell that this is not an ordinary app.
 */
export function QuickExit({ compact }: { compact?: boolean }) {
  const { c } = useTheme();
  const { signOut } = useSession();

  return (
    <Springy
      onPress={() => {
        signOut('quick-exit');
        router.replace('/cover');
      }}
      haptic="none"
      scaleTo={0.92}
      accessibilityRole="button"
      accessibilityLabel="Quick exit"
      accessibilityHint="Signs you out immediately and leaves this app"
      style={StyleSheet.flatten([
        styles.btn,
        { backgroundColor: c.surfaceAlt, borderColor: c.line, paddingHorizontal: compact ? 12 : space.base },
      ])}
    >
      <View style={styles.inner}>
        <Ionicons name="exit-outline" size={17} color={c.inkMuted} />
        {!compact && (
          <Text variant="label" tone="muted">
            Exit
          </Text>
        )}
      </View>
    </Springy>
  );
}

const styles = StyleSheet.create({
  btn: { height: 40, borderRadius: radius.pill, borderWidth: 1, justifyContent: 'center' },
  inner: { flexDirection: 'row', alignItems: 'center', gap: 6 },
});
