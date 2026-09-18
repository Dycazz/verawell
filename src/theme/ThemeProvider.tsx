import React, { createContext, useContext, useMemo } from 'react';
import { useColorScheme } from 'react-native';
import { palettes, type ColorScheme, type Palette } from './tokens';

interface ThemeValue {
  c: Palette;
  scheme: ColorScheme;
  isDark: boolean;
}

const ThemeContext = createContext<ThemeValue>({
  c: palettes.light,
  scheme: 'light',
  isDark: false,
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const system = useColorScheme();
  const scheme: ColorScheme = system === 'dark' ? 'dark' : 'light';

  const value = useMemo<ThemeValue>(
    () => ({ c: palettes[scheme], scheme, isDark: scheme === 'dark' }),
    [scheme],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

/** `const { c } = useTheme()` — `c` for colors, kept short because it is used constantly. */
export function useTheme() {
  return useContext(ThemeContext);
}
