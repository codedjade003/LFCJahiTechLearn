// src/pages/Landing.tsx
import Navbar from "../components/NavBar";
import Footer from "../components/Footer";
import LoginForm from "../components/LoginForm";
import { 
  FaMusic, FaVideo, FaMicrophone, FaVolumeUp, FaFilm, 
  FaPhotoVideo, FaSlidersH, FaWaveSquare, FaLightbulb,
  FaCross, FaPray, FaChurch, FaHandsHelping
} from "react-icons/fa";
import { GiSoundWaves, GiFilmProjector } from "react-icons/gi";

export default function Landing() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      {/* MAIN CONTENT AREA - This is where the background goes */}
      <main className="flex-1 overflow-y-auto">
        {/* Techy Background - Only in the main content area */}
        <div className="absolute inset-0">
          {/* Light Mode */}
          <div className="absolute inset-0 bg-gradient-to-br from-lfc-gold/15 via-transparent to-lfc-gold/5 light:block dark:hidden" />
          {/* Dark Mode */}
          <div className="absolute inset-0 bg-gradient-to-br from-red-800/20 via-transparent to-red-800/10 dark:block hidden" />
          
          {/* Animated Grid - Light */}
          <div 
            className="absolute inset-0 opacity-10 light:block dark:hidden"
            style={{
              backgroundImage: `
                linear-gradient(rgba(200, 150, 50, 0.3) 1px, transparent 1px),
                linear-gradient(90deg, rgba(200, 150, 50, 0.3) 1px, transparent 1px)
              `,
              backgroundSize: '50px 50px',
              animation: 'gridMove 20s linear infinite',
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
              backgroundSize: '50px 50px',
              animation: 'gridMove 20s linear infinite',
            }}
          />
          
          {/* Pulsing Orbs */}
          <div className="absolute inset-0">
            {/* Light Mode Orbs */}
            <div className="light:block dark:hidden">
              <div className="absolute top-20 left-20 w-40 h-40 bg-lfc-gold/10 rounded-full blur-2xl animate-pulse" />
              <div className="absolute bottom-20 right-20 w-32 h-32 bg-lfc-gold/15 rounded-full blur-xl animate-pulse" style={{animationDelay: '2s'}} />
            </div>
            {/* Dark Mode Orbs */}
            <div className="dark:block hidden">
              <div className="absolute top-20 left-20 w-40 h-40 bg-red-600/10 rounded-full blur-2xl animate-pulse" />
              <div className="absolute bottom-20 right-20 w-32 h-32 bg-red-600/15 rounded-full blur-xl animate-pulse" style={{animationDelay: '2s'}} />
            </div>
          </div>
        </div>

        {/* Mixed Technical Production Icons Rain */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {Array.from({ length: 30 }).map((_, i) => (
            <div
              key={i}
              className="absolute light:text-lfc-gold/30 dark:text-red-400/25"
              style={{
                left: `${Math.random() * 100}%`,
                animation: `iconFall ${Math.random() * 7 + 4}s linear infinite`,
                animationDelay: `${Math.random() * 2}s`,
                fontSize: `${Math.random() * 8 + 12}px`, // Smaller sizes
                top: '-30px',
                opacity: 0,
              }}
            >
              {[
                // Media & Production
                <FaMusic />, <FaVideo />, <FaMicrophone />, <FaVolumeUp />,
                <FaFilm />, <FaPhotoVideo />, <FaSlidersH />, <FaWaveSquare />,
                <GiSoundWaves />, <GiFilmProjector />, <FaLightbulb />,
                // Church & Worship
                <FaCross />, <FaPray />, <FaChurch />, <FaHandsHelping />
              ][Math.floor(Math.random() * 15)]}
            </div>
          ))}
        </div>

        <style>{`
          @keyframes iconFall {
            0% { 
              transform: translateY(-25px) rotate(-10deg) scale(0.7); 
              opacity: 0; 
            }
            10% { 
              opacity: 0.8; 
              transform: translateY(0) rotate(0deg) scale(1);
            }
            80% { 
              opacity: 0.8; 
            }
            95% { 
              opacity: 0; 
              transform: translateY(calc(100vh - 50px)) rotate(10deg) scale(0.9);
            }
            100% { 
              transform: translateY(100vh) rotate(10deg) scale(0.9); 
              opacity: 0; 
            }
          }
        `}</style>

        {/* Content that sits ON TOP of the background */}
        <div className="relative z-10 h-full flex items-center">
          <div className="w-full max-w-screen-xl mx-auto px-4 py-16 md:py-24 flex flex-col md:flex-row items-center">
            {/* Left Text - Now with transparent background */}
            <div className="md:w-1/2 mb-10 md:mb-0">
              <h2 className="text-3xl md:text-4xl font-bold text-redCustom dark:text-red-300 mb-4">
                Technical Unit Training Platform
              </h2>
              <p className="text-gray-800 dark:text-red-100/90 mb-6">
                Access training materials, courses, and resources exclusively for
                LFC Jahi Abuja Technical Unit members.
              </p>
            </div>

            {/* Login Card - With cool effects */}
            <div className="md:w-1/2 flex justify-center">
              <div className="w-full max-w-md bg-white/80 dark:bg-black/60 backdrop-blur-md rounded-2xl shadow-2xl border border-lfc-gold/20 dark:border-red-500/20 hover:border-lfc-gold/40 dark:hover:border-red-500/40 transition-all duration-300 hover:shadow-2xl hover:scale-105">
                <LoginForm />
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}