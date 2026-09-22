import React, { useRef, useEffect } from "react";
import { useLocation } from "react-router-dom";

export const GlobalPageBackground: React.FC = () => {
  const { pathname } = useLocation();
  const videoRef = useRef<HTMLVideoElement>(null);

  // Background video is active on all pages except the Home page ("/")
  // On Home, the video is strictly confined to the hero section.
  const isHome = pathname === "/";

  useEffect(() => {
    if (!isHome && videoRef.current) {
      const vid = videoRef.current;
      vid.defaultMuted = true;
      vid.muted = true;
      vid.loop = true;
      vid.playsInline = true;
      vid.setAttribute("muted", "");
      vid.setAttribute("playsinline", "");
      vid.setAttribute("loop", "");
      vid.setAttribute("autoplay", "");
      const playPromise = vid.play();
      if (playPromise !== undefined) {
        playPromise.catch(() => {});
      }
    }
  }, [isHome]);

  if (isHome) {
    return null;
  }

  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 pointer-events-none z-0 overflow-hidden"
    >
      <video
        ref={videoRef}
        autoPlay
        loop
        muted
        playsInline
        preload="auto"
        disablePictureInPicture
        controls={false}
        className="w-full h-full object-cover opacity-20 pointer-events-none transition-opacity duration-700"
        onEnded={(e) => {
          e.currentTarget.play().catch(() => {});
        }}
      >
        <source src="/bg.mp4" type="video/mp4" />
      </video>

      {/* Dimmed ambient overlay to maintain text contrast and dashboard readability */}
      <div className="absolute inset-0 bg-background/60 pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-b from-background/50 via-transparent to-background/80 pointer-events-none" />
    </div>
  );
};
