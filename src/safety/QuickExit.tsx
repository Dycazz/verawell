import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Springy } from '../components/Pressable';
import { Text, useTheme, space } from '../theme';
import { useSession } from './session';

/**
 * Quick exit.
 *
 * Standard pattern for apps used by people who may be watched: one tap drops the
 * session and replaces the screen with something unremarkable. Styled as an
 * ordinary nav bar action — a red panic button would itself be a tell.
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
      scaleTo={1}
      accessibilityRole="button"
      accessibilityLabel="Quick exit"
      accessibilityHint="Signs you out immediately and leaves this app"
      style={styles.btn}
    >
      <View style={styles.inner}>
        <Ionicons name="exit-outline" size={18} color={c.tint} />
        {!compact && (
          <Text variant="body" style={{ color: c.tint }}>
            Exit
          </Text>
        )}
      </View>
    </Springy>
  );
}

const styles = StyleSheet.create({
  btn: { height: 44, justifyContent: 'center', paddingHorizontal: space.sm },
  inner: { flexDirection: 'row', alignItems: 'center', gap: 4 },
});
