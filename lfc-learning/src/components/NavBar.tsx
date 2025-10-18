import { Link } from "react-router-dom";

export default function Navbar() {
  return (
    <header className="bg-redCustom dark:bg-[var(--lfc-red)] text-white shadow-md dark:shadow-[var(--shadow-lg)]">
      <div className="w-full max-w-screen-xl mx-auto px-4 py-3 flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <i className="fas fa-church text-2xl text-goldCustom dark:text-[var(--lfc-gold)]"></i>
          <h1 className="text-xl font-bold">LFC Jahi Abuja</h1>
        </div>
        <Link
          to="/signup"
          className="bg-goldCustom dark:bg-[var(--lfc-gold)] text-white font-semibold py-2 px-6 rounded-lg hover:bg-[var(--lfc-gold-hover)] transition-colors"
        >
          Sign Up
        </Link>
      </div>
    </header>
  );
}
