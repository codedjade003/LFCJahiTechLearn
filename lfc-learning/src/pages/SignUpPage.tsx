// src/pages/SignupPage.tsx
import Navbar from "../components/NavBar";
import Footer from "../components/Footer";
import SignupForm from "../components/SignUpForm";

export default function SignupPage() {
  return (
    <div className="min-h-screen flex flex-col relative">
      {/* Transparent Navbar */}
      <Navbar />

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 overflow-y-auto">
        {/* Techy Background (matches Landing) */}
        <div className="absolute inset-0">
          {/* Light Mode Gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-lfc-gold/15 via-transparent to-lfc-gold/5 light:block dark:hidden" />
          {/* Dark Mode Gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-red-800/20 via-transparent to-red-800/10 dark:block hidden" />

          {/* Animated Grid - Light */}
          <div
            className="absolute inset-0 opacity-10 light:block dark:hidden"
            style={{
              backgroundImage: `
                linear-gradient(rgba(200, 150, 50, 0.3) 1px, transparent 1px),
                linear-gradient(90deg, rgba(200, 150, 50, 0.3) 1px, transparent 1px)
              `,
              backgroundSize: "50px 50px",
              animation: "gridMove 20s linear infinite",
            }}
          />
          {/* Animated Grid - Dark */}
          <div
            className="absolute inset-0 opacity-15 dark:block hidden"
            style={{
              backgroundImage: `
                linear-gradient(rgba(220, 38, 38, 0.2) 1px, transparent 1px),
                linear-gradient(90deg, rgba(220, 38, 38, 0.2) 1px, transparent 1px)
              `,
              backgroundSize: "50px 50px",
              animation: "gridMove 20s linear infinite",
            }}
          />

          {/* Pulsing Orbs */}
          <div className="absolute inset-0">
            {/* Light Mode Orbs */}
            <div className="light:block dark:hidden">
              <div className="absolute top-20 left-20 w-40 h-40 bg-lfc-gold/10 rounded-full blur-2xl animate-pulse" />
              <div
                className="absolute bottom-20 right-20 w-32 h-32 bg-lfc-gold/15 rounded-full blur-xl animate-pulse"
                style={{ animationDelay: "2s" }}
              />
            </div>
            {/* Dark Mode Orbs */}
            <div className="dark:block hidden">
              <div className="absolute top-20 left-20 w-40 h-40 bg-red-600/10 rounded-full blur-2xl animate-pulse" />
              <div
                className="absolute bottom-20 right-20 w-32 h-32 bg-red-600/15 rounded-full blur-xl animate-pulse"
                style={{ animationDelay: "2s" }}
              />
            </div>
          </div>

          {/* Binary Rain (Animated, smooth, layered properly) */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {Array.from({ length: 25 }).map((_, i) => (
              <div
                key={i}
                className="absolute font-mono light:text-lfc-gold/20 dark:text-red-400/15"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * -100}%`,
                  animation: `binaryFall ${Math.random() * 6 + 4}s linear infinite`,
                  animationDelay: `${Math.random() * 4}s`,
                  fontSize: `${Math.random() * 10 + 10}px`,
                }}
              >
                {Math.random() > 0.5 ? "1" : "0"}
              </div>
            ))}
          </div>
        </div>

        {/* Keyframes for Binary Animation */}
        <style>{`
          @keyframes binaryFall {
            0% { 
              transform: translateY(-20px);
              opacity: 0;
            }
            10% {
              opacity: 1;
            }
            90% {
              opacity: 1;
              transform: translateY(calc(100vh + 20px));
            }
            100% { 
              opacity: 0;
              transform: translateY(calc(100vh + 40px));
            }
          }

          @keyframes gridMove {
            0% { background-position: 0 0; }
            100% { background-position: 50px 50px; }
          }
        `}</style>

        {/* Content on Top */}
        <div className="relative z-10 h-full flex items-center">
          <div className="w-full max-w-screen-xl mx-auto px-4 py-16 md:py-24 flex flex-col md:flex-row items-center">
            {/* Left Text */}
            <div className="md:w-1/2 mb-10 md:mb-0">
              <h2 className="text-3xl md:text-4xl font-bold text-redCustom dark:text-red-300 mb-4">
                Join the Technical Unit Training Platform
              </h2>
              <p className="text-gray-800 dark:text-red-100/90 mb-6">
                Sign up to access training materials, courses, and resources
                exclusively for LFC Jahi Abuja Technical Unit members.
              </p>
            </div>

            {/* Signup Card */}
            <div className="md:w-1/2 flex justify-center">
              <div className="w-full max-w-md bg-white/80 dark:bg-black/60 backdrop-blur-md rounded-2xl shadow-2xl border border-lfc-gold/20 dark:border-red-500/20 hover:border-lfc-gold/40 dark:hover:border-red-500/40 transition-all duration-300 hover:shadow-2xl hover:scale-105">
                <SignupForm />
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
