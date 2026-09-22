import React, { useRef, useEffect } from "react";
import { Link } from "react-router-dom";

export const Footer: React.FC = () => {
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
    <footer className="border-t border-border bg-background mt-24 relative overflow-hidden">
      {/* Footer Ambient Background Video */}
      <div aria-hidden="true" className="absolute inset-0 pointer-events-none overflow-hidden">
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
          <source src="/footer.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-background/70 pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-b from-background/90 via-transparent to-background/90 pointer-events-none" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12">
          <div className="md:col-span-4 space-y-4">
            <div className="flex items-center gap-2.5">
              <span className="font-mono font-black text-xl sm:text-2xl text-white tracking-tighter shrink-0 select-none">
                {'{D}'}
              </span>
              <div className="flex items-center gap-2">
                <span className="text-base tracking-tight font-sans">
                  <span className="font-normal text-text-secondary">dream</span>
                  <span className="font-extrabold text-white">DEX</span>
                </span>
                <span className="text-[10px] font-mono uppercase tracking-[0.18em] px-1.5 py-0.5 rounded-sm bg-surface-2 border border-border text-text-muted font-medium">
                  Analytics
                </span>
              </div>
            </div>
            <p className="text-xs text-text-secondary leading-[1.7] font-sans max-w-xs">
              An independent public analytics and transparency layer for the dreamDEX order book
              protocol on the Somnia blockchain.
            </p>
          </div>
          <div className="md:col-span-2 md:col-start-6">
            <h4 className="text-[11px] font-mono uppercase tracking-[0.15em] text-text-muted font-medium mb-4">
              Surfaces
            </h4>
            <ul className="space-y-2.5 text-xs font-sans text-text-secondary">
              <li>
                <Link to="/markets" className="hover:text-text-primary transition-colors">
                  Spot Markets
                </Link>
              </li>
              <li>
                <Link to="/volume" className="hover:text-text-primary transition-colors">
                  Volume
                </Link>
              </li>
              <li>
                <Link to="/liquidity" className="hover:text-text-primary transition-colors">
                  Liquidity & Depth
                </Link>
              </li>
              <li>
                <Link to="/trades" className="hover:text-text-primary transition-colors">
                  Trade Feed
                </Link>
              </li>
              <li>
                <Link to="/activity" className="hover:text-text-primary transition-colors">
                  Protocol Activity
                </Link>
              </li>
            </ul>
          </div>
          <div className="md:col-span-2">
            <h4 className="text-[11px] font-mono uppercase tracking-[0.15em] text-text-muted font-medium mb-4">
              Ecosystem
            </h4>
            <ul className="space-y-2.5 text-xs font-sans text-text-secondary">
              <li>
                <Link to="/events" className="hover:text-text-primary transition-colors">
                  Event Contracts
                </Link>
              </li>
              <li>
                <Link to="/lend" className="hover:text-text-primary transition-colors">
                  SomniaLend
                </Link>
              </li>
              <li>
                <Link to="/developers" className="hover:text-text-primary transition-colors">
                  Contracts
                </Link>
              </li>
              <li>
                <Link to="/methodology" className="hover:text-text-primary transition-colors">
                  Methodology
                </Link>
              </li>
              <li>
                <Link to="/status" className="hover:text-text-primary transition-colors">
                  System Status
                </Link>
              </li>
            </ul>
          </div>
          <div className="md:col-span-2">
            <h4 className="text-[11px] font-mono uppercase tracking-[0.15em] text-text-muted font-medium mb-4">
              Reference
            </h4>
            <ul className="space-y-2.5 text-xs font-sans text-text-secondary">
              <li>
                <a href="https://app.dreamdex.io/docs" target="_blank" rel="noreferrer" className="hover:text-text-primary transition-colors">
                  Documentation
                </a>
              </li>
              <li>
                <a href="https://app.dreamdex.io/docs/developers/http-api" target="_blank" rel="noreferrer" className="hover:text-text-primary transition-colors">
                  REST API
                </a>
              </li>
              <li>
                <a href="https://app.dreamdex.io/docs/developers/websocket-api" target="_blank" rel="noreferrer" className="hover:text-text-primary transition-colors">
                  WebSocket Feeds
                </a>
              </li>
              <li>
                <a href="https://somniascan.com" target="_blank" rel="noreferrer" className="hover:text-text-primary transition-colors">
                  Block Explorer
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </footer>
  );
};
