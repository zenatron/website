'use client';

import React, { createContext, useEffect, useState, ReactNode } from 'react';

interface ThemeContextProps {
  theme: string;
  setTheme: (mode: string) => void;
}

export const ThemeContext = createContext<ThemeContextProps>({
  theme: 'light',
  setTheme: () => {},
});

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const [theme, setTheme] = useState<string>('light');
  const [isInitialized, setIsInitialized] = useState<boolean>(false);

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') || 'system';
    applyTheme(savedTheme);
    setIsInitialized(true); // Mark theme as initialized
  }, []);

  const applyTheme = (mode: string) => {
    let resolvedTheme = mode;

    if (mode === 'system') {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      resolvedTheme = prefersDark ? 'dark' : 'light';
    }

    document.documentElement.classList.remove('light', 'dark');
    document.documentElement.classList.add(resolvedTheme);
    setTheme(mode);
    localStorage.setItem('theme', mode);
  };

  const handleSetTheme = (mode: string) => {
    applyTheme(mode);
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme: handleSetTheme }}>
      {isInitialized ? children : null} {/* Render children only when initialized */}
    </ThemeContext.Provider>
  );
};