import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { Screen, Group, Button, Springy } from '../../src/components';
import { Text, useTheme, radius, space, LAYOUT } from '../../src/theme';
import { useShelter } from '../../src/data';
import type { SafetyGuide } from '../../src/data';
import { callNumber } from '../../src/lib/contact';
import { QuickExit } from '../../src/safety';

const ICON: Record<SafetyGuide['kind'], keyof typeof Ionicons.glyphMap> = {
  personal: 'shield-checkmark',
  fire: 'flame',
  weather: 'thunderstorm',
  medical: 'medkit',
};

const ACCENT: Record<SafetyGuide['kind'], 'crisis' | 'warn' | 'tint'> = {
  personal: 'crisis',
  fire: 'crisis',
  weather: 'warn',
  medical: 'tint',
};

export default function Safety() {
  const { safety } = useShelter();
  // Personal safety opens by default — most likely the reason this screen is open.
  const [open, setOpen] = useState<string | null>(safety[0]?.id ?? null);

  return (
    <Screen title="Safety" headerRight={<QuickExit />}>
      <Group padded footer="Tell an advocate afterwards so they can meet responders at the door.">
        <Text variant="headline">In immediate danger</Text>
        <Text variant="subhead" tone="secondary" style={{ marginTop: 4 }}>
          Call emergency services first.
        </Text>
        <Button
          label="Call 911"
          variant="crisis"
          icon="call"
          size="lg"
          full
          style={{ marginTop: space.base }}
          onPress={() => callNumber('911')}
        />
      </Group>

      <View style={{ marginTop: space['2xl'] }}>
        <Group header="What to do">
          {safety.map((g) => (
            <Guide key={g.id} guide={g} open={open === g.id} onToggle={() => setOpen(open === g.id ? null : g.id)} />
          ))}
        </Group>
      </View>
    </Screen>
  );
}

function Guide({ guide, open, onToggle }: { guide: SafetyGuide; open: boolean; onToggle: () => void }) {
  const { c } = useTheme();
  const accent = { crisis: c.iconRed, warn: c.iconOrange, tint: c.iconBlue }[ACCENT[guide.kind]];

  return (
    <View>
      <Springy
        onPress={onToggle}
        highlight
        accessibilityRole="button"
        accessibilityState={{ expanded: open }}
        accessibilityLabel={`${guide.title}. ${guide.summary}`}
      >
        <View style={styles.head}>
          <View style={[styles.icon, { backgroundColor: accent }]}>
            <Ionicons name={ICON[guide.kind]} size={16} color="#FFFFFF" />
          </View>
          <View style={{ flex: 1 }}>
            <Text variant="body">{guide.title}</Text>
            <Text variant="footnote" tone="secondary" style={{ marginTop: 1 }}>
              {guide.summary}
            </Text>
          </View>
          <Ionicons name={open ? 'chevron-up' : 'chevron-down'} size={17} color={c.labelTertiary} />
        </View>
      </Springy>

      {open ? (
        <View style={styles.body}>
          {guide.steps.map((step, i) => (
            <View key={i} style={styles.step}>
              <Text variant="subhead" tone="tertiary" tabular style={styles.stepNum}>
                {i + 1}
              </Text>
              <Text variant="subhead" style={{ flex: 1 }}>
                {step}
              </Text>
            </View>
          ))}

          {guide.callNumber ? (
            <Button
              label={guide.callLabel ?? 'Call'}
              variant="crisis"
              icon="call"
              size="sm"
              style={{ marginTop: space.md, alignSelf: 'flex-start' }}
              onPress={() => callNumber(guide.callNumber!)}
            />
          ) : null}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  head: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
    minHeight: LAYOUT.rowTall,
    paddingHorizontal: LAYOUT.margin,
    paddingVertical: space.sm,
  },
  icon: { width: 29, height: 29, borderRadius: radius.sm, alignItems: 'center', justifyContent: 'center' },
  body: { paddingLeft: LAYOUT.margin + 29 + space.md, paddingRight: LAYOUT.margin, paddingBottom: space.base, gap: space.sm },
  step: { flexDirection: 'row', gap: space.sm, alignItems: 'flex-start' },
  stepNum: { width: 16 },
});
