import React from 'react';
import { router } from 'expo-router';

import { StaffScreen, Group, Row, Badge } from '../../src/components';
import { useStaffCounts } from '../../src/data';
import { useSession } from '../../src/safety';

/** Phone-only hub for the console pages that don't get a tab of their own. */
export default function More() {
  const counts = useStaffCounts();
  const { signOut } = useSession();

  const link = (href: string, icon: React.ComponentProps<typeof Row>['icon'], title: string, subtitle: string, n = 0) => (
    <Row
      icon={icon}
      title={title}
      subtitle={subtitle}
      onPress={() => router.push(href as never)}
      right={n > 0 ? <Badge label={String(n)} tone="crisis" /> : undefined}
    />
  );

  return (
    <StaffScreen title="More">
      <Group header="Requests">
        {link('/staff/requests', 'people', 'Volunteers & training', 'Sign-ups and requests from the community', counts.requests)}
        {link('/staff/referrals', 'swap-horizontal', 'Referrals', 'Legal, housing and financial requests', counts.referrals)}
        {link('/staff/feedback', 'megaphone', 'Feedback', 'Anonymous concerns and ideas', counts.feedback)}
      </Group>

      <Group header="House" style={{ marginTop: 24 }}>
        {link('/staff/wishlist', 'cart', 'Wishlist', 'Guest requests that feed Current Needs', counts.wishlist)}
        {link('/staff/chores', 'checkbox', 'Chores', 'Chore list and daily reset')}
        {link('/staff/content', 'newspaper', 'Content', 'News, ways to help, amenities, guides')}
        {link('/staff/codes', 'key', 'Guest codes', 'Issue and retire access codes')}
      </Group>

      <Group style={{ marginTop: 24 }}>
        <Row
          title="Sign out"
          destructive
          accessory="none"
          onPress={() => {
            signOut('manual');
            router.replace('/');
          }}
        />
      </Group>
    </StaffScreen>
  );
}
