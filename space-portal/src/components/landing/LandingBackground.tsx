'use client';

interface LandingBackgroundProps {
  variant?: 'hero' | 'section' | 'minimal';
  className?: string;
}

export function LandingBackground({
  variant = 'section',
  className = '',
}: LandingBackgroundProps) {
  return (
    <div className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`} aria-hidden>
      <div className="absolute inset-0 bg-black" />

      {variant === 'hero' && (
        <>
          <div
            className="absolute inset-0"
            style={{
              background:
                'radial-gradient(ellipse 120% 70% at 50% -10%, rgba(59, 130, 246, 0.14) 0%, transparent 55%)',
            }}
          />
          <div
            className="absolute inset-0"
            style={{
              background:
                'radial-gradient(ellipse 80% 50% at 90% 20%, rgba(139, 92, 246, 0.08) 0%, transparent 45%)',
            }}
          />
        </>
      )}

      {variant === 'section' && (
        <div
          className="absolute inset-0"
          style={{
            background:
              'radial-gradient(ellipse 90% 60% at 50% 0%, rgba(59, 130, 246, 0.06) 0%, transparent 60%)',
          }}
        />
      )}

      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/80" />

      <div
        className="absolute inset-0 opacity-[0.035]"
        style={{
          backgroundImage:
            'linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)',
          backgroundSize: '64px 64px',
        }}
      />
    </div>
  );
}
