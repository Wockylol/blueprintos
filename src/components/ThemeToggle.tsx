import { Moon, Sun } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="p-2 hover:bg-light-300 dark:hover:bg-dark-800 rounded-lg transition-colors"
      title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
    >
      {theme === 'dark' ? (
        <Sun className="w-5 h-5 text-gray-400 hover:text-yellow-400 transition-colors" />
      ) : (
        <Moon className="w-5 h-5 text-gray-600 hover:text-primary-600 transition-colors" />
      )}
    </button>
  );
}
