/** Domain types. Deliberately free of anything that identifies a guest by name. */

export type Urgency = 'urgent' | 'ongoing' | 'stocked';

export interface NeedItem {
  id: string;
  title: string;
  note?: string;
  urgency: Urgency;
  category: 'household' | 'food' | 'hygiene' | 'kids' | 'bedding' | 'other';
  updatedAt: number;
}

export type AlertKind = 'info' | 'delivery' | 'weather' | 'urgent';

export interface ShelterAlert {
  id: string;
  body: string;
  kind: AlertKind;
  createdAt: number;
  /** Alerts age out so the board never becomes a wall of stale notices. */
  expiresAt?: number;
}

export type EventKind = 'meal' | 'group' | 'curfew' | 'appointment' | 'chore';

export interface CalendarEntry {
  id: string;
  /** ISO date, YYYY-MM-DD. */
  day: string;
  /** 24h HH:MM, so sorting is a string compare. */
  time: string;
  endTime?: string;
  title: string;
  kind: EventKind;
  location?: string;
  note?: string;
}

export interface ShiftStatus {
  advocatesOnShift: number;
  officeOpen: boolean;
  /** Free text the guest side shows verbatim, e.g. "Back at 3:30". */
  note?: string;
  nextChangeover?: string;
  updatedAt: number;
}

export interface ThreadMessage {
  id: string;
  from: 'guest' | 'advocate';
  body: string;
  createdAt: number;
}

export interface AdvocateThread {
  id: string;
  /** The anonymous code is the only handle staff ever see. */
  guestCode: string;
  topic: string;
  urgent: boolean;
  createdAt: number;
  messages: ThreadMessage[];
  unreadForStaff: number;
  unreadForGuest: number;
}

export interface PublicMessage {
  id: string;
  /** Optional on purpose — the community can ask anonymously too. */
  name?: string;
  contactBack?: string;
  topic: 'general' | 'donation' | 'volunteer' | 'training';
  body: string;
  createdAt: number;
  handled: boolean;
}

export interface GuestCode {
  code: string;
  /** A room or cohort label for staff — never a legal name. */
  label: string;
  issuedAt: number;
  active: boolean;
}

export interface GuidelineSection {
  id: string;
  title: string;
  icon: string;
  items: string[];
}

export interface CommunityResource {
  id: string;
  name: string;
  description: string;
  phone?: string;
  url?: string;
  category: 'crisis' | 'housing' | 'legal' | 'health' | 'food' | 'family';
  available?: string;
}

export interface SafetyGuide {
  id: string;
  kind: 'personal' | 'fire' | 'weather' | 'medical';
  title: string;
  summary: string;
  steps: string[];
  callLabel?: string;
  callNumber?: string;
}

export interface ShelterProfile {
  name: string;
  tagline: string;
  crisisLine: string;
  officePhone: string;
  donateUrl: string;
  website: string;
  socials: { label: string; url: string; icon: string }[];
}

export interface ShelterState {
  profile: ShelterProfile;
  needs: NeedItem[];
  alerts: ShelterAlert[];
  calendar: CalendarEntry[];
  shift: ShiftStatus;
  threads: AdvocateThread[];
  publicMessages: PublicMessage[];
  codes: GuestCode[];
  guidelines: GuidelineSection[];
  resources: CommunityResource[];
  safety: SafetyGuide[];
}
