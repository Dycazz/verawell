import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { AppState, View, type ViewProps } from 'react-native';
import { usePrivacy } from './privacy';

export type Role = 'guest' | 'staff';
export type LockReason = 'idle' | 'background' | 'manual' | 'quick-exit';

interface Session {
  role: Role;
  /** For guests this is the anonymous code — the only identifier that exists. */
  code: string;
  label?: string;
  startedAt: number;
}

interface SessionValue {
  session: Session | null;
  lastLockReason: LockReason | null;
  signIn: (session: Omit<Session, 'startedAt'>) => void;
  signOut: (reason?: LockReason) => void;
  /** Called on any interaction to push the idle deadline back. */
  touch: () => void;
}

const SessionContext = createContext<SessionValue>({
  session: null,
  lastLockReason: null,
  signIn: () => {},
  signOut: () => {},
  touch: () => {},
});

/**
 * Guest identity lives here and nowhere else.
 *
 * It is deliberately plain React state: never written to AsyncStorage, never put
 * in a cookie, gone the moment the process dies. That is the whole point — the
 * spec asks for no cached guest data on the device, and the cheapest way to keep
 * that promise is to have nowhere for it to leak to.
 */
export function SessionProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [lastLockReason, setLastLockReason] = useState<LockReason | null>(null);
  const { autoLockMinutes, lockOnBackground } = usePrivacy();

  const lastActivity = useRef(Date.now());
  const backgroundedAt = useRef<number | null>(null);

  const signIn = useCallback((next: Omit<Session, 'startedAt'>) => {
    lastActivity.current = Date.now();
    setLastLockReason(null);
    setSession({ ...next, startedAt: Date.now() });
  }, []);

  const signOut = useCallback((reason: LockReason = 'manual') => {
    setSession((current) => {
      if (current) setLastLockReason(reason);
      return null;
    });
  }, []);

  const touch = useCallback(() => {
    lastActivity.current = Date.now();
  }, []);

  // Idle timeout. Polling once a second is plenty and avoids resetting a timer
  // on every single touch event.
  useEffect(() => {
    if (!session) return;
    const limit = autoLockMinutes * 60_000;
    const tick = setInterval(() => {
      if (Date.now() - lastActivity.current >= limit) signOut('idle');
    }, 1000);
    return () => clearInterval(tick);
  }, [session, autoLockMinutes, signOut]);

  // Backgrounding is treated as a strong signal that the phone may have changed
  // hands. A short grace period keeps an accidental app-switch from being punishing.
  useEffect(() => {
    if (!session || !lockOnBackground) return;
    const sub = AppState.addEventListener('change', (next) => {
      if (next === 'active') {
        const since = backgroundedAt.current;
        backgroundedAt.current = null;
        if (since && Date.now() - since > 20_000) signOut('background');
        else touch();
      } else {
        backgroundedAt.current = Date.now();
      }
    });
    return () => sub.remove();
  }, [session, lockOnBackground, signOut, touch]);

  const value = useMemo(
    () => ({ session, lastLockReason, signIn, signOut, touch }),
    [session, lastLockReason, signIn, signOut, touch],
  );

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession() {
  return useContext(SessionContext);
}

/**
 * Wrap a subtree to count taps and scrolls as activity. Uses the capture phase
 * so it observes without intercepting — children still receive every gesture.
 */
export function ActivityBoundary({ children, style, ...rest }: ViewProps) {
  const { touch } = useSession();
  return (
    <View
      style={[{ flex: 1 }, style]}
      onStartShouldSetResponderCapture={() => {
        touch();
        return false;
      }}
      onMoveShouldSetResponderCapture={() => {
        touch();
        return false;
      }}
      {...rest}
    >
      {children}
    </View>
  );
}
