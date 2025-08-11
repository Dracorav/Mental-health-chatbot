'use client';

import Image from 'next/image';

interface TalkingAvatarProps {
  videoUrl: string | null;
  imageUrl: string;
  isLoading: boolean;
}

export function TalkingAvatar({ videoUrl, imageUrl, isLoading }: TalkingAvatarProps) {
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
    <div className="relative h-48 w-48 md:h-64 md:w-64">
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
      <div className="relative h-full w-full rounded-full transition-transform duration-300 overflow-hidden bg-primary/20">
        {videoUrl ? (
          <video
            src={videoUrl}
            autoPlay
            loop
            controls
            playsInline
            className="h-full w-full object-cover"
            key={videoUrl}
          />
        ) : (
          <Image
            src={imageUrl}
            data-ai-hint="yellow minion smiling face"
            alt="MindfulMe Avatar"
            width={256}
            height={256}
            className="h-full w-full object-cover"
            priority
          />
        )}
      </div>
    </div>
  );
}
