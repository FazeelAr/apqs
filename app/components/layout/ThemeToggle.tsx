'use client';

import { Moon, Sun } from 'lucide-react';
import { useTheme } from '../providers/ThemeProvider';

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      id="theme-toggle"
      onClick={toggleTheme}
      className="relative flex h-9 w-9 items-center justify-center rounded-full
        bg-surface-2 text-foreground transition-all duration-300
        hover:bg-primary hover:text-primary-foreground
        hover:shadow-[0_0_15px_rgba(76,175,80,0.3)]
        active:scale-95 cursor-pointer"
      aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
    >
      {theme === 'light' ? (
        <Moon className="h-[18px] w-[18px] transition-transform duration-300" />
      ) : (
        <Sun className="h-[18px] w-[18px] transition-transform duration-300" />
      )}
    </button>
  );
}
