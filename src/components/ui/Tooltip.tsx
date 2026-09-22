import React, { useState, useRef, useEffect, useCallback } from "react";

export interface TooltipProps {
  content: React.ReactNode;
  children: React.ReactNode;
  placement?: "top" | "bottom" | "left" | "right";
  delayMs?: number;
  className?: string;
}

export const Tooltip: React.FC<TooltipProps> = ({
  content,
  children,
  placement = "top",
  delayMs = 120,
  className = "",
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [coords, setCoords] = useState<{ top: number; left: number }>({ top: 0, left: 0 });
  const [actualPlacement, setActualPlacement] = useState<"top" | "bottom" | "left" | "right">(placement);
  const triggerRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<number | null>(null);

  const calculatePosition = useCallback(() => {
    if (!triggerRef.current || !tooltipRef.current) return;
    const triggerRect = triggerRef.current.getBoundingClientRect();
    const tooltipRect = tooltipRef.current.getBoundingClientRect();
    const gap = 6;
    const padding = 8;

    let targetTop = 0;
    let targetLeft = 0;
    let computedPlacement = placement;

    if (placement === "top") {
      targetTop = triggerRect.top - tooltipRect.height - gap;
      targetLeft = triggerRect.left + (triggerRect.width - tooltipRect.width) / 2;

      if (targetTop < padding) {
        targetTop = triggerRect.bottom + gap;
        computedPlacement = "bottom";
      }
    } else if (placement === "bottom") {
      targetTop = triggerRect.bottom + gap;
      targetLeft = triggerRect.left + (triggerRect.width - tooltipRect.width) / 2;

      if (targetTop + tooltipRect.height > window.innerHeight - padding) {
        targetTop = triggerRect.top - tooltipRect.height - gap;
        computedPlacement = "top";
      }
    } else if (placement === "left") {
      targetTop = triggerRect.top + (triggerRect.height - tooltipRect.height) / 2;
      targetLeft = triggerRect.left - tooltipRect.width - gap;

      if (targetLeft < padding) {
        targetLeft = triggerRect.right + gap;
        computedPlacement = "right";
      }
    } else if (placement === "right") {
      targetTop = triggerRect.top + (triggerRect.height - tooltipRect.height) / 2;
      targetLeft = triggerRect.right + gap;

      if (targetLeft + tooltipRect.width > window.innerWidth - padding) {
        targetLeft = triggerRect.left - tooltipRect.width - gap;
        computedPlacement = "left";
      }
    }

    if (targetLeft < padding) {
      targetLeft = padding;
    } else if (targetLeft + tooltipRect.width > window.innerWidth - padding) {
      targetLeft = window.innerWidth - tooltipRect.width - padding;
    }

    setCoords({ top: targetTop, left: targetLeft });
    setActualPlacement(computedPlacement);
  }, [placement]);

  const show = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = window.setTimeout(() => {
      setIsVisible(true);
    }, delayMs);
  };

  const hide = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setIsVisible(false);
  };

  useEffect(() => {
    if (isVisible) {
      calculatePosition();
      const handleScrollOrResize = () => calculatePosition();
      window.addEventListener("scroll", handleScrollOrResize, true);
      window.addEventListener("resize", handleScrollOrResize);
      return () => {
        window.removeEventListener("scroll", handleScrollOrResize, true);
        window.removeEventListener("resize", handleScrollOrResize);
      };
    }
  }, [isVisible, calculatePosition]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isVisible) {
        hide();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [isVisible]);

  return (
    <>
      <div
        ref={triggerRef}
        className={`inline-flex items-center cursor-help ${className}`}
        onMouseEnter={show}
        onMouseLeave={hide}
        onFocus={show}
        onBlur={hide}
        tabIndex={0}
        aria-haspopup="true"
        aria-expanded={isVisible}
      >
        {children}
      </div>

      {isVisible && (
        <div
          ref={tooltipRef}
          role="tooltip"
          data-placement={actualPlacement}
          style={{
            position: "fixed",
            top: `${coords.top}px`,
            left: `${coords.left}px`,
          }}
          className="z-50 px-2.5 py-1.5 text-[11px] font-sans font-normal text-[#ededed] bg-[#111111] border border-[#333333] rounded shadow-2xl pointer-events-none max-w-xs transition-opacity duration-150 animate-in fade-in zoom-in-95"
        >
          {content}
        </div>
      )}
    </>
  );
};
