import React from 'react';
import { StyleSheet, View } from 'react-native';

import { StaffScreen, Group, Row, Button, Badge } from '../../src/components';
import { space } from '../../src/theme';
import { useBackend, useShelter } from '../../src/data';
import type { WishlistItem } from '../../src/data';
import { relativeTime } from '../../src/lib/contact';

export default function StaffWishlist() {
  const api = useBackend();
  const { wishlist } = useShelter();

  const section = (status: WishlistItem['status'], title: string, empty: string) => {
    const items = wishlist.filter((w) => w.status === status);
    return (
      <View style={{ marginBottom: space['2xl'] }}>
        <Group header={`${title} (${items.length})`}>
          {items.length === 0 ? (
            <Row title={empty} accessory="none" />
          ) : (
            items.map((w) => (
              <View key={w.id} style={styles.row}>
                <View style={{ flex: 1 }}>
                  <Row
                    title={w.title}
                    subtitle={[w.note, w.kind === 'grocery' ? 'Grocery' : 'Bigger item', relativeTime(w.createdAt)]
                      .filter(Boolean)
                      .join(' · ')}
                    accessory="none"
                    right={<Badge label={w.kind === 'grocery' ? 'Grocery' : 'Big-ticket'} tone="grey" />}
                  />
                </View>
                <View style={styles.actions}>
                  {status === 'requested' ? (
                    <>
                      <Button label="Approve" size="sm" variant="tinted" onPress={() => api.setWishStatus(w.id, 'approved')} />
                      <Button label="Decline" size="sm" variant="plain" onPress={() => api.setWishStatus(w.id, 'declined')} />
                    </>
                  ) : null}
                  {status === 'approved' ? (
                    <Button label="Got it" size="sm" variant="tinted" onPress={() => api.setWishStatus(w.id, 'fulfilled')} />
                  ) : null}
                  {status === 'declined' || status === 'fulfilled' ? (
                    <Button label="Reopen" size="sm" variant="plain" onPress={() => api.setWishStatus(w.id, 'requested')} />
                  ) : null}
                </View>
              </View>
            ))
          )}
        </Group>
      </View>
    );
  };

  return (
    <StaffScreen
      title="Wishlist"
      subtitle="Guests add items anonymously. Approving one publishes it to Current Needs; marking it got-it flips it to stocked."
    >
      <View style={styles.wrap}>
        {section('requested', 'To review', 'Nothing waiting')}
        {section('approved', 'On the public needs list', 'None approved')}
        {section('fulfilled', 'Received', 'None yet')}
        {section('declined', 'Declined', 'None')}
      </View>
    </StaffScreen>
  );
}

const styles = StyleSheet.create({
  wrap: { maxWidth: 760 },
  row: { flexDirection: 'row', alignItems: 'center' },
  actions: { flexDirection: 'row', gap: space.xs, paddingRight: 12 },
});
