import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="bg-gradient-to-t from-lfc-red via-lfc-red/95 to-lfc-red/90 dark:from-[var(--bg-elevated)] dark:via-[var(--bg-elevated)]/95 dark:to-[var(--bg-elevated)]/90 backdrop-blur-md py-12 mt-auto">
      <div className="w-full max-w-screen-xl mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-white dark:text-[var(--text-primary)]">LFC Jahi Abuja</h3>
            <p className="text-sm text-white/80 dark:text-gray-300">
              Empowering education through innovative learning solutions.
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-white dark:text-[var(--text-primary)]">Quick Links</h3>
            <div className="flex flex-col space-y-2 text-sm">
              <Link to="/about" className="text-white/80 dark:text-gray-300 hover:text-lfc-gold dark:hover:text-red-400 transition-colors">
                About
              </Link>
              <Link to="/contact" className="text-white/80 dark:text-gray-300 hover:text-lfc-gold dark:hover:text-red-400 transition-colors">
                Contact
              </Link>
            </div>
          </div>

          {/* Legal */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-white dark:text-[var(--text-primary)]">Legal</h3>
            <div className="flex flex-col space-y-2 text-sm">
              <Link to="/privacy" className="text-white/80 dark:text-gray-300 hover:text-lfc-gold dark:hover:text-red-400 transition-colors">
                Privacy Policy
              </Link>
              <Link to="/terms" className="text-white/80 dark:text-gray-300 hover:text-lfc-gold dark:hover:text-red-400 transition-colors">
                Terms of Service
              </Link>
            </div>
          </div>

          {/* Copyright */}
          <div className="space-y-4">
            <p className="text-sm text-white/70 dark:text-gray-400">
              &copy; {new Date().getFullYear()} LFC Jahi Abuja. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
