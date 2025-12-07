'use client';

import React from 'react';
import { useTheme } from './ThemeProvider';

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  const handleToggleTheme = () => {
    console.log('Current theme before toggle:', theme);
    toggleTheme();
    console.log('Current theme after toggle:', theme);
  };

  return (
    <button 
      onClick={handleToggleTheme}
      className="theme-toggle"
      aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
    >
      {theme === 'light' ? '🌙' : '☀️'}
    </button>
  );
}
