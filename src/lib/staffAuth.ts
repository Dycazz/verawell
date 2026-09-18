/**
 * Prototype staff credential.
 *
 * Stands in for whatever the real build uses — Supabase email auth, an SSO
 * provider, or staff accounts issued by the shelter's IT. It is hard-coded here
 * only so the console is reachable in a demo, and it is checked on the client,
 * which is exactly why it must not survive into production.
 */
export const DEMO_STAFF_PIN = '2468';

export function checkStaffPin(entered: string): boolean {
  return entered.trim() === DEMO_STAFF_PIN;
}
