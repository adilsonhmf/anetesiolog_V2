import { useState } from 'react';

const lightColors = {
  background: '#f5f5f7',
  surface: '#ffffff',
  surfaceSecondary: '#f0f0f5',
  text: '#1a1a1a',
  textSecondary: '#666666',
  border: '#e0e0e0',
  tint: '#007AFF',
  success: '#22c55e',
  warning: '#f59e0b',
  danger: '#ef4444',
  categoryViaAerea: '#007AFF',
  categoryRegional: '#8b5cf6',
  categoryAcesso: '#06b6d4',
};

export function useTheme() {
  const [isDark, setIsDark] = useState(false);
  
  return {
    colors: lightColors,
    isDark,
    toggleTheme: () => setIsDark(!isDark),
  };
}
