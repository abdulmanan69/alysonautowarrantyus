"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Icon } from "@/components/Icons";
import { POPULAR_MAKES, vehicleYears } from "@/lib/vehicles";
import { quickQuoteSchema, type QuickQuoteValues } from "@/lib/validation";
import { readTracking } from "./TrackingCapture";
import { TrustedForm } from "./TrustedForm";

type Props = { consentText: string; consentVersion: string };

/** Short quote form in the homepage hero: car, name, email, phone, ZIP and consent. */
export function HeroQuoteForm({ consentText, consentVersion }: Props) {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState("");
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<QuickQuoteValues>({ resolver: zodResolver(quickQuoteSchema), mode: "onTouched" });

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

  async function onSubmit(form: QuickQuoteValues) {
    setSubmitting(true);
    setServerError("");
    const cert = formRef.current?.querySelector<HTMLInputElement>('input[name="xxTrustedFormCertUrl"]')?.value ?? "";
    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          kind: "quick",
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
      const w = window as unknown as { gtag?: (...a: unknown[]) => void; fbq?: (...a: unknown[]) => void; dataLayer?: unknown[] };
      w.gtag?.("event", "generate_lead", { currency: "USD", value: 0, product: "vehicle_service_contract", form: "hero" });
      w.fbq?.("track", "Lead", { content_category: "vehicle_service_contract" });
      w.dataLayer?.push({ event: "quote_submitted", form: "hero" });
      router.push(`/quote/thank-you/${data.id}`);
    } catch (err) {
      setServerError(err instanceof Error ? `${err.message}. Check your answers and try again.` : "We couldn't send your details. Try again.");
      setSubmitting(false);
    }
  }

  const aria = (k: keyof QuickQuoteValues) => ({ id: `hq-${k}`, "aria-invalid": !!errors[k], "aria-describedby": errors[k] ? `hq-${k}-error` : undefined });
  const err = (k: keyof QuickQuoteValues) => (errors[k] ? <p id={`hq-${k}-error`} className="error">{errors[k]?.message as string}</p> : null);
  const field = "input h-11 text-[14px]";

  return (
    <form ref={formRef} onSubmit={handleSubmit(onSubmit)} noValidate className="rounded-3xl bg-white p-6 text-asphalt shadow-[0_30px_80px_-30px_rgba(0,0,0,0.6)] sm:p-7">
      <TrustedForm />
      <div aria-hidden="true" className="absolute -left-[9999px] h-px w-px overflow-hidden">
        <label htmlFor="hq-website">Website</label>
        <input id="hq-website" name="website" type="text" tabIndex={-1} autoComplete="off" defaultValue="" />
      </div>
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-lg font-extrabold leading-tight">Get your free quote</p>
          <p className="mt-0.5 text-sm text-road">Takes about a minute. No obligation.</p>
        </div>
        <span aria-hidden className="grid h-11 w-11 place-items-center rounded-2xl bg-brand text-asphalt"><Icon name="car" size={22} /></span>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-3">
        <div>
          <label className="label" htmlFor="hq-vehicleYear">Year</label>
          <select className={field} {...aria("vehicleYear")} {...register("vehicleYear", { onChange: () => setValue("vehicleModel", "") })}>
            <option value="">Year</option>
            {vehicleYears().map((y) => <option key={y}>{y}</option>)}
          </select>
          {err("vehicleYear")}
        </div>
        <div>
          <label className="label" htmlFor="hq-vehicleMake">Make</label>
          <select className={field} {...aria("vehicleMake")} {...register("vehicleMake", { onChange: () => setValue("vehicleModel", "") })}>
            <option value="">Make</option>
            {POPULAR_MAKES.map((m) => <option key={m}>{m}</option>)}
          </select>
          {err("vehicleMake")}
        </div>
        <div>
          <label className="label" htmlFor="hq-vehicleModel">Model</label>
          {modelsState === "ready" ? (
            <select className={field} {...aria("vehicleModel")} {...register("vehicleModel")}>
              <option value="">Model</option>
              {models.map((m) => <option key={m}>{m}</option>)}
            </select>
          ) : (
            <input className={field} placeholder={modelsState === "loading" ? "Loading…" : "Model"} disabled={!year || !make || modelsState === "loading"} {...aria("vehicleModel")} {...register("vehicleModel")} />
          )}
          {err("vehicleModel")}
        </div>
      </div>

      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        <div>
          <label className="label" htmlFor="hq-name">Full name</label>
          <input className={field} autoComplete="name" placeholder="Your name" {...aria("name")} {...register("name")} />
          {err("name")}
        </div>
        <div>
          <label className="label" htmlFor="hq-email">Email</label>
          <input type="email" className={field} autoComplete="email" placeholder="you@example.com" {...aria("email")} {...register("email")} />
          {err("email")}
        </div>
        <div>
          <label className="label" htmlFor="hq-phone">Phone</label>
          <input type="tel" className={field} autoComplete="tel-national" placeholder="(555) 555-5555" {...aria("phone")} {...register("phone")} />
          {err("phone")}
        </div>
        <div>
          <label className="label" htmlFor="hq-zip">ZIP code</label>
          <input className={field} inputMode="numeric" maxLength={5} autoComplete="postal-code" placeholder="77407" {...aria("zip")} {...register("zip")} />
          {err("zip")}
        </div>
      </div>

      <label className="mt-4 flex cursor-pointer items-start gap-3 rounded-lg border border-rail bg-mist/60 p-3 text-[12px] leading-relaxed text-road has-[:checked]:border-brand">
        <input type="checkbox" className="mt-0.5 h-4 w-4 shrink-0 cursor-pointer rounded accent-brand" {...aria("consent")} {...register("consent")} />
        <span>{consentText}</span>
      </label>
      {err("consent")}

      {serverError && <p role="alert" className="mt-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-700">{serverError}</p>}

      <button type="submit" disabled={submitting} className="btn-primary mt-4 w-full">
        {submitting ? "Sending…" : "Get my free quote"}
        {!submitting && <Icon name="arrow" size={18} strokeWidth={2.4} />}
      </button>
      <p className="mt-3 text-center text-xs text-road">Free quote · 30-day money-back guarantee · Your details stay private</p>
    </form>
  );
}
