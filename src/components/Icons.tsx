import type { SVGProps } from "react";

// Small inline icon set (24×24 stroke icons). `name` picks the drawing; size and colour come from props/CSS.
const PATHS = {
  phone: "M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.4 1.8.7 2.7a2 2 0 0 1-.5 2.1L8 9.8a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.7.7a2 2 0 0 1 1.7 2z",
  mail: "M4 5h16a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1zm0 2 8 6 8-6",
  pin: "M12 21s-7-6.2-7-11a7 7 0 0 1 14 0c0 4.8-7 11-7 11zM12 12.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5z",
  clock: "M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM12 7v5l3 2",
  check: "m5 12 5 5 9-10",
  checkCircle: "M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zm-3.5-9 2.5 2.5 5-5",
  shield: "M12 3 4 6v6c0 4.5 3.4 8.2 8 9 4.6-.8 8-4.5 8-9V6l-8-3zM9 12l2 2 4-4",
  star: "M12 2.5l2.9 6 6.6.9-4.8 4.6 1.2 6.5L12 17.4l-5.9 3.1 1.2-6.5L2.5 9.4l6.6-.9z",
  engine: "M3 10h2v5H3zM19 10h2v5h-2zM7 8h3V6h4v2h3a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2h-3l-2 2h-2l-2-2H7a2 2 0 0 1-2-2v-6a2 2 0 0 1 2-2zM9 12h6",
  wrench: "M14.7 6.3a4 4 0 0 0 5 5L22 9l-3-3-2.3 2.3zm0 0L4 17a2 2 0 0 0 3 3l10.7-10.7",
  car: "M5 16h14M3 12l2-5a2 2 0 0 1 2-1h10a2 2 0 0 1 2 1l2 5v5H3zM7 16.5a1.5 1.5 0 1 0 0 .01M17 16.5a1.5 1.5 0 1 0 0 .01",
  tow: "M2 17h3M9 17h6M19 17h3M4 17V9h8l4 4v4M7 13h4M20 13v4M5 19.5a1.5 1.5 0 1 0 0 .01M17 19.5a1.5 1.5 0 1 0 0 .01",
  headset: "M4 14v-3a8 8 0 0 1 16 0v3M4 14a2 2 0 0 0 2 2h1v-5H6a2 2 0 0 0-2 2zm16 0a2 2 0 0 1-2 2h-1v-5h1a2 2 0 0 1 2 2zm-4 5a3 3 0 0 1-3 3",
  dollar: "M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6",
  badge: "M12 15a5 5 0 1 0 0-10 5 5 0 0 0 0 10zm-3.5 2.5L7 22l5-2.5L17 22l-1.5-4.5",
  users: "M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8m13 10v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75",
  arrow: "M5 12h14m-6-6 6 6-6 6",
  arrowLeft: "M19 12H5m6-6-6 6 6 6",
  chevron: "m6 9 6 6 6-6",
  menu: "M4 7h16M4 12h16M4 17h16",
  close: "M6 6l12 12M18 6 6 18",
  refund: "M3 12a9 9 0 1 0 3-6.7M3 4v5h5M12 8v4l3 2",
  percent: "M19 5 5 19M7.5 9a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3zm9 9a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3z",
  file: "M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9zM14 3v6h6M8 13h8M8 17h5",
  sparkle: "M12 3v4m0 10v4M3 12h4m10 0h4M6 6l2.5 2.5m7 7L18 18M6 18l2.5-2.5m7-7L18 6",
  info: "M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zm0-9v5m0-9h.01",
  quote: "M7 7H4v6h3l-1 4M17 7h-3v6h3l-1 4",
  globe: "M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18",
} as const;

export type IconName = keyof typeof PATHS;

export function Icon({ name, size = 20, strokeWidth = 2, ...rest }: { name: IconName; size?: number; strokeWidth?: number } & SVGProps<SVGSVGElement>) {
  return (
    <svg aria-hidden width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" {...rest}>
      <path d={PATHS[name]} />
    </svg>
  );
}

const SOCIAL = {
  facebook: "M15 3h-2a4 4 0 0 0-4 4v3H7v4h2v7h4v-7h3l1-4h-4V7a1 1 0 0 1 1-1h2z",
  instagram: "M7 3h10a4 4 0 0 1 4 4v10a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V7a4 4 0 0 1 4-4zm5 5.5a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7zM17.5 6.5h.01",
  linkedin: "M4 9h4v11H4zM6 4a2 2 0 1 1 0 4 2 2 0 0 1 0-4zM10 9h4v1.5c.6-1 1.9-1.8 3.5-1.8 3 0 3.5 2 3.5 4.6V20h-4v-5.8c0-1.4 0-3-1.9-3s-2.1 1.4-2.1 2.9V20h-4z",
  x: "M4 4l16 16M20 4 4 20",
  youtube: "M22 8.5a3 3 0 0 0-2-2C18.2 6 12 6 12 6s-6.2 0-8 .5a3 3 0 0 0-2 2A31 31 0 0 0 1.5 12 31 31 0 0 0 2 15.5a3 3 0 0 0 2 2c1.8.5 8 .5 8 .5s6.2 0 8-.5a3 3 0 0 0 2-2 31 31 0 0 0 .5-3.5 31 31 0 0 0-.5-3.5zM10 15V9l5 3z",
} as const;
export type SocialName = keyof typeof SOCIAL;
export const SOCIAL_LABELS: Record<SocialName, string> = { facebook: "Facebook", instagram: "Instagram", linkedin: "LinkedIn", x: "X", youtube: "YouTube" };

export function SocialIcon({ name, size = 18 }: { name: SocialName; size?: number }) {
  return (
    <svg aria-hidden width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
      <path d={SOCIAL[name]} />
    </svg>
  );
}

/** Round yellow badge with an icon inside; used on cards and lists. */
export function IconBadge({ name, size = 48, tone = "brand" }: { name: IconName; size?: number; tone?: "brand" | "dark" | "soft" }) {
  const cls = tone === "dark" ? "bg-asphalt text-line" : tone === "soft" ? "bg-brand-soft text-brand-deep" : "bg-brand text-asphalt";
  return (
    <span aria-hidden className={`grid shrink-0 place-items-center rounded-2xl ${cls}`} style={{ width: size, height: size }}>
      <Icon name={name} size={Math.round(size * 0.5)} />
    </span>
  );
}
