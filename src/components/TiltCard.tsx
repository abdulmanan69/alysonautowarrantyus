"use client";

import { useRef, type ReactNode } from "react";

/**
 * Wraps a card so it tilts toward the mouse and shows a soft yellow sheen where the cursor is.
 * Pure CSS variables: no re-renders while moving. Does nothing for touch or reduced motion.
 */
export function TiltCard({ children, className = "", max = 7 }: { children: ReactNode; className?: string; max?: number }) {
  const ref = useRef<HTMLDivElement>(null);

  function move(e: React.PointerEvent<HTMLDivElement>) {
    const el = ref.current;
    if (!el || e.pointerType !== "mouse") return;
    const r = el.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width; // 0..1
    const y = (e.clientY - r.top) / r.height;
    el.style.setProperty("--rx", `${((0.5 - y) * max).toFixed(2)}deg`);
    el.style.setProperty("--ry", `${((x - 0.5) * max).toFixed(2)}deg`);
    el.style.setProperty("--mx", `${(x * 100).toFixed(1)}%`);
    el.style.setProperty("--my", `${(y * 100).toFixed(1)}%`);
    el.style.setProperty("--sheen", "1");
  }
  function leave() {
    const el = ref.current;
    if (!el) return;
    el.style.setProperty("--rx", "0deg");
    el.style.setProperty("--ry", "0deg");
    el.style.setProperty("--sheen", "0");
  }

  return (
    <div
      ref={ref}
      onPointerMove={move}
      onPointerLeave={leave}
      className={`tilt relative h-full [perspective:1000px] ${className}`}
      style={{ "--rx": "0deg", "--ry": "0deg", "--mx": "50%", "--my": "50%", "--sheen": "0" } as React.CSSProperties}
    >
      <div className="tilt-inner relative h-full transition-transform duration-200 ease-out [transform:rotateX(var(--rx))_rotateY(var(--ry))] [transform-style:preserve-3d] motion-reduce:[transform:none]">
        {children}
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 rounded-3xl opacity-[var(--sheen)] transition-opacity duration-300"
          style={{ background: "radial-gradient(240px circle at var(--mx) var(--my), rgba(255,187,0,0.22), transparent 60%)" }}
        />
      </div>
    </div>
  );
}
