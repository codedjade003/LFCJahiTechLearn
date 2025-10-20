// Reusable techy background component
// Can be applied to any page without breaking existing styling

interface TechyBackgroundProps {
  variant?: 'default' | 'subtle' | 'minimal';
}

export default function TechyBackground({ variant = 'default' }: TechyBackgroundProps) {
  const opacity = {
    default: { gradient: '15', grid: '10', orb: '10' },
    subtle: { gradient: '8', grid: '5', orb: '5' },
    minimal: { gradient: '5', grid: '3', orb: '3' }
  }[variant];

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Gradient Background */}
      <div className="absolute inset-0">
        {/* Light Mode */}
        <div 
          className="absolute inset-0 bg-gradient-to-br from-lfc-gold/15 via-transparent to-lfc-gold/5 light:block dark:hidden" 
          style={{ opacity: parseInt(opacity.gradient) / 100 }}
        />
        {/* Dark Mode */}
        <div 
          className="absolute inset-0 bg-gradient-to-br from-red-800/20 via-transparent to-red-800/10 dark:block hidden" 
          style={{ opacity: parseInt(opacity.gradient) / 100 }}
        />
      </div>
      
      {/* Animated Grid */}
      <div 
        className="absolute inset-0 light:block dark:hidden"
        style={{
          backgroundImage: `
            linear-gradient(rgba(200, 150, 50, 0.3) 1px, transparent 1px),
            linear-gradient(90deg, rgba(200, 150, 50, 0.3) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px',
          animation: 'gridMove 20s linear infinite',
          opacity: parseInt(opacity.grid) / 100
        }}
      />
      
      <div 
        className="absolute inset-0 dark:block hidden"
        style={{
          backgroundImage: `
            linear-gradient(rgba(220, 38, 38, 0.2) 1px, transparent 1px),
            linear-gradient(90deg, rgba(220, 38, 38, 0.2) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px',
          animation: 'gridMove 20s linear infinite',
          opacity: parseInt(opacity.grid) / 100
        }}
      />
      
      {/* Pulsing Orbs */}
      <div className="absolute inset-0">
        {/* Light Mode Orbs */}
        <div className="light:block dark:hidden">
          <div 
            className="absolute top-20 left-20 w-40 h-40 bg-lfc-gold/10 rounded-full blur-2xl animate-pulse" 
            style={{ opacity: parseInt(opacity.orb) / 100 }}
          />
          <div 
            className="absolute bottom-20 right-20 w-32 h-32 bg-lfc-gold/15 rounded-full blur-xl animate-pulse" 
            style={{ animationDelay: '2s', opacity: parseInt(opacity.orb) / 100 }}
          />
        </div>
        {/* Dark Mode Orbs */}
        <div className="dark:block hidden">
          <div 
            className="absolute top-20 left-20 w-40 h-40 bg-red-600/10 rounded-full blur-2xl animate-pulse" 
            style={{ opacity: parseInt(opacity.orb) / 100 }}
          />
          <div 
            className="absolute bottom-20 right-20 w-32 h-32 bg-red-600/15 rounded-full blur-xl animate-pulse" 
            style={{ animationDelay: '2s', opacity: parseInt(opacity.orb) / 100 }}
          />
        </div>
      </div>

      <style>{`
        @keyframes gridMove {
          0% { 
            transform: translateY(0); 
          }
          100% { 
            transform: translateY(50px); 
          }
        }
      `}</style>
    </div>
  );
}
