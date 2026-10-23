// The three promises the business makes on every page, with the badges from the original site.
// Media and award logos from the old site are not included until the client confirms them.

export const TRUST_BADGES = [
  { file: "money-back-30-day", title: "30-day money-back guarantee", body: "Cancel within 30 days of purchase for a full refund, no questions asked." },
  { file: "response-24-7-365", title: "24/7/365 response", body: "Roadside help and the claims line are open every hour of every day." },
  { file: "ase-certified", title: "ASE-certified repairs", body: "Take your car to any licensed shop with ASE-certified mechanics, including the dealer." },
] as const;

export function TrustBadges({ compact = false, className = "" }: { compact?: boolean; className?: string }) {
  if (compact) {
    return (
      <ul className={`flex items-center justify-center gap-5 ${className}`} aria-label="Our guarantees">
        {TRUST_BADGES.map((b) => (
          <li key={b.file} className="group relative">
            <img src={`/images/trust/${b.file}.webp`} alt={b.title} width={64} height={64} loading="lazy" className="h-16 w-16 object-contain transition duration-300 group-hover:-translate-y-1 group-hover:scale-110" />
          </li>
        ))}
      </ul>
    );
  }
  return (
    <ul className={`grid gap-4 sm:grid-cols-3 ${className}`} aria-label="Our guarantees">
      {TRUST_BADGES.map((b) => (
        <li key={b.file} className="group flex items-center gap-4 rounded-2xl border border-rail/70 bg-white p-4 transition hover:-translate-y-1 hover:border-brand hover:shadow-lift">
          <img src={`/images/trust/${b.file}.webp`} alt="" width={72} height={72} loading="lazy" className="h-[72px] w-[72px] shrink-0 object-contain transition duration-500 group-hover:rotate-[-6deg] group-hover:scale-110" />
          <div>
            <h3 className="font-extrabold leading-snug text-asphalt">{b.title}</h3>
            <p className="mt-1 text-sm leading-relaxed text-road">{b.body}</p>
          </div>
        </li>
      ))}
    </ul>
  );
}
