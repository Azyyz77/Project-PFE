'use client';

import { useEffect, useState } from 'react';

interface VideoBackgroundProps {
  /**
   * Whether to show the video background
   * Useful for conditional rendering based on screen size
   */
  enabled?: boolean;
  /**
   * Opacity of the overlay (0-1)
   * Higher values make the content more readable
   */
  overlayOpacity?: number;
  /**
   * Custom overlay color
   */
  overlayColor?: string;
}

export function VideoBackground({
  enabled = true,
  overlayOpacity = 0.5,
  overlayColor = 'bg-black',
}: VideoBackgroundProps) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Detect mobile on mount
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);

    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  if (!enabled) {
    return null;
  }

  // Choose video based on screen size
  const videoSrc = isMobile
    ? '/videos/chery-tiggo8pro-mobile-official.mp4'
    : '/videos/chery-tiggo8pro-official-web.mp4';

  return (
    <>
      {/* Video Background */}
      <video
        autoPlay
        loop
        muted
        playsInline
        className="fixed inset-0 h-full w-full object-cover"
        style={{ zIndex: 0 }}
      >
        <source src={videoSrc} type="video/mp4" />
        {/* Fallback for browsers that don't support video */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900" />
      </video>

      {/* Overlay for readability */}
      <div
        className={`fixed inset-0 ${overlayColor}`}
        style={{
          zIndex: 1,
          opacity: overlayOpacity,
        }}
      />

      {/* Gradient overlay for better text contrast */}
      <div
        className="fixed inset-0 bg-gradient-to-b from-transparent via-black/20 to-black/40"
        style={{ zIndex: 2 }}
      />
    </>
  );
}
