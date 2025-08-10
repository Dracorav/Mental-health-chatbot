'use client';

interface TalkingAvatarProps {
  isLoading: boolean;
  isSpeaking: boolean;
}

export function TalkingAvatar({ isLoading, isSpeaking }: TalkingAvatarProps) {
  const SvgGlowFilter = () => (
    <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
      <feGaussianBlur stdDeviation="4" result="coloredBlur" />
      <feMerge>
        <feMergeNode in="coloredBlur" />
        <feMergeNode in="SourceGraphic" />
      </feMerge>
    </filter>
  );

  return (
    <div className="relative h-32 w-32">
      <svg
        viewBox="0 0 100 100"
        xmlns="http://www.w3.org/2000/svg"
        className="absolute inset-0 h-full w-full"
      >
        <defs>
          <SvgGlowFilter />
        </defs>
      </svg> 
      {isLoading && (
        <div className="absolute inset-0 z-10 flex animate-spin items-center justify-center rounded-full">
            <div className="h-full w-full rounded-full border-4 border-dashed border-accent"></div>
        </div>
      )}
      <div
        className="relative h-full w-full rounded-full transition-transform duration-300"
        style={{ transform: isSpeaking ? 'scale(1.05)' : 'scale(1)' }}
      >
        <div
          className="h-full w-full rounded-full bg-primary/20 transition-all"
          style={{
            filter: isSpeaking ? 'url(#glow)' : 'none',
          }}
        >
          <svg viewBox="0 0 100 100" className="h-full w-full">
            {/* Face */}
            <circle cx="50" cy="50" r="35" fill="hsl(var(--primary))" />
            
            {/* Eyes */}
            <g transform="translate(0, -5)">
              <ellipse cx="38" cy="45" rx="5" ry="7" fill="white" />
              <ellipse cx="62" cy="45" rx="5" ry="7" fill="white" />
              <circle cx="38" cy="45" r="2.5" fill="hsl(var(--primary-foreground))" />
              <circle cx="62"cy="45" r="2.5" fill="hsl(var(--primary-foreground))" />
            </g>

            {/* Mouth */}
            <g transform="translate(0, 10)">
              {isSpeaking ? (
                <ellipse cx="50" cy="60" rx="8" ry="1" fill="white" className="mouth-speaking">
                   <animate attributeName="ry" values="1;6;1" dur="0.3s" repeatCount="indefinite" />
                </ellipse>
              ) : (
                <path
                  d="M 42 60 Q 50 65 58 60"
                  stroke="white"
                  strokeWidth="2"
                  fill="none"
                  strokeLinecap="round"
                />
              )}
            </g>
          </svg>
        </div>
      </div>
    </div>
  );
}
