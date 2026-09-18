import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Device-level privacy preferences.
 *
 * These are the only things this app writes to disk on a guest's phone. None of
 * them identify a person, and none of them reveal that a guest account exists —
 * which is why they are safe to persist while session data is not.
 */
export interface PrivacySettings {
  /** Presents the app under a neutral name so a home screen gives nothing away. */
  stealthMode: boolean;
  /** Suppresses shelter name and message content in lock-screen previews. */
  quietNotifications: boolean;
  /** Minutes of inactivity before the session is dropped. */
  autoLockMinutes: number;
  /** Lock as soon as the app goes to the background. */
  lockOnBackground: boolean;
}

export const DEFAULTS: PrivacySettings = {
  stealthMode: false,
  quietNotifications: true,
  autoLockMinutes: 5,
  lockOnBackground: true,
};

export const AUTO_LOCK_CHOICES = [1, 2, 5, 15] as const;

/** What the app calls itself when stealth mode is on. */
export const COVER_IDENTITY = {
  name: 'Daily Notes',
  icon: 'document-text-outline' as const,
};

const KEY = 'verawell.privacy.v1';

interface PrivacyValue extends PrivacySettings {
  set: <K extends keyof PrivacySettings>(key: K, value: PrivacySettings[K]) => void;
  hydrated: boolean;
}

const PrivacyContext = createContext<PrivacyValue>({
  ...DEFAULTS,
  set: () => {},
  hydrated: false,
});

export function PrivacyProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<PrivacySettings>(DEFAULTS);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    let alive = true;
    AsyncStorage.getItem(KEY)
      .then((raw) => {
        if (alive && raw) setSettings({ ...DEFAULTS, ...JSON.parse(raw) });
      })
      .catch(() => {})
      .finally(() => alive && setHydrated(true));
    return () => {
      alive = false;
    };
  }, []);

  const set = useCallback<PrivacyValue['set']>((key, value) => {
    setSettings((prev) => {
      const next = { ...prev, [key]: value };
      AsyncStorage.setItem(KEY, JSON.stringify(next)).catch(() => {});
      return next;
    });
  }, []);

  const value = useMemo(() => ({ ...settings, set, hydrated }), [settings, set, hydrated]);

  return <PrivacyContext.Provider value={value}>{children}</PrivacyContext.Provider>;
}

export function usePrivacy() {
  return useContext(PrivacyContext);
}

/** The name shown in-app, which follows stealth mode. */
export function useAppIdentity(shelterName: string) {
  const { stealthMode } = usePrivacy();
  return stealthMode ? COVER_IDENTITY.name : shelterName;
}
