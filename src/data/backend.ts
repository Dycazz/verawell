import AsyncStorage from '@react-native-async-storage/async-storage';
import { createSeedState } from './seed';
import type {
  AdvocateThread,
  CalendarEntry,
  NeedItem,
  PublicMessage,
  ShelterAlert,
  ShelterState,
  ShiftStatus,
} from './types';

/**
 * Everything the app can ask of a server.
 *
 * The prototype ships `LocalBackend`, which keeps the same shape a Supabase or
 * Firebase client would: one subscribe, a synchronous read of the last snapshot,
 * and mutations that resolve and then notify. Swapping in a real backend means
 * writing a second implementation of this interface and changing one line in
 * `store.tsx` — no screen has to change.
 */
export interface Backend {
  subscribe(listener: () => void): () => void;
  getSnapshot(): ShelterState;
  ready(): Promise<void>;

  upsertNeed(need: Omit<NeedItem, 'updatedAt'>): Promise<void>;
  removeNeed(id: string): Promise<void>;

  setShift(next: Partial<ShiftStatus>): Promise<void>;

  postAlert(body: string, kind: ShelterAlert['kind'], hours?: number): Promise<void>;
  removeAlert(id: string): Promise<void>;

  upsertEvent(entry: CalendarEntry): Promise<void>;
  removeEvent(id: string): Promise<void>;

  openThread(guestCode: string, topic: string, body: string, urgent: boolean): Promise<string>;
  replyToThread(id: string, from: 'guest' | 'advocate', body: string): Promise<void>;
  markThreadRead(id: string, as: 'guest' | 'staff'): Promise<void>;

  submitPublicMessage(msg: Omit<PublicMessage, 'id' | 'createdAt' | 'handled'>): Promise<void>;
  setPublicMessageHandled(id: string, handled: boolean): Promise<void>;

  issueGuestCode(label: string): Promise<string>;
  setCodeActive(code: string, active: boolean): Promise<void>;
  verifyGuestCode(code: string): Promise<boolean>;

  /** Demo affordance: puts the prototype back to its seeded state. */
  reset(): Promise<void>;
}

const KEY = 'verawell.shelter.v1';

let counter = 0;
const id = (prefix: string) => `${prefix}${Date.now().toString(36)}${(counter++).toString(36)}`;

const WORDS = ['HARBOR', 'WILLOW', 'CEDAR', 'MERIDIAN', 'ORCHARD', 'LANTERN', 'JUNIPER', 'BEACON'];

/**
 * In-process store standing in for the hosted database.
 *
 * Note on the persistence boundary: what this writes to AsyncStorage represents
 * *server* state, not a device-side cache of a guest's data. Anything tied to a
 * guest session (who is signed in, which code) is held in memory by the session
 * layer and never reaches disk — see `src/safety/session.tsx`.
 */
export class LocalBackend implements Backend {
  private state: ShelterState = createSeedState();
  private listeners = new Set<() => void>();
  private loaded: Promise<void>;

  constructor() {
    this.loaded = this.hydrate();
  }

  private async hydrate() {
    try {
      const raw = await AsyncStorage.getItem(KEY);
      if (raw) this.state = { ...createSeedState(), ...(JSON.parse(raw) as ShelterState) };
    } catch {
      // A corrupt or unavailable store is not worth failing the app over —
      // the seeded state is a perfectly good starting point.
    }
    this.emit();
  }

  ready() {
    return this.loaded;
  }

  subscribe(listener: () => void) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  getSnapshot() {
    return this.state;
  }

  private emit() {
    for (const l of this.listeners) l();
  }

  /** Every mutation goes through here so persistence and notification cannot drift apart. */
  private async commit(next: (s: ShelterState) => ShelterState) {
    this.state = next(this.state);
    this.emit();
    try {
      await AsyncStorage.setItem(KEY, JSON.stringify(this.state));
    } catch {
      // Keep the in-memory change; a failed write should not roll back the UI.
    }
  }

  async upsertNeed(need: Omit<NeedItem, 'updatedAt'>) {
    await this.commit((s) => {
      const item: NeedItem = { ...need, updatedAt: Date.now() };
      const exists = s.needs.some((n) => n.id === item.id);
      return {
        ...s,
        needs: exists ? s.needs.map((n) => (n.id === item.id ? item : n)) : [item, ...s.needs],
      };
    });
  }

  async removeNeed(needId: string) {
    await this.commit((s) => ({ ...s, needs: s.needs.filter((n) => n.id !== needId) }));
  }

  async setShift(next: Partial<ShiftStatus>) {
    await this.commit((s) => ({ ...s, shift: { ...s.shift, ...next, updatedAt: Date.now() } }));
  }

  async postAlert(body: string, kind: ShelterAlert['kind'], hours = 24) {
    await this.commit((s) => ({
      ...s,
      alerts: [
        { id: id('a'), body, kind, createdAt: Date.now(), expiresAt: Date.now() + hours * 3_600_000 },
        ...s.alerts,
      ],
    }));
  }

  async removeAlert(alertId: string) {
    await this.commit((s) => ({ ...s, alerts: s.alerts.filter((a) => a.id !== alertId) }));
  }

  async upsertEvent(entry: CalendarEntry) {
    await this.commit((s) => {
      const exists = s.calendar.some((e) => e.id === entry.id);
      return {
        ...s,
        calendar: exists ? s.calendar.map((e) => (e.id === entry.id ? entry : e)) : [...s.calendar, entry],
      };
    });
  }

  async removeEvent(entryId: string) {
    await this.commit((s) => ({ ...s, calendar: s.calendar.filter((e) => e.id !== entryId) }));
  }

  async openThread(guestCode: string, topic: string, body: string, urgent: boolean) {
    const threadId = id('t');
    await this.commit((s) => ({
      ...s,
      threads: [
        {
          id: threadId,
          guestCode,
          topic,
          urgent,
          createdAt: Date.now(),
          unreadForStaff: 1,
          unreadForGuest: 0,
          messages: [{ id: id('m'), from: 'guest', body, createdAt: Date.now() }],
        },
        ...s.threads,
      ],
    }));
    return threadId;
  }

  async replyToThread(threadId: string, from: 'guest' | 'advocate', body: string) {
    await this.commit((s) => ({
      ...s,
      threads: s.threads.map((t) =>
        t.id !== threadId
          ? t
          : {
              ...t,
              messages: [...t.messages, { id: id('m'), from, body, createdAt: Date.now() }],
              unreadForStaff: from === 'guest' ? t.unreadForStaff + 1 : t.unreadForStaff,
              unreadForGuest: from === 'advocate' ? t.unreadForGuest + 1 : t.unreadForGuest,
            },
      ),
    }));
  }

  async markThreadRead(threadId: string, as: 'guest' | 'staff') {
    await this.commit((s) => ({
      ...s,
      threads: s.threads.map((t) =>
        t.id !== threadId ? t : { ...t, [as === 'guest' ? 'unreadForGuest' : 'unreadForStaff']: 0 },
      ),
    }));
  }

  async submitPublicMessage(msg: Omit<PublicMessage, 'id' | 'createdAt' | 'handled'>) {
    await this.commit((s) => ({
      ...s,
      publicMessages: [{ ...msg, id: id('p'), createdAt: Date.now(), handled: false }, ...s.publicMessages],
    }));
  }

  async setPublicMessageHandled(msgId: string, handled: boolean) {
    await this.commit((s) => ({
      ...s,
      publicMessages: s.publicMessages.map((m) => (m.id === msgId ? { ...m, handled } : m)),
    }));
  }

  async issueGuestCode(label: string) {
    const word = WORDS[Math.floor(Math.random() * WORDS.length)];
    const code = `${word}-${Math.floor(100 + Math.random() * 900)}`;
    await this.commit((s) => ({
      ...s,
      codes: [{ code, label, issuedAt: Date.now(), active: true }, ...s.codes],
    }));
    return code;
  }

  async setCodeActive(code: string, active: boolean) {
    await this.commit((s) => ({
      ...s,
      codes: s.codes.map((g) => (g.code === code ? { ...g, active } : g)),
    }));
  }

  async verifyGuestCode(code: string) {
    await this.loaded;
    const normalized = code.trim().toUpperCase();
    return this.state.codes.some((g) => g.active && g.code === normalized);
  }

  async reset() {
    this.state = createSeedState();
    this.emit();
    await AsyncStorage.removeItem(KEY).catch(() => {});
  }
}
