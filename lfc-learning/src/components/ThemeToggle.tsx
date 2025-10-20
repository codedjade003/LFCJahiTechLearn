import { useTheme } from '../context/ThemeContext';
import { FaSun, FaMoon } from 'react-icons/fa';

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-lg bg-yt-light-hover dark:bg-yt-light-hover hover:bg-yt-light-border dark:hover:bg-yt-light-border transition-colors"
      aria-label="Toggle theme"
      title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
    >
      {theme === 'light' ? (
        <FaMoon className="text-yt-text-gray dark:text-yt-text-gray text-xl" />
      ) : (
        <FaSun className="text-yt-text-gray dark:text-yt-text-gray text-xl" />
      )}
    </button>
  );
}
