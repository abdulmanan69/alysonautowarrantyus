"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, type UseFormRegisterReturn } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Icon } from "@/components/Icons";
import { TrustBadges } from "@/components/TrustBadges";
import { PLAN_INTEREST, VSC_DISCLOSURE } from "@/lib/products";
import { STATES, stateFromZip } from "@/lib/states";
import { POPULAR_MAKES, vehicleYears } from "@/lib/vehicles";
import { QUOTE_STEP_FIELDS, VSC_MILEAGE, quoteFormSchema, type QuoteFormValues, type QuoteStepKey } from "@/lib/validation";
import { readTracking } from "./TrackingCapture";
import { TrustedForm } from "./TrustedForm";

// Four-step quote form: vehicle, coverage, location, contact. It ends on /quote/thank-you/[id];
// the team calls with plan options and prices.
const STEPS: { key: QuoteStepKey; label: string; title: string; subtitle: string }[] = [
  { key: "vehicle", label: "Vehicle", title: "Tell us about your car", subtitle: "Your car and its mileage decide which plans it qualifies for and what they cost." },
  { key: "coverage", label: "Coverage", title: "How much protection do you want?", subtitle: "Not sure? Choose “Not sure yet” and we'll walk you through every plan your car qualifies for." },
  { key: "location", label: "Location", title: "Where is the car kept?", subtitle: "Plans and prices vary by state, so we need your ZIP code." },
  { key: "contact", label: "Contact", title: "How can we reach you?", subtitle: "A member of our team will contact you soon with plan options and prices for your car." },
];

const MILEAGE_LABEL = (m: string, i: number) => {
  const n = Number(m) / 1000;
  const prev = i === 0 ? 0 : Number(VSC_MILEAGE[i - 1]) / 1000;
  if (i === VSC_MILEAGE.length - 1) return `${prev},000 or more miles`;
  return prev ? `${prev},000 to ${n},000 miles` : `Under ${n},000 miles`;
};

const PLAN_OPTIONS: [string, string][] = [
  ["platinum", "Platinum Protection: Nearly every part and system, like the factory warranty"],
  ["gold", "Gold Protection: Major systems listed part by part, with optional add-ons"],
  ["powertrain", "Powertrain Protection: Engine, transmission and drivetrain, up to 200,000 miles"],
  ["not_sure", "Not sure yet: Show me every plan my car qualifies for"],
];

const DRAFT_KEY = "aaw_quote";

// Anonymous drop-off tracking for the admin Reports page: a random per-tab ID and a step number.
function trackStep(step: number) {
  try {
    let sid = sessionStorage.getItem("aaw_funnel");
    if (!sid) {
      sid = crypto.randomUUID();
      sessionStorage.setItem("aaw_funnel", sid);
    }
    const body = new Blob([JSON.stringify({ sid, step })], { type: "application/json" });
    if (!navigator.sendBeacon?.("/api/funnel", body)) fetch("/api/funnel", { method: "POST", body, keepalive: true }).catch(() => {});
  } catch {
    // Tracking must never get in the way of the form.
  }
}

export type QuoteInitial = Partial<Pick<QuoteFormValues, "vehicleYear" | "vehicleMake" | "vehicleModel" | "zip" | "planInterest">>;
type Props = { initial?: QuoteInitial; consentText: string; consentVersion: string; phone: string; phoneHref: string };

export function QuoteForm({ initial = {}, consentText, consentVersion, phone, phoneHref }: Props) {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState("");

  const {
    register,
    handleSubmit,
    trigger,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<QuoteFormValues>({
    resolver: zodResolver(quoteFormSchema),
    mode: "onTouched",
    defaultValues: { ...initial, state: initial.zip ? (stateFromZip(initial.zip) ?? "") : "" } as Partial<QuoteFormValues>,
  });

  // Restore an unfinished form (never restores consent). Values from the link win.
  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(DRAFT_KEY) || "null");
      if (saved?.values) {
        reset({ ...saved.values, ...initial, consent: undefined });
        if (typeof saved.step === "number" && !Object.keys(initial).length) setStep(Math.min(saved.step, STEPS.length - 1));
      }
    } catch {}
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reset]);

  const values = watch();
  useEffect(() => {
    try {
      const { consent: _c, ...rest } = values;
      localStorage.setItem(DRAFT_KEY, JSON.stringify({ values: rest, step }));
    } catch {}
  }, [values, step]);

  // Keep state in sync with ZIP.
  const zip = watch("zip");
  useEffect(() => {
    const s = stateFromZip(zip ?? "");
    if (s) setValue("state", s, { shouldValidate: true });
  }, [zip, setValue]);

  // Load models from NHTSA when year + make are chosen.
  const year = watch("vehicleYear");
  const make = watch("vehicleMake");
  const [models, setModels] = useState<string[]>([]);
  const [modelsState, setModelsState] = useState<"idle" | "loading" | "ready" | "failed">("idle");
  useEffect(() => {
    if (!year || !make) return;
    let cancelled = false;
    setModelsState("loading");
    fetch(`/api/vehicles?type=models&year=${year}&make=${encodeURIComponent(make)}`)
      .then((r) => r.json())
      .then((d) => {
        if (cancelled) return;
        setModels(d.items ?? []);
        setModelsState(d.items?.length ? "ready" : "failed");
      })
      .catch(() => !cancelled && setModelsState("failed"));
    return () => {
      cancelled = true;
    };
  }, [year, make]);

  useEffect(() => trackStep(step), [step]);

  const current = STEPS[step];
  const isLast = step === STEPS.length - 1;

  async function next() {
    const ok = await trigger(QUOTE_STEP_FIELDS[current.key] as unknown as (keyof QuoteFormValues)[], { shouldFocus: true });
    if (ok) {
      setStep((s) => s + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }

  async function onSubmit(form: QuoteFormValues) {
    setSubmitting(true);
    setServerError("");
    const cert = formRef.current?.querySelector<HTMLInputElement>('input[name="xxTrustedFormCertUrl"]')?.value ?? "";
    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          kind: "quote",
          form,
          tracking: readTracking(),
          trustedFormCertUrl: cert,
          website: formRef.current?.querySelector<HTMLInputElement>('input[name="website"]')?.value ?? "",
          pageUrl: window.location.href,
          consentVersion,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Something went wrong");
      localStorage.removeItem(DRAFT_KEY);
      trackStep(STEPS.length);
      // Conversion events for whichever tools are enabled in /admin/settings.
      const w = window as unknown as { gtag?: (...a: unknown[]) => void; fbq?: (...a: unknown[]) => void; dataLayer?: unknown[] };
      w.gtag?.("event", "generate_lead", { currency: "USD", value: 0, product: "vehicle_service_contract", form: "quote" });
      w.fbq?.("track", "Lead", { content_category: "vehicle_service_contract" });
      w.dataLayer?.push({ event: "quote_submitted", form: "quote" });
      router.push(`/quote/thank-you/${data.id}`);
    } catch (err) {
      setServerError(err instanceof Error ? `${err.message}. Check your answers and try again.` : "We couldn't send your answers. Try again.");
      setSubmitting(false);
    }
  }

  const err = (k: keyof QuoteFormValues) => (errors[k] ? <p id={`${k}-error`} className="error">{errors[k]?.message as string}</p> : null);
  const aria = (k: keyof QuoteFormValues) => ({
    id: k,
    "aria-invalid": !!errors[k],
    "aria-required": true,
    "aria-describedby": [errors[k] && `${k}-error`, k === "consent" && "consent-text"].filter(Boolean).join(" ") || undefined,
  });

  if (submitting) {
    return (
      <div className="mx-auto max-w-xl rounded-3xl border border-rail bg-white px-6 py-16 text-center shadow-lift" role="status" aria-live="polite">
        <span aria-hidden className="mx-auto block h-14 w-14 animate-spin rounded-full border-4 border-brand/20 border-t-brand" />
        <h2 className="mt-8 text-2xl font-bold">Sending your details</h2>
        <p className="mt-2 text-road">This usually takes a few seconds. Please don&apos;t close this page.</p>
      </div>
    );
  }

  const progress = Math.round(((step + 1) / STEPS.length) * 100);

  return (
    <form ref={formRef} onSubmit={handleSubmit(onSubmit)} noValidate className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_320px] lg:gap-8">
      <TrustedForm />
      {/* Bot trap: hidden from people and screen readers, so only bots fill it in. */}
      <div aria-hidden="true" className="absolute -left-[9999px] h-px w-px overflow-hidden">
        <label htmlFor="website">Website</label>
        <input id="website" name="website" type="text" tabIndex={-1} autoComplete="off" defaultValue="" />
      </div>

      <div className="overflow-hidden rounded-3xl border border-rail bg-white shadow-lift">
        <div className="border-b border-rail px-6 pb-5 pt-6 sm:px-10">
          <div className="flex items-center justify-between text-sm">
            <span className="font-bold text-asphalt">
              Step {step + 1} of {STEPS.length}
              <span className="font-medium text-road"> · {current.label}</span>
            </span>
            <span className="font-medium text-road">{progress}% complete</span>
          </div>
          <div className="mt-3 h-2 overflow-hidden rounded-full bg-mist" role="progressbar" aria-label="Quote progress" aria-valuemin={0} aria-valuemax={100} aria-valuenow={progress}>
            <div className="h-full rounded-full bg-brand transition-[width] duration-500 ease-out" style={{ width: `${progress}%` }} />
          </div>
        </div>

        <div key={step} className="step-in px-6 py-8 sm:px-10 sm:py-10">
          <h1 className="text-2xl font-extrabold leading-tight sm:text-[1.9rem]">{current.title}</h1>
          <p className="mt-2 max-w-xl leading-relaxed text-road">{current.subtitle}</p>

          <div className="mt-8 space-y-6">
            {current.key === "vehicle" && (
              <>
                <div className="grid gap-6 sm:grid-cols-3">
                  <div>
                    <label className="label" htmlFor="vehicleYear">Year</label>
                    <select className="input" {...aria("vehicleYear")} {...register("vehicleYear", { onChange: () => setValue("vehicleModel", "") })}>
                      <option value="">Choose year</option>
                      {vehicleYears().map((y) => <option key={y}>{y}</option>)}
                    </select>
                    {err("vehicleYear")}
                  </div>
                  <div>
                    <label className="label" htmlFor="vehicleMake">Make</label>
                    <select className="input" {...aria("vehicleMake")} {...register("vehicleMake", { onChange: () => setValue("vehicleModel", "") })}>
                      <option value="">Choose make</option>
                      {POPULAR_MAKES.map((m) => <option key={m}>{m}</option>)}
                    </select>
                    {err("vehicleMake")}
                  </div>
                  <div>
                    <label className="label" htmlFor="vehicleModel">Model</label>
                    {modelsState === "ready" ? (
                      <select className="input" {...aria("vehicleModel")} {...register("vehicleModel")}>
                        <option value="">Choose model</option>
                        {models.map((m) => <option key={m}>{m}</option>)}
                      </select>
                    ) : (
                      <input
                        className="input"
                        placeholder={modelsState === "loading" ? "Loading models…" : year && make ? "Type the model" : "Pick year & make"}
                        disabled={!year || !make || modelsState === "loading"}
                        {...aria("vehicleModel")}
                        {...register("vehicleModel")}
                      />
                    )}
                    {err("vehicleModel")}
                  </div>
                </div>
                <div>
                  <label className="label" htmlFor="mileage">Current mileage (on the odometer)</label>
                  <select className="input" {...aria("mileage")} {...register("mileage")}>
                    <option value="">Choose one</option>
                    {VSC_MILEAGE.map((m, i) => <option key={m} value={m}>{MILEAGE_LABEL(m, i)}</option>)}
                  </select>
                  {err("mileage")}
                </div>
                <ChoiceGroup label="Do you own, finance or lease it?" name="ownership" error={errors.ownership?.message} options={[["own", "Own"], ["finance", "Finance"], ["lease", "Lease"]]} reg={register("ownership")} cols={3} />
              </>
            )}

            {current.key === "coverage" && (
              <>
                <ChoiceGroup label="Is the car still under its factory warranty?" name="factoryWarranty" error={errors.factoryWarranty?.message} options={[["yes", "Yes"], ["no", "No, it has ended"], ["not_sure", "Not sure"]]} reg={register("factoryWarranty")} cols={3} />
                <ChoiceGroup label="Which plan are you most interested in?" name="planInterest" error={errors.planInterest?.message} options={PLAN_OPTIONS.filter(([v]) => (PLAN_INTEREST as readonly string[]).includes(v))} reg={register("planInterest")} />
              </>
            )}

            {current.key === "location" && (
              <div className="grid gap-6 sm:grid-cols-2">
                <div>
                  <label className="label" htmlFor="zip">ZIP code</label>
                  <input className="input" inputMode="numeric" maxLength={5} autoComplete="postal-code" placeholder="e.g. 77407" {...aria("zip")} {...register("zip")} />
                  {err("zip")}
                </div>
                <div>
                  <label className="label" htmlFor="state">State</label>
                  <select className="input" {...aria("state")} {...register("state")}>
                    <option value="">Choose a state</option>
                    {STATES.map((s) => <option key={s.code} value={s.code}>{s.name}</option>)}
                  </select>
                  {err("state")}
                </div>
              </div>
            )}

            {current.key === "contact" && (
              <>
                <div className="grid gap-6 sm:grid-cols-2">
                  <div>
                    <label className="label" htmlFor="firstName">First name</label>
                    <input className="input" autoComplete="given-name" {...aria("firstName")} {...register("firstName")} />
                    {err("firstName")}
                  </div>
                  <div>
                    <label className="label" htmlFor="lastName">Last name</label>
                    <input className="input" autoComplete="family-name" {...aria("lastName")} {...register("lastName")} />
                    {err("lastName")}
                  </div>
                  <div>
                    <label className="label" htmlFor="email">Email</label>
                    <input type="email" className="input" autoComplete="email" placeholder="you@example.com" {...aria("email")} {...register("email")} />
                    {err("email")}
                  </div>
                  <div>
                    <label className="label" htmlFor="phone">Phone</label>
                    <input type="tel" className="input" autoComplete="tel-national" placeholder="(555) 555-5555" {...aria("phone")} {...register("phone")} />
                    {err("phone")}
                  </div>
                </div>
                <div>
                  <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-rail bg-white p-4 text-sm leading-relaxed text-road transition hover:border-road/40 has-[:checked]:border-brand has-[:checked]:bg-brand/5">
                    <input type="checkbox" className="mt-0.5 h-5 w-5 shrink-0 cursor-pointer rounded accent-brand" {...aria("consent")} {...register("consent")} />
                    <span id="consent-text">{consentText}</span>
                  </label>
                  {err("consent")}
                </div>
              </>
            )}
          </div>

          {serverError && (
            <p className="mt-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700" role="alert">
              {serverError}
            </p>
          )}
          {isLast && <p className="mt-6 text-xs leading-relaxed text-road">{VSC_DISCLOSURE}</p>}
        </div>

        <div className="flex flex-col-reverse gap-3 border-t border-rail bg-white px-6 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-10">
          {step > 0 ? (
            <button type="button" className="btn-secondary" onClick={() => setStep((s) => s - 1)}>
              <Icon name="arrowLeft" size={18} strokeWidth={2.2} /> Back
            </button>
          ) : (
            <span className="hidden sm:block" />
          )}
          {isLast ? (
            <button key="submit" type="submit" className="btn-primary sm:min-w-52">
              Get my free quote <Icon name="arrow" size={18} strokeWidth={2.4} />
            </button>
          ) : (
            <button key="next" type="button" onClick={next} className="btn-primary sm:min-w-44">
              Continue <Icon name="arrow" size={18} strokeWidth={2.4} />
            </button>
          )}
        </div>
      </div>

      <aside className="space-y-5 lg:sticky lg:top-28">
        <div className="hidden rounded-3xl border border-rail bg-white p-6 lg:block">
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-road/70">Your quote</p>
          <ol className="mt-4">
            {STEPS.map((s, i) => {
              const done = i < step;
              const active = i === step;
              return (
                <li key={s.key} className="relative pb-5 pl-11 last:pb-0">
                  {i < STEPS.length - 1 && <span aria-hidden className={`absolute left-[13px] top-8 h-[calc(100%-2rem)] w-0.5 ${done ? "bg-brand" : "bg-rail"}`} />}
                  <span
                    aria-hidden
                    className={`absolute left-0 top-0 grid h-7 w-7 place-items-center rounded-full text-xs font-bold transition ${
                      done ? "bg-brand text-asphalt" : active ? "border-2 border-brand bg-white text-asphalt ring-4 ring-brand/20" : "border-2 border-rail bg-white text-road/60"
                    }`}
                  >
                    {done ? <Icon name="check" size={14} strokeWidth={3} /> : i + 1}
                  </span>
                  {done ? (
                    <button type="button" onClick={() => setStep(i)} className="pt-0.5 text-left text-[15px] font-medium text-asphalt hover:text-brand-deep">
                      {s.label}
                    </button>
                  ) : (
                    <span aria-current={active ? "step" : undefined} className={`block pt-0.5 text-[15px] ${active ? "font-semibold text-asphalt" : "text-road/70"}`}>
                      {s.label}
                    </span>
                  )}
                </li>
              );
            })}
          </ol>
        </div>

        <div className="rounded-3xl bg-ink p-6 text-white">
          <p className="text-lg font-bold">Prefer to talk to someone?</p>
          <p className="mt-1.5 text-sm leading-relaxed text-white/75">Our team can explain plan options and prices by phone, 24/7.</p>
          <a href={phoneHref} className="mt-4 inline-flex items-center gap-2 rounded-xl bg-brand px-4 py-2.5 font-bold text-asphalt transition hover:bg-brand-hover">
            <Icon name="phone" size={18} />
            {phone}
          </a>
        </div>

        <div className="rounded-3xl border border-rail bg-white p-6">
          <TrustBadges compact className="mb-5" />
          <ul className="space-y-3 text-sm text-road">
            {["Free quote, no obligation", "30-day money-back guarantee", "Repairs at any ASE-certified shop", "Real people to help you, 24/7"].map((t) => (
              <li key={t} className="flex items-center gap-3">
                <span aria-hidden className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-brand text-asphalt">
                  <Icon name="check" size={13} strokeWidth={3} />
                </span>
                {t}
              </li>
            ))}
          </ul>
        </div>
      </aside>
    </form>
  );
}

function ChoiceGroup({ label, name, options, reg, error, cols = 1 }: { label: string; name: string; options: [string, string][]; reg: UseFormRegisterReturn; error?: string; cols?: 1 | 2 | 3 | 4 }) {
  const grid = { 1: "grid gap-2.5", 2: "grid grid-cols-2 gap-2.5", 3: "grid gap-2.5 sm:grid-cols-3", 4: "grid grid-cols-2 gap-2.5 sm:grid-cols-4" }[cols];
  return (
    <fieldset aria-describedby={error ? `${name}-error` : undefined}>
      <legend className="label">{label}</legend>
      <div className={grid}>
        {options.map(([value, text]) => {
          // "Title: description" options show the description on its own line.
          const [title, detail] = text.split(": ");
          return (
            <label key={value} className="choice">
              <input type="radio" value={value} {...reg} />
              <span>
                <span className="block">{title}</span>
                {detail && <span className="mt-0.5 block text-sm font-normal text-road">{detail}</span>}
              </span>
            </label>
          );
        })}
      </div>
      {error && <p id={`${name}-error`} className="error">{error}</p>}
    </fieldset>
  );
}
