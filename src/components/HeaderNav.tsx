"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import type { MenuItem } from "@/lib/settings";

type Props = { links: MenuItem[]; phone: string | null; phoneHref: string; ctaLabel: string; ctaHref: string; siteName: string };

const external = (href: string) => /^https?:\/\//.test(href);
const linkProps = (i: MenuItem) => (i.newTab || external(i.href) ? { target: "_blank", rel: "noopener noreferrer" } : {});
const Chevron = ({ open = false, className = "" }: { open?: boolean; className?: string }) => (
  <svg aria-hidden width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" className={`transition-transform duration-200 ${open ? "rotate-180" : ""} ${className}`}>
    <path d="m6 9 6 6 6-6" />
  </svg>
);
const PhoneIcon = () => (
  <svg aria-hidden width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 1.9.7 2.8a2 2 0 0 1-.5 2.1L8 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.8.7a2 2 0 0 1 1.7 2z" /></svg>
);

function useActive() {
  const path = usePathname();
  return useCallback(
    (i: MenuItem): boolean => {
      const on = (href: string) => !href.includes("#") && !external(href) && href !== "/" && (path === href || path.startsWith(`${href}/`));
      return on(i.href) || !!i.children?.some((c) => on(c.href));
    },
    [path],
  );
}

/** Desktop dropdown: opens on hover, or on click/keyboard via the arrow button. */
function Dropdown({ item, active }: { item: MenuItem; active: boolean }) {
  const [open, setOpen] = useState(false);
  const box = useRef<HTMLDivElement>(null);
  const timer = useRef<number | undefined>(undefined);
  const wide = item.children!.some((c) => c.description);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => !box.current?.contains(e.target as Node) && setOpen(false);
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div
      ref={box}
      className="relative"
      onMouseEnter={() => {
        window.clearTimeout(timer.current);
        setOpen(true);
      }}
      onMouseLeave={() => {
        timer.current = window.setTimeout(() => setOpen(false), 120);
      }}
      onBlur={(e) => !box.current?.contains(e.relatedTarget as Node) && setOpen(false)}
    >
      <div className="flex items-center gap-0.5">
        <Link href={item.href} {...linkProps(item)} aria-current={active ? "page" : undefined} className={`relative py-2 text-[15px] font-semibold transition hover:text-line ${active ? "text-line" : "text-white/85"}`}>
          {item.label}
        </Link>
        <button type="button" onClick={() => setOpen((o) => !o)} aria-expanded={open} aria-label={`${item.label} menu`} className={`grid h-7 w-6 place-items-center rounded transition hover:text-line ${active ? "text-line" : "text-white/70"}`}>
          <Chevron open={open} />
        </button>
      </div>
      <div className={`absolute left-1/2 top-full z-40 -translate-x-1/2 pt-3 transition duration-150 ${open ? "visible translate-y-0 opacity-100" : "invisible -translate-y-1 opacity-0"}`}>
        <ul className={`rounded-2xl border border-rail bg-white p-2 text-asphalt shadow-[0_20px_50px_rgba(11,12,15,0.25)] ${wide ? "grid w-[580px] grid-cols-2 gap-1" : "w-64"}`}>
          {item.children!.map((c) => (
            <li key={c.id}>
              <Link href={c.href} {...linkProps(c)} onClick={() => setOpen(false)} className="block rounded-xl px-3.5 py-2.5 transition hover:bg-brand-soft">
                <span className="block text-[15px] font-semibold text-asphalt">{c.label}</span>
                {c.description && <span className="mt-0.5 block text-[13px] leading-snug text-road">{c.description}</span>}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

/** Phone and tablet menu: a panel that slides in from the right. */
function Drawer({ open, onClose, links, phone, phoneHref, ctaLabel, ctaHref, siteName, isActive }: Props & { open: boolean; onClose: () => void; isActive: (i: MenuItem) => boolean }) {
  const panel = useRef<HTMLDivElement>(null);
  const closeBtn = useRef<HTMLButtonElement>(null);
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    const root = document.documentElement;
    const prev = root.style.overflow;
    root.style.overflow = "hidden"; // the page behind doesn't scroll
    closeBtn.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key !== "Tab" || !panel.current) return;
      // Keep keyboard focus inside the drawer.
      const items = panel.current.querySelectorAll<HTMLElement>("a[href], button:not([disabled])");
      const first = items[0];
      const last = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => {
      root.style.overflow = prev;
      document.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  return (
    <div className={`fixed inset-0 z-50 lg:hidden ${open ? "" : "pointer-events-none"}`} aria-hidden={!open} inert={!open}>
      <div onClick={onClose} className={`absolute inset-0 bg-ink/70 transition-opacity duration-300 ${open ? "opacity-100" : "opacity-0"}`} />
      <div
        ref={panel}
        id="mobile-menu"
        role="dialog"
        aria-modal="true"
        aria-label="Menu"
        className={`absolute inset-y-0 right-0 flex w-[88%] max-w-sm flex-col bg-white text-asphalt shadow-2xl transition-transform duration-300 ease-[cubic-bezier(.22,.61,.36,1)] ${open ? "translate-x-0" : "translate-x-full"}`}
      >
        <div className="flex items-center justify-between border-b border-rail px-5 py-4">
          <Link href="/" onClick={onClose} aria-label={`${siteName} home`} className="inline-flex rounded-xl bg-ink px-3 py-1.5">
            <img src="/brand/logo.webp" alt={siteName} width={400} height={321} className="h-10 w-auto" />
          </Link>
          <button ref={closeBtn} type="button" onClick={onClose} aria-label="Close menu" className="grid h-10 w-10 place-items-center rounded-lg border border-rail text-asphalt">
            <svg aria-hidden width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><path d="M6 6l12 12M18 6 6 18" /></svg>
          </button>
        </div>

        <nav aria-label="Main" className="flex-1 overflow-y-auto px-3 py-3">
          <ul className="space-y-1">
            {links.map((l) => {
              const active = isActive(l);
              const isOpen = expanded === l.id;
              return (
                <li key={l.id}>
                  <div className={`flex items-center rounded-xl ${active ? "bg-brand-soft" : ""}`}>
                    <Link href={l.href} {...linkProps(l)} onClick={onClose} aria-current={active ? "page" : undefined} className={`flex-1 px-3 py-3.5 text-base font-semibold ${active ? "text-brand-deep" : "text-asphalt"}`}>
                      {l.label}
                    </Link>
                    {!!l.children?.length && (
                      <button type="button" onClick={() => setExpanded(isOpen ? null : l.id)} aria-expanded={isOpen} aria-label={`${l.label} menu`} className="grid h-12 w-12 place-items-center text-asphalt">
                        <Chevron open={isOpen} />
                      </button>
                    )}
                  </div>
                  {!!l.children?.length && (
                    <div className={`grid transition-[grid-template-rows] duration-300 ${isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}>
                      <ul className="overflow-hidden">
                        {l.children.map((c) => (
                          <li key={c.id}>
                            <Link href={c.href} {...linkProps(c)} onClick={onClose} className="ml-3 block border-l-2 border-brand py-2.5 pl-4 pr-3">
                              <span className="block font-medium text-asphalt">{c.label}</span>
                              {c.description && <span className="block text-sm text-road">{c.description}</span>}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        </nav>

        {(ctaLabel || phone) && (
          <div className="grid gap-2 border-t border-rail p-4">
            {ctaLabel && (
              <Link href={ctaHref} onClick={onClose} className="rounded-xl bg-brand px-4 py-3.5 text-center font-bold text-asphalt">
                {ctaLabel}
              </Link>
            )}
            {phone && (
              <a href={phoneHref} className="flex items-center justify-center gap-2 rounded-xl border border-rail px-4 py-3.5 font-semibold text-asphalt">
                <PhoneIcon />
                Call {phone}
              </a>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// Header links (with dropdowns), phone and quote button. Below the large-screen size the links
// move into a drawer that slides in from the side.
export function HeaderNav(props: Props) {
  const { links, phone, phoneHref, ctaLabel, ctaHref } = props;
  const path = usePathname();
  const isActive = useActive();
  const [open, setOpen] = useState(false);
  const menuBtn = useRef<HTMLButtonElement>(null);
  const close = useCallback(() => {
    setOpen(false);
    menuBtn.current?.focus();
  }, []);
  useEffect(() => setOpen(false), [path]);

  return (
    <>
      {links.length > 0 && (
        <nav aria-label="Main" className="hidden items-center gap-6 lg:flex xl:gap-7">
          {links.map((l) =>
            l.children?.length ? (
              <Dropdown key={l.id} item={l} active={isActive(l)} />
            ) : (
              <Link
                key={l.id}
                href={l.href}
                {...linkProps(l)}
                aria-current={isActive(l) ? "page" : undefined}
                className={`relative py-2 text-[15px] font-semibold transition hover:text-line ${isActive(l) ? "text-line after:absolute after:inset-x-0 after:-bottom-[18px] after:h-0.5 after:bg-line" : "text-white/85"}`}
              >
                {l.label}
              </Link>
            ),
          )}
        </nav>
      )}

      <div className="flex items-center gap-3 sm:gap-4">
        {phone && (
          <a href={phoneHref} className="hidden items-center gap-2 text-[15px] font-semibold text-white hover:text-line xl:inline-flex">
            <PhoneIcon />
            {phone}
          </a>
        )}
        {ctaLabel && (
          <Link href={ctaHref} className="hidden rounded-full bg-brand px-5 py-2.5 text-sm font-bold text-asphalt shadow-[0_8px_20px_-8px_rgba(255,187,0,0.8)] transition hover:bg-brand-hover sm:inline-flex">
            {ctaLabel}
          </Link>
        )}
        {(links.length > 0 || phone || ctaLabel) && (
          <button
            ref={menuBtn}
            type="button"
            onClick={() => setOpen(true)}
            aria-expanded={open}
            aria-controls="mobile-menu"
            aria-label="Open menu"
            className="grid h-10 w-10 place-items-center rounded-lg border border-white/20 text-white lg:hidden"
          >
            <svg aria-hidden width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><path d="M4 7h16M4 12h16M4 17h16" /></svg>
          </button>
        )}
      </div>

      <Drawer {...props} open={open} onClose={close} isActive={isActive} />
    </>
  );
}
