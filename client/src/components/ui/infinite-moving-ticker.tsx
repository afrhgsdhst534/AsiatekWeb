import React, { useEffect, useRef, useState, CSSProperties } from "react";
import { useIsMobile } from "@/hooks/use-mobile";

/**
 * One component – handles both horizontal (desktop) and vertical (mobile) flows.
 * Works with GPU‑only transforms, recalculates on resize, resumes after
 * orientation change, and pauses on hover if asked.
 */
interface InfiniteMovingTickerProps {
  items: { id: string; image: string; alt: string }[];
  /** desktop: “left” or “right”. mobile just re‑uses the same flag */
  direction?: "left" | "right";
  /** pixels / second */
  speed?: number;
  pauseOnHover?: boolean;
  /** gap between items in px */
  gap?: number;
  className?: string;
  /** if true the ticker flips to vertical below 768 px */
  verticalOnMobile?: boolean;
}

export function InfiniteMovingTicker({
  items,
  direction = "left",
  speed = 30,
  pauseOnHover = true,
  gap = 50,
  className = "",
  verticalOnMobile = false,
}: InfiniteMovingTickerProps) {
  /* --- responsive orientation ------------------------------------------------ */
  const isMobile = useIsMobile();
  const orientation: "horizontal" | "vertical" =
    verticalOnMobile && isMobile ? "vertical" : "horizontal";
  const axis = orientation === "horizontal" ? "X" : "Y";

  /* --- refs for low‑level animation state ------------------------------------ */
  const containerRef = useRef<HTMLDivElement | null>(null);
  const distance = useRef(0); // how far we’ve translated so far
  const cycle = useRef(0); // half of full strip length
  const frame = useRef(0); // rAF id

  /* --- optional hover pause -------------------------------------------------- */
  const [paused, setPaused] = useState(false);

  /* --- measure strip length any time size/flow changes ----------------------- */
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const calc = () => {
      cycle.current =
        orientation === "horizontal" ? el.scrollWidth / 2 : el.scrollHeight / 2;
    };
    calc(); // initial

    // keep it fresh on resize / font‑load / img‑load
    const ro = new ResizeObserver(calc);
    ro.observe(el);
    return () => ro.disconnect();
  }, [items, orientation]);

  /* --- rAF loop -------------------------------------------------------------- */
  useEffect(() => {
    const start = performance.now();
    let last = start;

    const tick = (now: number) => {
      const dt = now - last;
      last = now;

      if (!paused && cycle.current) {
        const delta = (speed * dt) / 1000;
        distance.current += direction === "left" ? -delta : delta;

        // wrap
        if (distance.current <= -cycle.current)
          distance.current += cycle.current;
        if (distance.current >= 0) distance.current -= cycle.current;

        if (containerRef.current) {
          containerRef.current.style.transform = `translate${axis}(${distance.current}px)`;
        }
      }
      frame.current = requestAnimationFrame(tick);
    };

    frame.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame.current);
  }, [direction, speed, paused, orientation]);

  /* --- presentation ---------------------------------------------------------- */
  const stripStyle: CSSProperties = {
    display: "flex",
    flexDirection: orientation === "horizontal" ? "row" : "column",
    gap: `${gap}px`,
    willChange: "transform",
  };

  const fadeMask =
    orientation === "horizontal"
      ? "linear-gradient(to right, transparent, black 10%, black 90%, transparent)"
      : "linear-gradient(to bottom, transparent, black 10%, black 90%, transparent)";

  return (
    <div
      className={`relative overflow-hidden ${className}`}
      style={{
        maskImage: fadeMask,
        WebkitMaskImage: fadeMask,
      }}
      onMouseEnter={() => pauseOnHover && setPaused(true)}
      onMouseLeave={() => pauseOnHover && setPaused(false)}
    >
      <div ref={containerRef} style={stripStyle}>
        {[...items, ...items].map((item, i) => (
          <div
            key={i < items.length ? item.id : `dup-${item.id}`}
            className="w-16 h-16 flex-none flex items-center justify-center"
          >
            <img
              src={item.image}
              alt={item.alt}
              loading="lazy"
              draggable={false}
              className="max-w-full max-h-full object-contain transition-transform duration-300 hover:scale-110"
            />
          </div>
        ))}
      </div>
    </div>
  );
}
