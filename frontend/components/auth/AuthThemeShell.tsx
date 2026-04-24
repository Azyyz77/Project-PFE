'use client';

import { ReactNode } from 'react';
import { VideoBackground } from './VideoBackground';

interface AuthThemeShellProps {
  children: ReactNode;
  sceneClassName?: string;
  /**
   * Enable video background
   */
  videoBackground?: boolean;
  /**
   * Video overlay opacity (0-1)
   */
  videoOverlayOpacity?: number;
}

export function AuthThemeShell({
  children,
  sceneClassName,
  videoBackground = false,
  videoOverlayOpacity = 0.5,
}: AuthThemeShellProps) {
  return (
    <div className={`min-h-screen flex flex-col relative ${sceneClassName || ''} ${videoBackground ? 'bg-black' : 'bg-muted/30'}`}>
      {/* Video Background */}
      {videoBackground && (
        <VideoBackground
          enabled={true}
          overlayOpacity={videoOverlayOpacity}
          overlayColor="bg-black"
        />
      )}

      {/* Content with proper z-index */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
}
