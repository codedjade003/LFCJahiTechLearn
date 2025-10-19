export default function Footer() {
  return (
    <footer className="bg-white/80 dark:bg-[var(--bg-elevated)]/80 backdrop-blur-md border-t border-gray-200/50 dark:border-[var(--border-primary)]/50 py-8">
      <div className="w-full max-w-screen-xl mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <div className="flex items-center space-x-3">
              <div className="relative h-10 w-10 bg-lfc-red dark:bg-[var(--lfc-red)] rounded-xl p-1.5 shadow-md">
                <img 
                  src="/logo.png" 
                  alt="LFC Jahi Tech"
                  className="filter brightness-0 invert"
                />
              </div>
              <div>
                <h2 className="text-lg font-bold text-lfc-red dark:text-[var(--lfc-red)]">LFC Jahi Abuja</h2>
                <p className="text-xs text-gray-600 dark:text-[var(--text-tertiary)]">Technical Unit Training Platform</p>
              </div>
            </div>
          </div>
          <div className="flex space-x-4">
            <a 
              href="#" 
              className="w-10 h-10 flex items-center justify-center rounded-lg bg-gray-100 dark:bg-[var(--bg-tertiary)] text-gray-600 dark:text-[var(--text-secondary)] hover:bg-lfc-gold dark:hover:bg-[var(--lfc-gold)] hover:text-white dark:hover:text-gray-900 transition-all duration-200 hover:scale-110"
            >
              <i className="fab fa-facebook-f"></i>
            </a>
            <a 
              href="#" 
              className="w-10 h-10 flex items-center justify-center rounded-lg bg-gray-100 dark:bg-[var(--bg-tertiary)] text-gray-600 dark:text-[var(--text-secondary)] hover:bg-lfc-gold dark:hover:bg-[var(--lfc-gold)] hover:text-white dark:hover:text-gray-900 transition-all duration-200 hover:scale-110"
            >
              <i className="fab fa-twitter"></i>
            </a>
            <a 
              href="#" 
              className="w-10 h-10 flex items-center justify-center rounded-lg bg-gray-100 dark:bg-[var(--bg-tertiary)] text-gray-600 dark:text-[var(--text-secondary)] hover:bg-lfc-gold dark:hover:bg-[var(--lfc-gold)] hover:text-white dark:hover:text-gray-900 transition-all duration-200 hover:scale-110"
            >
              <i className="fab fa-instagram"></i>
            </a>
          </div>
        </div>
        <div className="border-t border-gray-200 dark:border-[var(--border-primary)] mt-6 pt-6 text-sm text-center">
          <p className="text-gray-600 dark:text-[var(--text-tertiary)]">
            &copy; {new Date().getFullYear()} LFC Jahi Abuja. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
