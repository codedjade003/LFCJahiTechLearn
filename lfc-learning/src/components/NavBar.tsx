import { Link } from "react-router-dom";

export default function Navbar() {
  return (
    <header className="bg-lfc-red/95 dark:bg-gray-900/95 backdrop-blur-md border-b border-lfc-gold/20 dark:border-red-800/30 shadow-lg sticky top-0 z-50">
      <div className="w-full max-w-screen-xl mx-auto px-4 py-3 flex justify-between items-center">
        <div className="flex items-center space-x-3">
          <div className="relative h-10 w-10 bg-white dark:bg-gray-800 rounded-xl p-1.5 shadow-md">
            <img 
              src="/logo.png" 
              alt="LFC Jahi Tech"
            />
          </div>
          <div>
            <h1 className="text-lg font-bold text-white">LFC Jahi Abuja</h1>
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
