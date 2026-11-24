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
  /** Absent on older records, which were all advocate threads. */
  channel?: 'advocate' | 'helpdesk';
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

/* ---- Fast follow and Phase 2 ------------------------------------------- */

export interface NewsPost {
  id: string;
  title: string;
  body: string;
  pinned?: boolean;
  createdAt: number;
}

export type HelpKind = 'drive' | 'dropoff' | 'skills' | 'event';

export interface WayToHelp {
  id: string;
  title: string;
  description: string;
  kind: HelpKind;
  /** Free text so staff can write "Saturdays, 10am" without a schedule model. */
  when?: string;
}

export interface Amenity {
  id: string;
  name: string;
  description: string;
  location: string;
  hours?: string;
}

export type PlaceKind = 'transit' | 'grocery' | 'clinic' | 'pharmacy' | 'library' | 'other';

/**
 * Static, staff-curated. There is no "near me" lookup on purpose: the app never
 * asks for location, so the guide lists places relative to the shelter instead.
 */
export interface Place {
  id: string;
  name: string;
  kind: PlaceKind;
  note: string;
  distance?: string;
  address?: string;
  phone?: string;
}

export interface LibraryArticle {
  id: string;
  title: string;
  summary: string;
  category: 'rights' | 'housing' | 'money' | 'health' | 'family' | 'safety';
  /** Paragraphs separated by blank lines. */
  body: string;
}

/** Everything staff can edit through the console's generic content editor. */
export interface ContentMap {
  news: NewsPost;
  ways: WayToHelp;
  amenities: Amenity;
  places: Place;
  library: LibraryArticle;
}
export type ContentKey = keyof ContentMap;

/** Volunteer sign-ups and training requests from the public app. */
export interface CommunityRequest {
  id: string;
  kind: 'volunteer' | 'training';
  /** Optional on purpose, as with every public form. */
  name?: string;
  contactBack?: string;
  summary: string;
  fields: { label: string; value: string }[];
  createdAt: number;
  handled: boolean;
}

export interface Chore {
  id: string;
  title: string;
  area: string;
  /** Deliberately no "done by" — check-off is anonymous. */
  doneAt?: number;
}

export type FeedbackKind = 'concern' | 'idea' | 'thanks';

/**
 * No guest code, no device id, no author. The only link between a submission
 * and a person is whatever the person writes themselves.
 */
export interface Feedback {
  id: string;
  kind: FeedbackKind;
  body: string;
  createdAt: number;
  status: 'new' | 'seen' | 'resolved';
  /** When set, shown to every guest as "You said, we did". */
  publicReply?: string;
}

export type WishKind = 'grocery' | 'big-ticket';

/**
 * A shared, anonymous household list. Approving an item publishes it to
 * Current Needs, which is how one list powers both audiences.
 */
export interface WishlistItem {
  id: string;
  kind: WishKind;
  title: string;
  note?: string;
  createdAt: number;
  status: 'requested' | 'approved' | 'fulfilled' | 'declined';
}

export type ReferralKind = 'legal' | 'housing' | 'financial' | 'health' | 'other';

/**
 * Phase 2. Kept as an internal queue shaped so a case-management system could
 * ingest it later — the integration itself depends on which system the shelter
 * uses, which the spec lists as an open question.
 */
export interface ReferralRequest {
  id: string;
  guestCode: string;
  kind: ReferralKind;
  details: string;
  createdAt: number;
  updatedAt: number;
  status: 'new' | 'in-progress' | 'referred' | 'closed';
  /** Staff-written, visible to the guest who asked. */
  staffNote?: string;
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
  news: NewsPost[];
  ways: WayToHelp[];
  amenities: Amenity[];
  places: Place[];
  library: LibraryArticle[];
  communityRequests: CommunityRequest[];
  chores: Chore[];
  feedback: Feedback[];
  wishlist: WishlistItem[];
  referrals: ReferralRequest[];
}
