import React, { useRef, useEffect } from "react";

export const GlobalPageBackground: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current) {
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
  }, []);

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
        className="w-full h-full object-cover opacity-25 pointer-events-none transition-opacity duration-700"
        onEnded={(e) => {
          e.currentTarget.play().catch(() => {});
        }}
      >
        <source src="/bg.mp4" type="video/mp4" />
      </video>

      {/* Dimmed ambient overlay to maintain text contrast and dashboard readability */}
      <div className="absolute inset-0 bg-background/60 pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-b from-background/40 via-transparent to-background/80 pointer-events-none" />
    </div>
  );
};
