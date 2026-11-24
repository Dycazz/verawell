import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { Group } from './Group';
import { Row } from './Row';
import { Button } from './Button';
import { Field } from './Field';
import { Segmented } from './Segmented';
import { Springy } from './Pressable';
import { Text, useTheme, space } from '../theme';

export interface FieldDef {
  key: string;
  label: string;
  multiline?: boolean;
  placeholder?: string;
  /** Short exclusive choices, rendered as a segmented control. */
  options?: { value: string; label: string }[];
  optional?: boolean;
}

type Item = { id: string } & Record<string, unknown>;

/**
 * A small CRUD form + list. Five different kinds of staff content share this so
 * the console doesn't need five near-identical screens, and a new content type
 * is a field list rather than a page.
 */
export function ContentEditor<T extends Item>({
  items,
  fields,
  noun,
  titleOf,
  subtitleOf,
  onSave,
  onRemove,
}: {
  items: T[];
  fields: FieldDef[];
  noun: string;
  titleOf: (item: T) => string;
  subtitleOf?: (item: T) => string | undefined;
  onSave: (item: T) => Promise<void> | void;
  onRemove: (id: string) => Promise<void> | void;
}) {
  const { c } = useTheme();
  const blank = () =>
    Object.fromEntries(fields.map((f) => [f.key, f.options ? f.options[0].value : ''])) as Record<string, string>;

  const [editing, setEditing] = useState<string | null>(null);
  const [draft, setDraft] = useState<Record<string, string>>(blank);

  const valid = fields.every((f) => f.optional || f.options || (draft[f.key] ?? '').trim().length > 0);

  function edit(item: T) {
    setEditing(item.id);
    setDraft(
      Object.fromEntries(
        fields.map((f) => {
          const v = String(item[f.key] ?? '');
          // A stored value that isn't one of the choices (e.g. pinned=false)
          // falls back to the first option so the control shows a selection.
          return [f.key, f.options && !f.options.some((o) => o.value === v) ? f.options[0].value : v];
        }),
      ),
    );
  }

  function reset() {
    setEditing(null);
    setDraft(blank());
  }

  async function save() {
    if (!valid) return;
    const existing = items.find((i) => i.id === editing);
    const cleaned = Object.fromEntries(
      fields.map((f) => {
        const v = (draft[f.key] ?? '').trim();
        return [f.key, v === '' && f.optional ? undefined : v];
      }),
    );
    const item = {
      ...(existing ?? { createdAt: Date.now() }),
      ...cleaned,
      id: existing?.id ?? `${noun[0]}${Date.now().toString(36)}`,
    } as unknown as T;
    await onSave(item);
    reset();
  }

  return (
    <View style={styles.columns}>
      <View style={styles.colNarrow}>
        <Group padded header={editing ? `Edit ${noun}` : `Add ${noun}`}>
          <View style={{ gap: space.md }}>
            {fields.map((f) =>
              f.options ? (
                <View key={f.key}>
                  <Text variant="footnote" tone="secondary" style={{ marginBottom: 6 }}>
                    {f.label}
                  </Text>
                  <Segmented
                    options={f.options}
                    value={draft[f.key]}
                    onChange={(v) => setDraft((d) => ({ ...d, [f.key]: v }))}
                  />
                </View>
              ) : (
                <Field
                  key={f.key}
                  label={f.optional ? `${f.label} (optional)` : f.label}
                  multiline={f.multiline}
                  placeholder={f.placeholder}
                  value={draft[f.key] ?? ''}
                  onChangeText={(v) => setDraft((d) => ({ ...d, [f.key]: v }))}
                />
              ),
            )}
            <Button label={editing ? 'Save changes' : `Add ${noun}`} full disabled={!valid} onPress={save} />
            {editing ? <Button label="Cancel" variant="plain" onPress={reset} /> : null}
          </View>
        </Group>
      </View>

      <View style={styles.col}>
        <Group header={`${items.length} ${items.length === 1 ? noun : noun.replace(/y$/, 'ie') + 's'}`}>
          {items.length === 0 ? (
            <Row title="Nothing here yet" accessory="none" />
          ) : (
            items.map((item) => (
              <Row
                key={item.id}
                title={titleOf(item)}
                subtitle={subtitleOf?.(item)}
                accessory="none"
                onPress={() => edit(item)}
                right={
                  <Springy
                    onPress={() => onRemove(item.id)}
                    scaleTo={0.9}
                    accessibilityRole="button"
                    accessibilityLabel={`Remove ${titleOf(item)}`}
                    style={styles.iconBtn}
                  >
                    <Ionicons name="trash" size={17} color={c.crisis} />
                  </Springy>
                }
              />
            ))
          )}
        </Group>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  columns: { flexDirection: 'row', flexWrap: 'wrap', gap: space.xl },
  colNarrow: { flexGrow: 1, flexBasis: 310, minWidth: 260 },
  col: { flexGrow: 2, flexBasis: 380, minWidth: 260 },
  iconBtn: { width: 30, height: 30, alignItems: 'center', justifyContent: 'center' },
});
