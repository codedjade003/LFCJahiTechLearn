import { Link } from "react-router-dom";

export default function Navbar() {
  return (
    <header className="bg-gradient-to-b from-lfc-red via-lfc-red/95 to-lfc-red/90 dark:from-[var(--bg-elevated)] dark:via-[var(--bg-elevated)]/95 dark:to-[var(--bg-elevated)]/90 backdrop-blur-md sticky top-0 z-50">
      <div className="w-full max-w-screen-xl mx-auto px-4 py-3 flex justify-between items-center">
        <div className="flex items-center space-x-3">
          <div className="relative h-10 w-10 bg-white dark:bg-gray-200 rounded-xl p-1.5 shadow-md">
            <img 
              src="/logo.png" 
              alt="LFC Jahi Tech"
            />
          </div>
          <div>
            <h1 className="text-lg font-bold text-white dark:red-100">LFC Jahi Abuja</h1>
            <p className="text-xs text-white/80 dark:text-gray-300">Technical Training</p>
          </div>
        </div>
        <Link
          to="/signup"
          className="bg-lfc-gold dark:bg-lfc-gold text-white font-semibold py-2 px-6 rounded-lg hover:bg-lfc-gold-hover transition-all duration-200 shadow-md hover:shadow-lg hover:scale-105"
        >
          Sign Up
        </Link>
      </div>
    </header>
  );
}
