import React from 'react';
import { Platform, Pressable, ScrollView, StyleSheet, Text, useColorScheme, View } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

/**
 * Cover screen — where quick exit lands.
 *
 * Intentionally shares nothing with the rest of the app: stock system type, a
 * stock blue accent, no brand marks, no VeraWell strings. Anyone who picks up the
 * phone a second after quick exit sees an unremarkable notes app.
 *
 * Way back: press and hold the "Notes" heading for about a second. Hidden on
 * purpose — a visible "return to shelter app" control would undo the whole thing.
 */

const NOTES = [
  { id: '1', title: 'Groceries', body: 'milk, rice, coffee filters, dish soap', when: 'Today' },
  { id: '2', title: 'Library', body: 'two books due Thursday — renew online', when: 'Yesterday' },
  { id: '3', title: 'Bus times', body: '14 leaves at :05 and :35 past the hour', when: 'Monday' },
  { id: '4', title: 'Recipe', body: 'lemon, olive oil, oregano, garlic — marinate 2h', when: 'Mar 3' },
];

export default function Cover() {
  const scheme = useColorScheme();
  const dark = scheme === 'dark';
  const insets = useSafeAreaInsets();

  const bg = dark ? '#000000' : '#FFFFFF';
  const card = dark ? '#1C1C1E' : '#F2F2F7';
  const label = dark ? '#FFFFFF' : '#000000';
  const secondary = dark ? '#98989F' : '#6C6C70';

  return (
    <View style={{ flex: 1, backgroundColor: bg }}>
      <ScrollView
        contentContainerStyle={{
          paddingTop: insets.top + 12,
          paddingHorizontal: 16,
          paddingBottom: insets.bottom + 32,
        }}
      >
        <Pressable
          onLongPress={() => router.replace('/')}
          delayLongPress={900}
          accessibilityRole="header"
          accessibilityLabel="Notes"
        >
          <Text style={[styles.title, { color: label }]}>Notes</Text>
        </Pressable>

        <Text style={[styles.count, { color: secondary }]}>{NOTES.length} notes</Text>

        <View style={{ gap: 10, marginTop: 16 }}>
          {NOTES.map((n) => (
            <View key={n.id} style={[styles.card, { backgroundColor: card }]}>
              <Text style={[styles.cardTitle, { color: label }]} numberOfLines={1}>
                {n.title}
              </Text>
              <View style={styles.cardMetaRow}>
                <Text style={[styles.cardMeta, { color: secondary }]}>{n.when}</Text>
                <Text style={[styles.cardMeta, { color: secondary, flex: 1 }]} numberOfLines={1}>
                  {n.body}
                </Text>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const systemFont = Platform.select({ ios: 'System', android: 'sans-serif', default: 'system-ui' });

const styles = StyleSheet.create({
  title: { fontFamily: systemFont, fontSize: 34, fontWeight: '700', letterSpacing: 0.37 },
  count: { fontFamily: systemFont, fontSize: 13, marginTop: 2 },
  card: { borderRadius: 10, paddingHorizontal: 14, paddingVertical: 12, gap: 3 },
  cardMetaRow: { flexDirection: 'row', gap: 10 },
  cardTitle: { fontFamily: systemFont, fontSize: 16, fontWeight: '600' },
  cardMeta: { fontFamily: systemFont, fontSize: 14 },
});
