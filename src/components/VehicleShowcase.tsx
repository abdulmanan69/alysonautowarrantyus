"use client";

import Link from "next/link";
import { useEffect, useId, useRef, useState } from "react";
import { Icon } from "@/components/Icons";

export type ShowcaseVehicle = {
  key: string;
  label: string; // tab label, e.g. "Sedans"
  title: string; // heading, e.g. "Sedans and hatchbacks"
  image: string; // transparent PNG/WebP cut-out
  blurb: string;
  points: string[];
  bestPlan: { name: string; slug: string };
  specs: [string, string][]; // small facts shown next to the picture
};

const AUTO_MS = 6500;

/**
 * "Vehicles we protect": tabs for vehicle types with a cut-out picture that leans toward the
 * mouse and a spotlight that follows it. Switches on its own every few seconds until the
 * visitor interacts. Keyboard: arrow keys move between tabs.
 */
export function VehicleShowcase({ vehicles }: { vehicles: ShowcaseVehicle[] }) {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const [still, setStill] = useState(false);
  const stage = useRef<HTMLDivElement>(null);
  const id = useId();
  const v = vehicles[active];

  useEffect(() => setStill(window.matchMedia("(prefers-reduced-motion: reduce)").matches), []);

  useEffect(() => {
    if (paused || still || vehicles.length < 2) return;
    const t = window.setInterval(() => setActive((i) => (i + 1) % vehicles.length), AUTO_MS);
    return () => window.clearInterval(t);
  }, [paused, still, vehicles.length]);

  function move(e: React.PointerEvent<HTMLDivElement>) {
    const el = stage.current;
    if (!el || e.pointerType !== "mouse" || still) return;
    const r = el.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5; // -0.5..0.5
    const y = (e.clientY - r.top) / r.height - 0.5;
    el.style.setProperty("--tx", `${(x * 28).toFixed(1)}px`);
    el.style.setProperty("--ty", `${(y * 16).toFixed(1)}px`);
    el.style.setProperty("--ry", `${(x * -14).toFixed(2)}deg`);
    el.style.setProperty("--rx", `${(y * 8).toFixed(2)}deg`);
    el.style.setProperty("--sx", `${((x + 0.5) * 100).toFixed(1)}%`);
    el.style.setProperty("--sy", `${((y + 0.5) * 100).toFixed(1)}%`);
  }
  function reset() {
    const el = stage.current;
    if (!el) return;
    for (const k of ["--tx", "--ty"]) el.style.setProperty(k, "0px");
    for (const k of ["--rx", "--ry"]) el.style.setProperty(k, "0deg");
    el.style.setProperty("--sx", "50%");
    el.style.setProperty("--sy", "50%");
  }
  function onKey(e: React.KeyboardEvent) {
    if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
      e.preventDefault();
      setActive((i) => (i + (e.key === "ArrowRight" ? 1 : vehicles.length - 1)) % vehicles.length);
      setPaused(true);
    }
  }

  return (
    <div onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)} onFocusCapture={() => setPaused(true)}>
      <div role="tablist" aria-label="Vehicle types" onKeyDown={onKey} className="-mx-5 flex gap-2 overflow-x-auto px-5 pb-2 [scrollbar-width:none] sm:mx-0 sm:flex-wrap sm:justify-center sm:px-0 [&::-webkit-scrollbar]:hidden">
        {vehicles.map((x, i) => (
          <button
            key={x.key}
            role="tab"
            id={`${id}-tab-${x.key}`}
            aria-selected={i === active}
            aria-controls={`${id}-panel`}
            tabIndex={i === active ? 0 : -1}
            onClick={() => setActive(i)}
            className={`shrink-0 rounded-full px-5 py-2.5 text-sm font-bold transition ${i === active ? "bg-asphalt text-line shadow-lift" : "border border-rail bg-white text-asphalt hover:border-asphalt"}`}
          >
            {x.label}
          </button>
        ))}
      </div>

      <div id={`${id}-panel`} role="tabpanel" aria-labelledby={`${id}-tab-${v.key}`} className="mt-8 grid items-center gap-10 lg:grid-cols-[1fr_1.1fr] lg:gap-14">
        <div key={v.key} className="step-in">
          <p className="eyebrow">{v.label}</p>
          <h3 className="mt-3 text-3xl font-extrabold leading-tight text-asphalt sm:text-4xl">{v.title}</h3>
          <p className="mt-4 text-lg leading-relaxed text-road">{v.blurb}</p>
          <ul className="mt-6 space-y-2.5">
            {v.points.map((p) => (
              <li key={p} className="flex items-start gap-2.5 text-[15px] font-medium text-asphalt">
                <span aria-hidden className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-brand text-asphalt"><Icon name="check" size={11} strokeWidth={3} /></span>
                {p}
              </li>
            ))}
          </ul>
          <div className="mt-7 flex flex-wrap items-center gap-3">
            <Link href={`/quote?plan=${v.bestPlan.slug}`} className="btn-primary">Get my free quote <Icon name="arrow" size={18} strokeWidth={2.4} /></Link>
            <Link href={`/plans/${v.bestPlan.slug}`} className="btn-secondary">Recommended: {v.bestPlan.name}</Link>
          </div>
        </div>

        <div
          ref={stage}
          onPointerMove={move}
          onPointerLeave={reset}
          className="relative isolate select-none rounded-[2rem] bg-ink p-6 text-white shadow-lift [perspective:1200px] sm:p-8"
          style={{ "--tx": "0px", "--ty": "0px", "--rx": "0deg", "--ry": "0deg", "--sx": "50%", "--sy": "50%" } as React.CSSProperties}
        >
          <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 rounded-[2rem] transition-[background] duration-150" style={{ background: "radial-gradient(420px circle at var(--sx) var(--sy), rgba(255,187,0,0.45), rgba(255,187,0,0.08) 45%, transparent 70%)" }} />
          <div aria-hidden className="pointer-events-none absolute inset-x-10 bottom-10 -z-10 h-10 rounded-[50%] bg-black/70 blur-2xl" />
          <div className="relative flex min-h-[260px] items-center justify-center sm:min-h-[320px]">
            {vehicles.map((x, i) => (
              <img
                key={x.key}
                src={x.image}
                alt={i === active ? x.title : ""}
                width={900}
                height={480}
                loading={i === 0 ? "eager" : "lazy"}
                decoding="async"
                aria-hidden={i !== active}
                className={`absolute inset-0 m-auto max-h-[300px] w-auto max-w-full object-contain drop-shadow-[0_30px_40px_rgba(0,0,0,0.6)] transition-all duration-700 ease-[cubic-bezier(.22,.61,.36,1)] motion-reduce:transition-none ${
                  i === active ? "translate-x-0 scale-100 opacity-100" : i < active ? "-translate-x-12 scale-90 opacity-0" : "translate-x-12 scale-90 opacity-0"
                }`}
                style={i === active ? { transform: "translate3d(var(--tx), var(--ty), 0) rotateX(var(--rx)) rotateY(var(--ry))", transition: "transform 0.15s ease-out, opacity 0.7s" } : undefined}
              />
            ))}
          </div>
          <dl className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {v.specs.map(([k, val]) => (
              <div key={k} className="rounded-xl bg-white/5 px-3 py-2.5">
                <dt className="text-[11px] font-bold uppercase tracking-[0.12em] text-line">{k}</dt>
                <dd className="mt-0.5 text-sm font-semibold">{val}</dd>
              </div>
            ))}
          </dl>
          <div className="mt-4 flex items-center justify-between text-xs text-white/50">
            <span>{active + 1} / {vehicles.length}</span>
            <span className="flex gap-1.5">
              {vehicles.map((x, i) => (
                <button key={x.key} type="button" onClick={() => setActive(i)} aria-label={`Show ${x.label}`} className={`h-1.5 rounded-full transition-all ${i === active ? "w-6 bg-line" : "w-1.5 bg-white/30 hover:bg-white/60"}`} />
              ))}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
