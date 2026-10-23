"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

type Props = {
  children: ReactNode;
  className?: string;
  // Delay in ms, for staggering neighbouring elements.
  delay?: number;
  from?: "up" | "left" | "right" | "pop";
};

const offsets = { up: "translate-y-10", left: "-translate-x-12", right: "translate-x-12", pop: "translate-y-6 scale-90" };

// Fades and slides its children in the first time they scroll into view.
//
// The server renders everything visible, so crawlers, screenshots and people without JavaScript
// see the full page. Once mounted, anything that is still below the fold is hidden and revealed
// when it scrolls in; anything already on screen (and anyone asking for reduced motion) is left
// alone so there is no flash on first paint.
export function Reveal({ children, className = "", delay = 0, from = "up" }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || !("IntersectionObserver" in window)) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const rect = el.getBoundingClientRect();
    if (rect.top < window.innerHeight && rect.bottom > 0) return; // already on screen
    setHidden(true);
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setHidden(false);
          observer.disconnect();
        }
      },
      { threshold: 0.15 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      style={{ transitionDelay: `${delay}ms` }}
      className={`transition-[opacity,transform] duration-700 ${from === "pop" ? "ease-[cubic-bezier(0.34,1.56,0.64,1)]" : "ease-out"} ${hidden ? `opacity-0 ${offsets[from]}` : "translate-x-0 translate-y-0 scale-100 opacity-100"} ${className}`}
    >
      {children}
    </div>
  );
}
