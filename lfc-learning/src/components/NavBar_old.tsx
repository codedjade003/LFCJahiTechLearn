import { Link } from "react-router-dom";

export default function Navbar() {
  return (
    <header className="bg-redCustom dark:bg-red-800 text-white dark:text-gray-200 shadow-md dark:shadow-[var(--shadow-lg)]">
      <div className="w-full max-w-screen-xl mx-auto px-4 py-3 flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <i className="fas fa-church text-2xl text-goldCustom dark:text-[var(--lfc-gold)]"></i>
            <div className="relative h-12 w-12 bg-white dark:bg-gray-200 rounded-xl p-1">
              <img 
                src="/logo.png" 
                alt="LFC Jahi Tech" 
              />
            </div>
          <h1 className="text-xl font-bold">LFC Jahi Abuja</h1>
        </div>
        <Link
          to="/signup"
          className="bg-goldCustom dark:bg-[var(--lfc-gold)] text-white dark:text-gray-200 font-semibold py-2 px-6 rounded-lg hover:bg-[var(--lfc-gold-hover)] transition-colors"
        >
          Sign Up
        </Link>
      </div>
    </header>
  );
}
