import React, { createContext, useContext, useMemo, useSyncExternalStore } from 'react';
import { LocalBackend, type Backend } from './backend';
import type { CalendarEntry, ShelterState } from './types';

/**
 * Single place a real backend gets wired in. Replace `new LocalBackend()` with a
 * Supabase-backed implementation of `Backend` and nothing above this line moves.
 */
const backend: Backend = new LocalBackend();

const BackendContext = createContext<Backend>(backend);

export function ShelterProvider({ children }: { children: React.ReactNode }) {
  return <BackendContext.Provider value={backend}>{children}</BackendContext.Provider>;
}

export function useBackend() {
  return useContext(BackendContext);
}

export function useShelter(): ShelterState {
  const api = useBackend();
  return useSyncExternalStore(
    (cb) => api.subscribe(cb),
    () => api.getSnapshot(),
    () => api.getSnapshot(),
  );
}

/* ----------------------------------------------------------------------------
 * Derived views
 * Kept here rather than in screens so the public app and the console cannot
 * disagree about what "urgent" or "today" means.
 * ------------------------------------------------------------------------- */

export function useLiveAlerts() {
  const { alerts } = useShelter();
  return useMemo(() => {
    const now = Date.now();
    return alerts
      .filter((a) => !a.expiresAt || a.expiresAt > now)
      .sort((a, b) => b.createdAt - a.createdAt);
  }, [alerts]);
}

export function useNeeds() {
  const { needs } = useShelter();
  return useMemo(() => {
    const rank = { urgent: 0, ongoing: 1, stocked: 2 } as const;
    const sorted = [...needs].sort(
      (a, b) => rank[a.urgency] - rank[b.urgency] || b.updatedAt - a.updatedAt,
    );
    return {
      all: sorted,
      urgent: sorted.filter((n) => n.urgency === 'urgent'),
      ongoing: sorted.filter((n) => n.urgency === 'ongoing'),
      stocked: sorted.filter((n) => n.urgency === 'stocked'),
    };
  }, [needs]);
}

export const todayISO = () => new Date().toISOString().slice(0, 10);

export function useCalendarByDay() {
  const { calendar } = useShelter();
  return useMemo(() => {
    const groups = new Map<string, CalendarEntry[]>();
    for (const e of [...calendar].sort((a, b) => a.day.localeCompare(b.day) || a.time.localeCompare(b.time))) {
      const list = groups.get(e.day) ?? [];
      list.push(e);
      groups.set(e.day, list);
    }
    return [...groups.entries()].map(([day, entries]) => ({ day, entries }));
  }, [calendar]);
}

/** The next thing happening today — the one calendar fact worth putting on a home screen. */
export function useNextEvent(): CalendarEntry | undefined {
  const { calendar } = useShelter();
  return useMemo(() => {
    const now = new Date();
    const hhmm = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    const today = todayISO();
    return [...calendar]
      .filter((e) => e.day > today || (e.day === today && (e.endTime ?? e.time) >= hhmm))
      .sort((a, b) => a.day.localeCompare(b.day) || a.time.localeCompare(b.time))[0];
  }, [calendar]);
}

export function useThreadsForCode(code: string | null) {
  const { threads } = useShelter();
  return useMemo(
    () =>
      code
        ? threads.filter((t) => t.guestCode === code).sort((a, b) => lastAt(b) - lastAt(a))
        : [],
    [threads, code],
  );
}

export function useStaffInbox() {
  const { threads, publicMessages } = useShelter();
  return useMemo(() => {
    const sorted = [...threads].sort(
      (a, b) => Number(b.urgent) - Number(a.urgent) || lastAt(b) - lastAt(a),
    );
    return {
      threads: sorted,
      unreadThreads: sorted.filter((t) => t.unreadForStaff > 0).length,
      publicMessages: [...publicMessages].sort((a, b) => b.createdAt - a.createdAt),
      openPublic: publicMessages.filter((m) => !m.handled).length,
    };
  }, [threads, publicMessages]);
}

const lastAt = (t: { messages: { createdAt: number }[]; createdAt: number }) =>
  t.messages.at(-1)?.createdAt ?? t.createdAt;
