'use client';

import { useEffect, useRef, useState } from 'react';

const AUTH_VIDEO_SOURCE = '/videos/chery-tiggo8pro-official.mp4';
const AUTH_VIDEO_FALLBACK_SOURCE = '/videos/chery-tiggo8pro-official-web.mp4';
const AUTH_VIDEO_MOBILE_SOURCE = '/videos/chery-tiggo8pro-mobile-official.mp4';

const LOOP_START = 2.2;
const LOOP_END = 10.2;

export function CheryVideoBackground() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [hasVideoError, setHasVideoError] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // Some browsers block first autoplay attempt; retry after metadata is ready.
    const tryPlay = () => {
      void video.play().catch(() => {
        // Keep silent: muted autoplay may still begin on next frame/user interaction.
      });
    };

    const handleLoadedMetadata = () => {
      const safeStart = Math.min(LOOP_START, Math.max(0, video.duration - 0.5));
      video.currentTime = safeStart;
      tryPlay();
    };

    const handleTimeUpdate = () => {
      if (video.currentTime >= LOOP_END || video.currentTime >= video.duration - 0.1) {
        video.currentTime = LOOP_START;
      }
    };

    const handleCanPlay = () => {
      if (hasVideoError) {
        setHasVideoError(false);
      }
      tryPlay();
    };

    video.addEventListener('loadedmetadata', handleLoadedMetadata);
    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('canplay', handleCanPlay);

    return () => {
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('canplay', handleCanPlay);
    };
  }, [hasVideoError]);

  return (
    <>
      <video
        ref={videoRef}
        className="chery-auth-video"
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        onError={() => setHasVideoError(true)}
      >
        <source src={AUTH_VIDEO_SOURCE} type="video/mp4" />
        <source src={AUTH_VIDEO_FALLBACK_SOURCE} type="video/mp4" />
        <source src={AUTH_VIDEO_MOBILE_SOURCE} type="video/mp4" />
      </video>
      {hasVideoError && <div className="chery-auth-video-fallback" />}
      <div className="chery-auth-video-overlay" />
    </>
  );
}
