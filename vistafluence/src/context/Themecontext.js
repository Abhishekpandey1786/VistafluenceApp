import React, { createContext, useContext, useState } from 'react';

const G_DARK = {
  bg:        '#0F1012',
  bgCard:    '#16181C',
  bgInput:   '#1C1E23',
  gold:      '#D4AF37',
  goldDim:   '#968C6A',
  goldFaint: 'rgba(212,175,55,0.10)',
  border:    'rgba(193,154,107,0.25)',
  borderAlt: 'rgba(193,154,107,0.12)',
  text:      '#F0EBE0',
  textSub:   '#968C6A',
  red:       '#ef4444',
  green:     '#22c55e',
  pink:      '#FF6B8A',
  teal:      '#00C9A7',
};

const G_LIGHT = {
  bg:        '#F5F5F0',
  bgCard:    '#FFFFFF',
  bgInput:   '#EFEFEF',
  gold:      '#B8860B',
  goldDim:   '#8B6914',
  goldFaint: 'rgba(184,134,11,0.10)',
  border:    'rgba(139,105,20,0.25)',
  borderAlt: 'rgba(139,105,20,0.15)',
  text:      '#1A1A1A',
  textSub:   '#666655',
  red:       '#dc2626',
  green:     '#16a34a',
  pink:      '#e11d48',
  teal:      '#0d9488',
};

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  const [isDark, setIsDark] = useState(true);

  const toggleTheme = () => setIsDark(prev => !prev);

  // ✅ isDark ke hisaab se G object switch hoga
  const G = isDark ? G_DARK : G_LIGHT;

  return (
    <ThemeContext.Provider value={{ G, isDark, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be inside ThemeProvider');
  return ctx;
}