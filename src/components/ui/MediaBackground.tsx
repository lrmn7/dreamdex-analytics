import React, { useRef, useEffect } from "react";

export interface MediaBackgroundProps {
  variant?: "canvas-mesh" | "grid-contours" | "waveform" | "video" | "image";
  src?: string;
  poster?: string;
  className?: string;
  intensity?: "low" | "medium" | "high";
  interactive?: boolean;
  overlay?: boolean;
  children?: React.ReactNode;
}

export const MediaBackground: React.FC<MediaBackgroundProps> = ({
  variant = "canvas-mesh",
  src,
  poster,
  className = "",
  intensity = "low",
  interactive = true,
  overlay = true,
  children,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (variant === "video" && videoRef.current) {
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
  }, [variant, src]);

  useEffect(() => {
    if (variant === "video" || variant === "image") return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let isVisible = true;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let cssWidth = canvas.offsetWidth || window.innerWidth;
    let cssHeight = canvas.offsetHeight || 500;
    canvas.width = cssWidth * dpr;
    canvas.height = cssHeight * dpr;
    ctx.scale(dpr, dpr);

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const baseAlpha = intensity === "high" ? 0.09 : intensity === "medium" ? 0.06 : 0.04;

    let mouseX = cssWidth * 0.65;
    let mouseY = cssHeight * 0.4;
    let targetMouseX = mouseX;
    let targetMouseY = mouseY;

    const handleMouseMove = (e: MouseEvent) => {
      if (!interactive) return;
      const rect = canvas.getBoundingClientRect();
      targetMouseX = e.clientX - rect.left;
      targetMouseY = e.clientY - rect.top;
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });

    const handleResize = () => {
      if (!canvas) return;
      cssWidth = canvas.offsetWidth;
      cssHeight = canvas.offsetHeight;
      canvas.width = cssWidth * dpr;
      canvas.height = cssHeight * dpr;
      ctx.scale(dpr, dpr);
    };

    window.addEventListener("resize", handleResize, { passive: true });

    const observer = new IntersectionObserver(
      (entries) => {
        isVisible = entries[0].isIntersecting;
        if (isVisible && !prefersReducedMotion && !animationFrameId) {
          render();
        }
      },
      { threshold: 0.05 }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    let time = 0;

    const drawDepthTopology = () => {
      ctx.clearRect(0, 0, cssWidth, cssHeight);

      mouseX += (targetMouseX - mouseX) * 0.04;
      mouseY += (targetMouseY - mouseY) * 0.04;

      const midX = cssWidth * 0.52;
      const width = cssWidth;
      const height = cssHeight;

      const bidLayers = 8;
      for (let i = 0; i < bidLayers; i++) {
        const layerT = i / bidLayers;
        const alpha = baseAlpha * (1 - layerT * 0.5);

        ctx.beginPath();
        ctx.strokeStyle = `rgba(255, 255, 255, ${alpha})`;
        ctx.lineWidth = i === 0 ? 1.2 : 0.7;

        const points = 48;
        for (let j = 0; j <= points; j++) {
          const t = j / points;
          const x = t * midX;
          const baseY = height * (0.25 + layerT * 0.065);

          const depthCurve = Math.pow(1 - t, 1.8) * height * 0.35;
          const noise = Math.sin(time * 0.5 + j * 0.35 + i * 1.1) * (3 + i * 1.5);
          const noise2 = Math.cos(time * 0.3 + j * 0.18 - i * 0.7) * 2;

          const distToMouse = Math.hypot(x - mouseX, baseY + depthCurve - mouseY);
          const mouseDeflect = Math.max(0, 1 - distToMouse / 240) * 18;

          const y = baseY + depthCurve + noise + noise2 - mouseDeflect;

          if (j === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
      }

      const askLayers = 8;
      for (let i = 0; i < askLayers; i++) {
        const layerT = i / askLayers;
        const alpha = baseAlpha * (1 - layerT * 0.5) * 0.7;

        ctx.beginPath();
        ctx.strokeStyle = `rgba(255, 255, 255, ${alpha})`;
        ctx.lineWidth = i === 0 ? 1.2 : 0.7;

        const points = 48;
        for (let j = 0; j <= points; j++) {
          const t = j / points;
          const x = midX + t * (width - midX);
          const baseY = height * (0.55 + layerT * 0.055);

          const depthCurve = Math.pow(t, 2) * height * 0.28;
          const noise = Math.sin(time * 0.45 + j * 0.3 - i * 0.9) * (2.5 + i * 1.2);
          const noise2 = Math.cos(time * 0.25 + j * 0.22 + i * 0.5) * 1.8;

          const distToMouse = Math.hypot(x - mouseX, baseY - depthCurve - mouseY);
          const mouseDeflect = Math.max(0, 1 - distToMouse / 240) * 18;

          const y = baseY - depthCurve + noise + noise2 + mouseDeflect;

          if (j === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
      }

      const ticks = 14;
      const tickSpacing = width / (ticks + 1);
      ctx.strokeStyle = `rgba(255, 255, 255, ${baseAlpha * 0.3})`;
      ctx.lineWidth = 0.5;

      for (let k = 1; k <= ticks; k++) {
        const x = k * tickSpacing;
        const tickHeight = (k === Math.round(ticks * 0.52)) ? height * 0.7 : 12 + Math.sin(k * 0.8 + time * 0.2) * 4;
        const tickY = height * 0.45;

        if (k === Math.round(ticks * 0.52)) {
          ctx.strokeStyle = `rgba(255, 255, 255, ${baseAlpha * 0.6})`;
          ctx.setLineDash([3, 5]);
          ctx.beginPath();
          ctx.moveTo(x, height * 0.08);
          ctx.lineTo(x, height * 0.92);
          ctx.stroke();
          ctx.setLineDash([]);
          ctx.strokeStyle = `rgba(255, 255, 255, ${baseAlpha * 0.3})`;
        } else {
          ctx.beginPath();
          ctx.moveTo(x, tickY - tickHeight / 2);
          ctx.lineTo(x, tickY + tickHeight / 2);
          ctx.stroke();
        }
      }

      const bands = 3;
      for (let b = 0; b < bands; b++) {
        const bandY = height * (0.3 + b * 0.2);
        const bandAlpha = baseAlpha * 0.12;
        ctx.fillStyle = `rgba(255, 255, 255, ${bandAlpha})`;
        ctx.fillRect(0, bandY, width, 1);
      }
    };

    const render = () => {
      if (!isVisible) return;
      time += 0.01;
      drawDepthTopology();

      if (!prefersReducedMotion) {
        animationFrameId = requestAnimationFrame(render);
      }
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("resize", handleResize);
      observer.disconnect();
    };
  }, [variant, intensity, interactive]);

  return (
    <div
      ref={containerRef}
      className={`relative w-full overflow-hidden bg-background ${className}`}
    >
      {variant === "video" && src ? (
        <video
          ref={videoRef}
          autoPlay
          loop
          muted
          playsInline
          poster={poster}
          preload="auto"
          disablePictureInPicture
          controls={false}
          className={`absolute inset-0 w-full h-full object-cover pointer-events-none transition-opacity duration-700 ${
            intensity === "high"
              ? "opacity-35"
              : intensity === "medium"
              ? "opacity-25"
              : "opacity-15"
          }`}
          onEnded={(e) => {
            e.currentTarget.play().catch(() => {});
          }}
        >
          <source src={src} type="video/mp4" />
        </video>
      ) : variant === "image" && src ? (
        <div
          className="absolute inset-0 w-full h-full bg-cover bg-center opacity-15 pointer-events-none"
          style={{ backgroundImage: `url(${src})` }}
        />
      ) : (
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full pointer-events-none"
        />
      )}

      {overlay && (
        <div className="absolute inset-0 bg-gradient-to-b from-background/30 via-transparent to-background/80 pointer-events-none" />
      )}

      <div className="relative z-10 w-full">{children}</div>
    </div>
  );
};
