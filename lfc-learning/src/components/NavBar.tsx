import { Link } from "react-router-dom";

export default function Navbar() {
  return (
    <header className="bg-white/80 dark:bg-[var(--bg-elevated)]/80 backdrop-blur-md border-b border-gray-200/50 dark:border-[var(--border-primary)]/50 shadow-sm sticky top-0 z-50">
      <div className="w-full max-w-screen-xl mx-auto px-4 py-3 flex justify-between items-center">
        <div className="flex items-center space-x-3">
          <div className="relative h-10 w-10 bg-lfc-red dark:bg-[var(--lfc-red)] rounded-xl p-1.5 shadow-md">
            <img 
              src="/logo.png" 
              alt="LFC Jahi Tech"
              className="filter brightness-0 invert"
            />
          </div>
          <div>
            <h1 className="text-lg font-bold text-lfc-red dark:text-[var(--lfc-red)]">LFC Jahi Abuja</h1>
            <p className="text-xs text-gray-600 dark:text-[var(--text-tertiary)]">Technical Training</p>
          </div>
        </div>
        <Link
          to="/signup"
          className="bg-lfc-gold dark:bg-[var(--lfc-gold)] text-white dark:text-gray-900 font-semibold py-2 px-6 rounded-lg hover:bg-lfc-gold-hover dark:hover:bg-[var(--lfc-gold-hover)] transition-all duration-200 shadow-md hover:shadow-lg hover:scale-105"
        >
          Sign Up
        </Link>
      </div>
    </header>
  );
}
