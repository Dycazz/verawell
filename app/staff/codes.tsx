import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import * as Clipboard from 'expo-clipboard';

import { StaffScreen, Group, Row, Button, Field } from '../../src/components';
import { Text, useTheme, space, weight } from '../../src/theme';
import { useBackend, useShelter } from '../../src/data';
import { relativeTime } from '../../src/lib/contact';

export default function StaffCodes() {
  const { c } = useTheme();
  const api = useBackend();
  const { codes } = useShelter();

  const [label, setLabel] = useState('');
  const [issued, setIssued] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const active = codes.filter((g) => g.active);
  const retired = codes.filter((g) => !g.active);

  async function issue() {
    const code = await api.issueGuestCode(label.trim() || 'Unassigned');
    setIssued(code);
    setCopied(false);
    setLabel('');
  }

  return (
    <StaffScreen
      title="Guest codes"
      subtitle="Issued at the front desk during intake. A code is the whole account — no name, nothing to look up later."
    >
      <View style={styles.columns}>
        <View style={styles.colNarrow}>
          <Group padded header="Issue a code" footer="A room or cohort — never a guest's name.">
            <Field label="Label for staff" value={label} onChangeText={setLabel} placeholder="Room 2A" />
            <Button label="Issue code" full style={{ marginTop: space.md }} onPress={issue} />
          </Group>

          {issued ? (
            <View style={{ marginTop: space.lg }}>
              <Group
                padded
                header="New code"
                footer="Write this down for the guest. Nothing links it to a person, so it cannot be recovered — issue a new one if it is lost."
              >
                <Text selectable style={[styles.code, { color: c.label }]}>
                  {issued}
                </Text>
                <Button
                  label={copied ? 'Copied' : 'Copy'}
                  size="sm"
                  variant={copied ? 'tinted' : 'filled'}
                  style={{ marginTop: space.md }}
                  onPress={async () => {
                    await Clipboard.setStringAsync(issued);
                    setCopied(true);
                  }}
                />
              </Group>
            </View>
          ) : null}
        </View>

        <View style={styles.col}>
          <Group header={`Active (${active.length})`}>
            {active.length === 0 ? (
              <Row title="No active codes" accessory="none" />
            ) : (
              active.map((g) => (
                <Row
                  key={g.code}
                  icon="key"
                  accent="tint"
                  title={g.code}
                  subtitle={`${g.label} · issued ${relativeTime(g.issuedAt)}`}
                  accessory="none"
                  right={
                    <Button label="Retire" size="sm" variant="plain" onPress={() => api.setCodeActive(g.code, false)} />
                  }
                />
              ))
            )}
          </Group>

          {retired.length > 0 ? (
            <View style={{ marginTop: space['2xl'] }}>
              <Group header={`Retired (${retired.length})`}>
                {retired.map((g) => (
                  <Row
                    key={g.code}
                    icon="key"
                    accent="grey"
                    title={g.code}
                    subtitle={`${g.label} · issued ${relativeTime(g.issuedAt)}`}
                    accessory="none"
                    right={
                      <Button label="Restore" size="sm" variant="plain" onPress={() => api.setCodeActive(g.code, true)} />
                    }
                  />
                ))}
              </Group>
            </View>
          ) : null}
        </View>
      </View>
    </StaffScreen>
  );
}

const styles = StyleSheet.create({
  columns: { flexDirection: 'row', flexWrap: 'wrap', gap: space.xl },
  colNarrow: { flexGrow: 1, flexBasis: 310, minWidth: 260 },
  col: { flexGrow: 2, flexBasis: 380, minWidth: 260 },
  code: { fontSize: 30, lineHeight: 36, letterSpacing: 1.5, ...weight('700') },
});
