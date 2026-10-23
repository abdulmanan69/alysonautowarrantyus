"use client";

import { useEffect, useRef } from "react";

/**
 * A soft yellow light that follows the mouse across its parent section (the hero). It only
 * moves the light's CSS variables, so the page never re-renders. Hidden on touch devices and
 * for people who prefer reduced motion.
 */
export function CursorGlow({ size = 520, opacity = 0.28 }: { size?: number; opacity?: number }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    const parent = el?.parentElement;
    if (!el || !parent) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches || !window.matchMedia("(hover: hover)").matches) return;
    let raf = 0;
    let x = 0, y = 0;
    const paint = () => {
      raf = 0;
      el.style.setProperty("--gx", `${x}px`);
      el.style.setProperty("--gy", `${y}px`);
    };
    const onMove = (e: PointerEvent) => {
      const r = parent.getBoundingClientRect();
      x = e.clientX - r.left;
      y = e.clientY - r.top;
      el.style.opacity = String(opacity);
      if (!raf) raf = requestAnimationFrame(paint);
    };
    const onLeave = () => {
      el.style.opacity = "0";
    };
    parent.addEventListener("pointermove", onMove);
    parent.addEventListener("pointerleave", onLeave);
    return () => {
      parent.removeEventListener("pointermove", onMove);
      parent.removeEventListener("pointerleave", onLeave);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [opacity]);

  return (
    <div
      ref={ref}
      aria-hidden
      className="pointer-events-none absolute inset-0 -z-[5] opacity-0 transition-opacity duration-500"
      style={{
        background: `radial-gradient(${size}px circle at var(--gx, 50%) var(--gy, 50%), rgba(255,187,0,0.55), rgba(255,187,0,0.12) 40%, transparent 70%)`,
        mixBlendMode: "screen",
      }}
    />
  );
}
