import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { Screen, Card, Button, Stagger, Springy, SectionHeader } from '../../src/components';
import { Text, useTheme, radius, space, fonts } from '../../src/theme';
import { useShelter } from '../../src/data';
import type { SafetyGuide } from '../../src/data';
import { callNumber } from '../../src/lib/contact';
import { QuickExit } from '../../src/safety';

const KIND_ICON: Record<SafetyGuide['kind'], keyof typeof Ionicons.glyphMap> = {
  personal: 'shield-checkmark-outline',
  fire: 'flame-outline',
  weather: 'thunderstorm-outline',
  medical: 'medkit-outline',
};

export default function Safety() {
  const { c } = useTheme();
  const { safety } = useShelter();

  // Personal safety opens by default — it is the one someone is most likely to be
  // opening this screen for, and a closed accordion costs a tap they may not have.
  const [open, setOpen] = useState<string | null>(safety[0]?.id ?? null);

  return (
    <Screen eyebrow="Safety" title="If something happens" headerRight={<QuickExit />}>
      <Stagger index={1}>
        <Card tone="crisis">
          <View style={{ flexDirection: 'row', gap: space.md, alignItems: 'flex-start' }}>
            <Ionicons name="warning-outline" size={22} color={c.crisis} style={{ marginTop: 2 }} />
            <View style={{ flex: 1 }}>
              <Text variant="subhead" tone="crisis">
                In immediate danger
              </Text>
              <Text variant="callout" tone="muted" style={{ marginTop: 4 }}>
                Call emergency services first. Tell an advocate after — they will meet
                responders at the door.
              </Text>
            </View>
          </View>
          <Button
            label="Call 911"
            variant="crisis"
            icon="call"
            full
            size="lg"
            style={{ marginTop: space.lg }}
            onPress={() => callNumber('911')}
          />
        </Card>
      </Stagger>

      <Stagger index={2} style={{ marginTop: space.xl }}>
        <SectionHeader title="What to do" />
        <View style={{ gap: space.md }}>
          {safety.map((g) => (
            <GuideCard
              key={g.id}
              guide={g}
              open={open === g.id}
              onToggle={() => setOpen(open === g.id ? null : g.id)}
            />
          ))}
        </View>
      </Stagger>
    </Screen>
  );
}

function GuideCard({
  guide,
  open,
  onToggle,
}: {
  guide: SafetyGuide;
  open: boolean;
  onToggle: () => void;
}) {
  const { c } = useTheme();

  return (
    <Card padded={false}>
      <Springy
        onPress={onToggle}
        scaleTo={0.99}
        accessibilityRole="button"
        accessibilityState={{ expanded: open }}
        accessibilityLabel={`${guide.title}. ${guide.summary}`}
        style={{ padding: space.lg }}
      >
        <View style={styles.head}>
          <View style={[styles.icon, { backgroundColor: c.primarySoft }]}>
            <Ionicons name={KIND_ICON[guide.kind]} size={20} color={c.primary} />
          </View>
          <View style={{ flex: 1 }}>
            <Text variant="subhead">{guide.title}</Text>
            <Text variant="caption" tone="muted" style={{ marginTop: 2 }}>
              {guide.summary}
            </Text>
          </View>
          <Ionicons name={open ? 'chevron-up' : 'chevron-down'} size={18} color={c.inkFaint} />
        </View>
      </Springy>

      {open ? (
        <Stagger index={0} distance={6} style={{ paddingHorizontal: space.lg, paddingBottom: space.lg }}>
          <View style={[styles.rule, { backgroundColor: c.line }]} />
          <View style={{ gap: space.md }}>
            {guide.steps.map((step, i) => (
              <View key={i} style={styles.step}>
                <View style={[styles.stepNum, { backgroundColor: c.surfaceAlt }]}>
                  <Text style={{ fontFamily: fonts.bodySemi, fontSize: 12, color: c.inkMuted }}>{i + 1}</Text>
                </View>
                <Text variant="callout" style={{ flex: 1 }}>
                  {step}
                </Text>
              </View>
            ))}
          </View>

          {guide.callNumber ? (
            <Button
              label={guide.callLabel ?? 'Call'}
              variant="crisis"
              icon="call"
              size="sm"
              style={{ marginTop: space.lg }}
              onPress={() => callNumber(guide.callNumber!)}
            />
          ) : null}
        </Stagger>
      ) : null}
    </Card>
  );
}

const styles = StyleSheet.create({
  head: { flexDirection: 'row', alignItems: 'center', gap: space.md },
  icon: { width: 40, height: 40, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center' },
  rule: { height: StyleSheet.hairlineWidth * 2, marginBottom: space.lg },
  step: { flexDirection: 'row', gap: space.md, alignItems: 'flex-start' },
  stepNum: { width: 22, height: 22, borderRadius: radius.pill, alignItems: 'center', justifyContent: 'center' },
});
