import React from 'react';
import { StyleSheet, View } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { Screen, Card, Button, Badge, Stagger, Springy, SectionHeader, CRISIS_DOCK_HEIGHT } from '../../src/components';
import { Text, useTheme, radius, space } from '../../src/theme';
import { useShelter, useNeeds } from '../../src/data';
import { openUrl, relativeTime } from '../../src/lib/contact';

export default function PublicHome() {
  const { c } = useTheme();
  const { profile } = useShelter();
  const needs = useNeeds();
  const urgent = needs.urgent.slice(0, 3);

  return (
    <Screen
      wash
      eyebrow={profile.name}
      title="How you can help"
      subtitle="Everything here is public. Nothing on this side of the app asks who you are."
      bottomInset={CRISIS_DOCK_HEIGHT}
    >
      <Stagger index={1}>
        <Card tone="clay" padded={false}>
          <View style={{ padding: space.lg }}>
            <View style={styles.cardHead}>
              <Badge label="Needed now" tone="clay" />
              {needs.all[0] ? (
                <Text variant="caption" tone="faint">
                  Updated {relativeTime(needs.all[0].updatedAt)}
                </Text>
              ) : null}
            </View>

            <Text variant="heading" style={{ marginTop: space.md }}>
              This week we're short on
            </Text>

            <View style={{ marginTop: space.md, gap: space.sm }}>
              {urgent.length === 0 ? (
                <Text variant="callout" tone="muted">
                  Nothing urgent right now — thank you.
                </Text>
              ) : (
                urgent.map((n) => (
                  <View key={n.id} style={styles.needLine}>
                    <View style={[styles.bullet, { backgroundColor: c.clay }]} />
                    <Text variant="bodyStrong" style={{ flex: 1 }}>
                      {n.title}
                    </Text>
                  </View>
                ))
              )}
            </View>

            <Button
              label="See the full list"
              variant="secondary"
              size="sm"
              iconRight="arrow-forward"
              onPress={() => router.push('/public/needs')}
              style={{ marginTop: space.lg }}
            />
          </View>
        </Card>
      </Stagger>

      <Stagger index={2} style={{ marginTop: space.xl }}>
        <SectionHeader title="Take action" />
        <View style={styles.grid}>
          <Tile
            icon="gift-outline"
            tone="primary"
            title="Donate"
            body="Secure giving page"
            onPress={() => openUrl(profile.donateUrl)}
            external
          />
          <Tile
            icon="call-outline"
            tone="primary"
            title="Contact us"
            body="Call or send a message"
            onPress={() => router.push('/public/contact')}
          />
          <Tile
            icon="compass-outline"
            tone="primary"
            title="Resources"
            body="Hotlines and agencies"
            onPress={() => router.push('/public/resources')}
          />
          <Tile
            icon="globe-outline"
            tone="primary"
            title="Our website"
            body="Programs and news"
            onPress={() => openUrl(profile.website)}
            external
          />
        </View>
      </Stagger>

      <Stagger index={3} style={{ marginTop: space.xl }}>
        <SectionHeader title="Follow along" />
        <Card>
          <View style={{ gap: space.md }}>
            <Text variant="callout" tone="muted">
              We post needs, volunteer days, and good news. We never post anything that
              identifies a guest.
            </Text>
            <View style={{ flexDirection: 'row', gap: space.sm, flexWrap: 'wrap' }}>
              {profile.socials.map((s) => (
                <Button
                  key={s.label}
                  label={s.label}
                  variant="soft"
                  size="sm"
                  icon={s.icon as keyof typeof Ionicons.glyphMap}
                  onPress={() => openUrl(s.url)}
                />
              ))}
            </View>
          </View>
        </Card>
      </Stagger>

      <Stagger index={4} style={{ marginTop: space.xl, alignItems: 'center' }}>
        <Springy
          onPress={() => router.replace('/')}
          scaleTo={0.95}
          style={{ padding: space.md }}
          accessibilityRole="button"
          accessibilityLabel="Back to the start"
        >
          <Text variant="caption" tone="faint">
            ← Back to the start
          </Text>
        </Springy>
      </Stagger>
    </Screen>
  );
}

function Tile({
  icon,
  title,
  body,
  onPress,
  external,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  tone: 'primary' | 'clay';
  title: string;
  body: string;
  onPress: () => void;
  external?: boolean;
}) {
  const { c } = useTheme();
  return (
    <Springy
      onPress={onPress}
      scaleTo={0.97}
      accessibilityRole="button"
      accessibilityLabel={`${title}. ${body}`}
      style={StyleSheet.flatten([
        styles.tile,
        { backgroundColor: c.surface, borderColor: c.line },
      ])}
    >
      <View style={[styles.tileIcon, { backgroundColor: c.primarySoft }]}>
        <Ionicons name={icon} size={20} color={c.primary} />
      </View>
      <View style={{ marginTop: space.md }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
          <Text variant="subhead">{title}</Text>
          {external ? <Ionicons name="open-outline" size={13} color={c.inkFaint} /> : null}
        </View>
        <Text variant="caption" tone="muted" style={{ marginTop: 2 }}>
          {body}
        </Text>
      </View>
    </Springy>
  );
}

const styles = StyleSheet.create({
  cardHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  needLine: { flexDirection: 'row', alignItems: 'center', gap: space.md },
  bullet: { width: 6, height: 6, borderRadius: 6 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: space.md },
  tile: {
    flexGrow: 1,
    flexBasis: '46%',
    minWidth: 150,
    padding: space.base,
    borderRadius: radius.lg,
    borderWidth: StyleSheet.hairlineWidth * 2,
  },
  tileIcon: { width: 40, height: 40, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center' },
});
