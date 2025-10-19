// src/components/TechyBackground.tsx
export default function TechyBackground() {
  return (
    <>
      <div className="fixed inset-0 -z-10">
        {/* Light Mode Gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-lfc-gold/20 via-lfc-gold/5 to-white light:block dark:hidden" />
        
        {/* Dark Mode Gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-red-800/20 via-red-800/10 to-[var(--bg-primary)] dark:block hidden" />
        
        {/* Light Mode Grid */}
        <div 
          className="absolute inset-0 opacity-20 light:block dark:hidden"
          style={{
            backgroundImage: `
              linear-gradient(rgba(200, 150, 50, 0.4) 1px, transparent 1px),
              linear-gradient(90deg, rgba(200, 150, 50, 0.4) 1px, transparent 1px)
            `,
            backgroundSize: '40px 40px',
            animation: 'gridMove 15s linear infinite',
          }}
        />
        
        {/* Dark Mode Grid */}
        <div 
          className="absolute inset-0 opacity-25 dark:block hidden"
          style={{
            backgroundImage: `
              linear-gradient(rgba(220, 38, 38, 0.3) 1px, transparent 1px),
              linear-gradient(90deg, rgba(220, 38, 38, 0.3) 1px, transparent 1px)
            `,
            backgroundSize: '40px 40px',
            animation: 'gridMove 15s linear infinite',
          }}
        />
        
        {/* Pulsing Orbs */}
        <div className="absolute inset-0 overflow-hidden">
          {/* Light Mode Orbs */}
          <div className="light:block dark:hidden">
            <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-lfc-gold/10 rounded-full blur-xl animate-pulse" style={{animationDelay: '0s'}} />
            <div className="absolute top-3/4 right-1/4 w-48 h-48 bg-lfc-gold/15 rounded-full blur-lg animate-pulse" style={{animationDelay: '1s'}} />
            <div className="absolute bottom-1/4 left-1/2 w-32 h-32 bg-lfc-gold/20 rounded-full blur-md animate-pulse" style={{animationDelay: '2s'}} />
          </div>
          
          {/* Dark Mode Orbs */}
          <div className="dark:block hidden">
            <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-red-600/10 rounded-full blur-xl animate-pulse" style={{animationDelay: '0s'}} />
            <div className="absolute top-3/4 right-1/4 w-48 h-48 bg-red-600/15 rounded-full blur-lg animate-pulse" style={{animationDelay: '1s'}} />
            <div className="absolute bottom-1/4 left-1/2 w-32 h-32 bg-red-600/20 rounded-full blur-md animate-pulse" style={{animationDelay: '2s'}} />
          </div>
        </div>

        {/* Binary Rain */}
        <div className="absolute inset-0 overflow-hidden">
          {Array.from({ length: 25 }).map((_, i) => (
            <div
              key={i}
              className="absolute font-mono pointer-events-none light:text-lfc-gold/20 dark:text-red-400/15"
              style={{
                left: `${Math.random() * 100}%`,
                animation: `binaryFall ${Math.random() * 8 + 6}s linear infinite`,
                animationDelay: `${Math.random() * 8}s`,
                fontSize: `${Math.random() * 10 + 10}px`,
                filter: 'blur(0.3px)',
              }}
            >
              {Math.random() > 0.5 ? '1' : '0'}
            </div>
          ))}
        </div>

        {/* Scan Lines */}
        <div 
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `repeating-linear-gradient(
              0deg,
              transparent,
              transparent 1px,
              currentColor 1px,
              currentColor 2px
            )`,
          }}
        />
      </div>

      <style>{`
        @keyframes gridMove {
          0% { transform: translate(0, 0); }
          100% { transform: translate(-40px, -40px); }
        }
        
        @keyframes binaryFall {
          0% { 
            transform: translateY(-100px) rotate(0deg) scale(0.8); 
            opacity: 0; 
          }
          5% { opacity: 0.4; }
          95% { opacity: 0.4; }
          100% { 
            transform: translateY(100vh) rotate(180deg) scale(1.2); 
            opacity: 0; 
          }
        }

        .tech-hero {
          background: rgba(255, 255, 255, 0.7);
          backdrop-filter: blur(20px);
          border: 1px solid;
          border-image: linear-gradient(45deg, currentColor, transparent) 1;
          position: relative;
          overflow: hidden;
        }

        .dark .tech-hero {
          background: rgba(0, 0, 0, 0.6);
        }

        .tech-hero::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(
            90deg,
            transparent,
            currentColor,
            transparent
          );
          opacity: 0.1;
          transition: left 0.8s ease;
        }

        .tech-hero:hover::before {
          left: 100%;
        }

        .tech-card {
          background: rgba(255, 255, 255, 0.9);
          backdrop-filter: blur(15px);
          border: 1px solid;
          border-image: linear-gradient(45deg, currentColor, transparent) 1;
          box-shadow: 
            0 8px 32px rgba(0, 0, 0, 0.1),
            inset 0 1px 0 rgba(255, 255, 255, 0.8);
          transition: all 0.4s ease;
        }

        .dark .tech-card {
          background: rgba(0, 0, 0, 0.7);
          box-shadow: 
            0 8px 32px rgba(220, 38, 38, 0.1),
            inset 0 1px 0 rgba(255, 255, 255, 0.1);
        }

        .tech-card:hover {
          transform: translateY(-5px);
          box-shadow: 
            0 20px 40px rgba(0, 0, 0, 0.15),
            0 0 60px currentColor,
            inset 0 1px 0 rgba(255, 255, 255, 0.9);
        }

        .dark .tech-card:hover {
          box-shadow: 
            0 20px 40px rgba(220, 38, 38, 0.2),
            0 0 80px rgba(220, 38, 38, 0.3),
            inset 0 1px 0 rgba(255, 255, 255, 0.2);
        }

        .glow-text {
          text-shadow: 
            0 0 20px currentColor,
            0 0 40px currentColor;
          animation: textGlow 3s ease-in-out infinite alternate;
        }

        @keyframes textGlow {
          0% { opacity: 0.7; }
          100% { opacity: 1; }
        }
      `}</style>
    </>
  );
}