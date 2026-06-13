import React, { createContext, useContext, useState, useEffect } from 'react';
import { useColorScheme } from 'react-native';
import { Theme } from '../constants/theme';

type ThemeMode = 'light' | 'dark' | 'system';

interface ThemeContextType {
  themeMode: ThemeMode;
  setThemeMode: (mode: ThemeMode) => void;
  colors: typeof Theme.colors.dark;
  isDark: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const systemScheme = useColorScheme();
  const [themeMode, setThemeMode] = useState<ThemeMode>('system');
  const [resolvedScheme, setResolvedScheme] = useState<'light' | 'dark'>(systemScheme === 'dark' ? 'dark' : 'light');

  useEffect(() => {
    if (themeMode === 'system') {
      setResolvedScheme(systemScheme === 'dark' ? 'dark' : 'light');
    } else {
      setResolvedScheme(themeMode);
    }
  }, [themeMode, systemScheme]);

  const colors = resolvedScheme === 'dark' ? Theme.colors.dark : Theme.colors.light;
  const isDark = resolvedScheme === 'dark';

  return (
    <ThemeContext.Provider value={{ themeMode, setThemeMode, colors, isDark }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
