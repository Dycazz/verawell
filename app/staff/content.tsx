import React, { useState } from 'react';

import { StaffScreen, Segmented, ContentEditor } from '../../src/components';
import type { FieldDef } from '../../src/components';
import { space } from '../../src/theme';
import { useBackend, useShelter } from '../../src/data';
import type { ContentKey, ContentMap } from '../../src/data';

type Section = { key: ContentKey; label: string; noun: string; fields: FieldDef[] };

const SECTIONS: Section[] = [
  {
    key: 'news',
    label: 'News',
    noun: 'post',
    fields: [
      { key: 'title', label: 'Headline' },
      { key: 'body', label: 'Body', multiline: true },
      { key: 'pinned', label: 'Pin to top', options: [{ value: '', label: 'No' }, { value: 'true', label: 'Pinned' }] },
    ],
  },
  {
    key: 'ways',
    label: 'Ways to help',
    noun: 'opportunity',
    fields: [
      { key: 'title', label: 'Title' },
      { key: 'description', label: 'Description', multiline: true },
      {
        key: 'kind',
        label: 'Type',
        options: [
          { value: 'drive', label: 'Drive' },
          { value: 'dropoff', label: 'Drop-off' },
          { value: 'skills', label: 'Skills' },
          { value: 'event', label: 'Event' },
        ],
      },
      { key: 'when', label: 'When', optional: true, placeholder: 'Saturdays, 10am' },
    ],
  },
  {
    key: 'amenities',
    label: 'Amenities',
    noun: 'amenity',
    fields: [
      { key: 'name', label: 'Name' },
      { key: 'description', label: 'Description', multiline: true },
      { key: 'location', label: 'Where' },
      { key: 'hours', label: 'Hours', optional: true },
    ],
  },
  {
    key: 'places',
    label: 'Neighbourhood',
    noun: 'place',
    fields: [
      { key: 'name', label: 'Name' },
      {
        key: 'kind',
        label: 'Type',
        options: [
          { value: 'transit', label: 'Transit' },
          { value: 'grocery', label: 'Grocery' },
          { value: 'clinic', label: 'Clinic' },
          { value: 'pharmacy', label: 'Pharmacy' },
          { value: 'library', label: 'Library' },
          { value: 'other', label: 'Other' },
        ],
      },
      { key: 'note', label: 'Note', multiline: true },
      { key: 'distance', label: 'Distance from shelter', optional: true },
      { key: 'address', label: 'Address', optional: true },
      { key: 'phone', label: 'Phone', optional: true },
    ],
  },
  {
    key: 'library',
    label: 'Guides',
    noun: 'guide',
    fields: [
      { key: 'title', label: 'Title' },
      { key: 'summary', label: 'One-line summary' },
      {
        key: 'category',
        label: 'Category',
        options: [
          { value: 'rights', label: 'Rights' },
          { value: 'housing', label: 'Housing' },
          { value: 'money', label: 'Money' },
          { value: 'health', label: 'Health' },
        ],
      },
      { key: 'body', label: 'Body', multiline: true },
    ],
  },
];

export default function StaffContent() {
  const api = useBackend();
  const state = useShelter();
  const [key, setKey] = useState<ContentKey>('news');
  const section = SECTIONS.find((s) => s.key === key)!;

  return (
    <StaffScreen title="Content" subtitle="What the public app and the guest app show. Tap an item to edit it.">
      <Segmented
        options={SECTIONS.map((s) => ({ value: s.key, label: s.label }))}
        value={key}
        onChange={setKey}
        style={{ marginBottom: space.lg, maxWidth: 640 }}
      />

      {/* Keyed so switching sections remounts the editor with a clean draft. */}
      <ContentEditor
        key={key}
        noun={section.noun}
        items={state[key] as unknown as ({ id: string } & Record<string, unknown>)[]}
        fields={section.fields}
        titleOf={(i) => String(i.title ?? i.name)}
        subtitleOf={(i) => String(i.summary ?? i.description ?? i.note ?? i.body ?? '').slice(0, 90)}
        onSave={(item) => {
          // Segmented "pin" arrives as a string; turn it back into a boolean.
          const next = key === 'news' ? { ...item, pinned: item.pinned === 'true' || item.pinned === true } : item;
          return api.upsertContent(key, next as unknown as ContentMap[typeof key]);
        }}
        onRemove={(id) => api.removeContent(key, id)}
      />
    </StaffScreen>
  );
}
