import type { ReferralKind, ReferralRequest } from '../data';

export const REFERRAL_KINDS: { value: ReferralKind; label: string }[] = [
  { value: 'legal', label: 'Legal' },
  { value: 'housing', label: 'Housing' },
  { value: 'financial', label: 'Financial' },
  { value: 'health', label: 'Health' },
  { value: 'other', label: 'Other' },
];

export const REFERRAL_STATUS: Record<
  ReferralRequest['status'],
  { label: string; tone: 'grey' | 'tint' | 'positive' | 'warn' }
> = {
  new: { label: 'Received', tone: 'grey' },
  'in-progress': { label: 'In progress', tone: 'tint' },
  referred: { label: 'Referred', tone: 'positive' },
  closed: { label: 'Closed', tone: 'grey' },
};
