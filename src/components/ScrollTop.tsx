"use client";

import { useEffect, useRef, useState } from "react";

// Floating "back to top" button. Appears once the reader is a screen down the page and its ring
// fills as they read, so it doubles as a reading-progress indicator.
export function ScrollTop() {
  const ref = useRef<HTMLButtonElement>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    let raf = 0;
    const update = () => {
      raf = 0;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const p = max > 0 ? Math.min(100, Math.max(0, (window.scrollY / max) * 100)) : 0;
      ref.current?.style.setProperty("--p", p.toFixed(1));
      setShown(window.scrollY > window.innerHeight * 0.8);
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <button
      ref={ref}
      type="button"
      aria-label="Back to top"
      onClick={() => window.scrollTo({ top: 0, behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" })}
      className={`scroll-top fixed bottom-5 right-5 z-20 grid h-14 w-14 place-items-center rounded-full p-[3px] shadow-lift transition duration-300 hover:scale-110 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand/40 ${shown ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-4 opacity-0"}`}
    >
      <span className="grid h-full w-full place-items-center rounded-full bg-ink text-brand">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M12 19V5M5 12l7-7 7 7" />
        </svg>
      </span>
    </button>
  );
}
