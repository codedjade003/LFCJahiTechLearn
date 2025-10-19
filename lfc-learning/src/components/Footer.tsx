export default function Footer() {
  return (
    <footer className="bg-lfc-red/95 dark:bg-gray-900/95 backdrop-blur-md border-t border-lfc-gold/20 dark:border-red-800/30 py-8">
      <div className="w-full max-w-screen-xl mx-auto px-4">
        <div className="flex flex-col items-center text-center space-y-4">
          <div>
            <h2 className="text-lg font-bold text-white">LFC Jahi Abuja</h2>
            <p className="text-sm text-white/80 dark:text-gray-300">Technical Unit Training Platform</p>
          </div>
          <div className="border-t border-lfc-gold/30 dark:border-red-800/30 w-full max-w-md pt-4">
            <p className="text-sm text-white/70 dark:text-gray-400">
              &copy; {new Date().getFullYear()} LFC Jahi Abuja. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
