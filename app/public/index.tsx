import React from 'react';
import { View } from 'react-native';
import { router } from 'expo-router';

import { Screen, Group, Row, CRISIS_DOCK_HEIGHT } from '../../src/components';
import { Text, space } from '../../src/theme';
import { useShelter, useNeeds } from '../../src/data';
import { openUrl, relativeTime } from '../../src/lib/contact';

export default function PublicHome() {
  const { profile } = useShelter();
  const needs = useNeeds();
  const urgent = needs.urgent.slice(0, 3);
  const updated = needs.all[0]?.updatedAt;

  return (
    <Screen
      title="How you can help"
      subtitle="Everything here is public. Nothing on this side of the app asks who you are."
      bottomInset={CRISIS_DOCK_HEIGHT + space.lg}
    >
      <Group
        header="Needed this week"
        footer={updated ? `Updated by staff ${relativeTime(updated)}.` : undefined}
      >
        {urgent.length === 0 ? (
          <Row title="Nothing urgent right now" subtitle="Thank you — the shelter is stocked." accessory="none" />
        ) : (
          urgent.map((n) => <Row key={n.id} title={n.title} subtitle={n.note} accessory="none" />)
        )}
        <Row title="See all needs" onPress={() => router.push('/public/needs')} />
      </Group>

      <View style={{ height: space['2xl'] }} />

      <Group header="Take action">
        <Row
          icon="gift"
          accent="positive"
          title="Donate"
          value="Opens browser"
          onPress={() => openUrl(profile.donateUrl)}
        />
        <Row icon="call" accent="tint" title="Contact the shelter" onPress={() => router.push('/public/contact')} />
        <Row
          icon="compass"
          accent="warn"
          title="Community resources"
          onPress={() => router.push('/public/resources')}
        />
      </Group>

      <View style={{ height: space['2xl'] }} />

      <Group header="Get involved">
        <Row
          icon="hand-left"
          accent="positive"
          title="Volunteer"
          subtitle="Sign up and we’ll match you with a coordinator."
          onPress={() => router.push('/public/volunteer')}
        />
        <Row
          icon="bulb"
          accent="warn"
          title="Ways to help"
          subtitle="Drives, drop-offs and skills — beyond money."
          onPress={() => router.push('/public/ways')}
        />
        <Row
          icon="school"
          accent="tint"
          title="Request a training"
          subtitle="For organisations and individuals."
          onPress={() => router.push('/public/training')}
        />
      </Group>

      <View style={{ height: space['2xl'] }} />

      <Group header="Follow along" footer="We never post anything that identifies a guest.">
        <Row icon="globe" accent="grey" title="Website" value="Opens browser" onPress={() => openUrl(profile.website)} />
        {profile.socials.map((s) => (
          <Row
            key={s.label}
            icon={s.label === 'Instagram' ? 'logo-instagram' : 'logo-facebook'}
            accent="grey"
            title={s.label}
            value="Opens browser"
            onPress={() => openUrl(s.url)}
          />
        ))}
      </Group>

      <Text
        variant="footnote"
        tone="tertiary"
        center
        style={{ marginTop: space['2xl'] }}
        onPress={() => router.replace('/')}
        accessibilityRole="button"
      >
        Back to the start
      </Text>
    </Screen>
  );
}
