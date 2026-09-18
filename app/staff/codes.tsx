import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { Ionicons } from '@expo/vector-icons';

import { StaffScreen, Card, Button, Field, Badge, Stagger, Springy, SectionHeader } from '../../src/components';
import { Text, useTheme, radius, space, fonts } from '../../src/theme';
import { useBackend, useShelter } from '../../src/data';
import type { GuestCode } from '../../src/data';
import { relativeTime } from '../../src/lib/contact';

export default function StaffCodes() {
  const { c } = useTheme();
  const api = useBackend();
  const { codes } = useShelter();

  const [label, setLabel] = useState('');
  const [issued, setIssued] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const active = codes.filter((g) => g.active);
  const inactive = codes.filter((g) => !g.active);

  async function issue() {
    const code = await api.issueGuestCode(label.trim() || 'Unassigned');
    setIssued(code);
    setCopied(false);
    setLabel('');
  }

  return (
    <StaffScreen
      eyebrow="Console"
      title="Guest codes"
      subtitle="Issued at the front desk during intake. A code is the whole account — no name, no email, nothing to look up later."
    >
      <View style={styles.columns}>
        <View style={styles.colNarrow}>
          <Stagger index={1}>
            <SectionHeader title="Issue a code" />
            <Card>
              <Field
                label="Label for staff"
                value={label}
                onChangeText={setLabel}
                hint="A room or cohort — never a guest's name."
                placeholder="Room 2A"
              />
              <Button
                label="Issue code"
                icon="key-outline"
                full
                style={{ marginTop: space.lg }}
                onPress={issue}
              />
            </Card>

            {issued ? (
              <Stagger index={0} style={{ marginTop: space.md }}>
                <Card tone="primary">
                  <Text variant="label" caps tone="primary">
                    New code
                  </Text>
                  <Text
                    style={{
                      fontFamily: fonts.displayBold,
                      fontSize: 30,
                      lineHeight: 38,
                      letterSpacing: 1.5,
                      color: c.ink,
                      marginTop: space.sm,
                    }}
                    selectable
                  >
                    {issued}
                  </Text>
                  <Text variant="caption" tone="muted" style={{ marginTop: space.sm }}>
                    Write this down for the guest. It is not tied to anything that identifies
                    them, so it cannot be recovered — issue a new one if it is lost.
                  </Text>
                  <Button
                    label={copied ? 'Copied' : 'Copy'}
                    icon={copied ? 'checkmark' : 'copy-outline'}
                    size="sm"
                    variant={copied ? 'soft' : 'secondary'}
                    style={{ marginTop: space.base }}
                    onPress={async () => {
                      await Clipboard.setStringAsync(issued);
                      setCopied(true);
                    }}
                  />
                </Card>
              </Stagger>
            ) : null}
          </Stagger>
        </View>

        <View style={styles.col}>
          <Stagger index={2}>
            <SectionHeader title="Active" action={<Badge label={String(active.length)} tone="onShift" />} />
            {active.length === 0 ? (
              <Card tone="alt" flat>
                <Text variant="callout" tone="muted">
                  No active codes.
                </Text>
              </Card>
            ) : (
              <Card padded={false}>
                {active.map((g, i) => (
                  <CodeRow key={g.code} entry={g} last={i === active.length - 1} />
                ))}
              </Card>
            )}
          </Stagger>

          {inactive.length > 0 ? (
            <Stagger index={3} style={{ marginTop: space.xl }}>
              <SectionHeader title="Retired" action={<Badge label={String(inactive.length)} tone="neutral" />} />
              <Card padded={false}>
                {inactive.map((g, i) => (
                  <CodeRow key={g.code} entry={g} last={i === inactive.length - 1} />
                ))}
              </Card>
            </Stagger>
          ) : null}
        </View>
      </View>
    </StaffScreen>
  );
}

function CodeRow({ entry, last }: { entry: GuestCode; last: boolean }) {
  const { c } = useTheme();
  const api = useBackend();

  return (
    <View
      style={[
        styles.row,
        !last && { borderBottomWidth: StyleSheet.hairlineWidth * 2, borderBottomColor: c.line },
        !entry.active && { opacity: 0.55 },
      ]}
    >
      <View style={[styles.chip, { backgroundColor: entry.active ? c.primarySoft : c.surfaceAlt }]}>
        <Ionicons name="key-outline" size={17} color={entry.active ? c.primary : c.inkFaint} />
      </View>

      <View style={{ flex: 1 }}>
        <Text style={{ fontFamily: fonts.bodySemi, fontSize: 15, color: c.ink, letterSpacing: 0.8 }} selectable>
          {entry.code}
        </Text>
        <Text variant="caption" tone="muted" style={{ marginTop: 2 }}>
          {entry.label} · issued {relativeTime(entry.issuedAt)}
        </Text>
      </View>

      <Button
        label={entry.active ? 'Retire' : 'Restore'}
        size="sm"
        variant="ghost"
        onPress={() => api.setCodeActive(entry.code, !entry.active)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  columns: { flexDirection: 'row', flexWrap: 'wrap', gap: space.xl },
  colNarrow: { flexGrow: 1, flexBasis: 320, minWidth: 280 },
  col: { flexGrow: 2, flexBasis: 400, minWidth: 280 },
  row: { flexDirection: 'row', alignItems: 'center', gap: space.md, padding: space.base },
  chip: { width: 38, height: 38, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center' },
});
