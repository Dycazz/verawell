import { Alert, Linking, Platform } from 'react-native';

/**
 * Outbound actions. Every one of these hands off to the OS — the app never dials
 * or sends anything on its own, so nothing leaves the device without the person
 * seeing their own dialler or browser open.
 */

async function open(url: string, failure: string) {
  try {
    const ok = await Linking.canOpenURL(url);
    if (!ok) throw new Error('unsupported');
    await Linking.openURL(url);
  } catch {
    Alert.alert('Could not open', failure);
  }
}

export function callNumber(number: string) {
  const cleaned = number.replace(/[^\d+*#]/g, '');
  return open(`tel:${cleaned}`, `Dial ${formatPhone(number)} from your phone app.`);
}

export function textNumber(number: string, body?: string) {
  const cleaned = number.replace(/[^\d+*#]/g, '');
  const sep = Platform.OS === 'ios' ? '&' : '?';
  const url = body ? `sms:${cleaned}${sep}body=${encodeURIComponent(body)}` : `sms:${cleaned}`;
  return open(url, `Text ${formatPhone(number)} from your messages app.`);
}

export function openUrl(url: string) {
  return open(url, url);
}

/** Display formatting for US-style numbers; short codes such as 988 pass through. */
export function formatPhone(raw: string): string {
  const digits = raw.replace(/\D/g, '');
  if (digits.length === 11 && digits.startsWith('1')) {
    return `(${digits.slice(1, 4)}) ${digits.slice(4, 7)}-${digits.slice(7)}`;
  }
  if (digits.length === 10) {
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
  }
  return raw;
}

/** "4m ago" / "2h ago" / "Tue" — short enough to sit inline next to a title. */
export function relativeTime(ts: number): string {
  const mins = Math.round((Date.now() - ts) / 60_000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(ts).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

export function formatTime(hhmm: string): string {
  const [h, m] = hhmm.split(':').map(Number);
  const suffix = h >= 12 ? 'pm' : 'am';
  const hour = h % 12 === 0 ? 12 : h % 12;
  return m === 0 ? `${hour} ${suffix}` : `${hour}:${String(m).padStart(2, '0')} ${suffix}`;
}

export function formatDayLabel(iso: string): string {
  const today = new Date().toISOString().slice(0, 10);
  const tomorrow = new Date(Date.now() + 86_400_000).toISOString().slice(0, 10);
  if (iso === today) return 'Today';
  if (iso === tomorrow) return 'Tomorrow';
  // Parse as local noon so a timezone offset cannot shift the weekday.
  return new Date(`${iso}T12:00:00`).toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
  });
}
