import { z } from "zod";
import { PLAN_INTEREST } from "./products";
import { STATE_CODES } from "./states";

const currentYear = new Date().getFullYear();

export const digitsOnly = (v: string) => v.replace(/\D/g, "");
const usPhone = (v: string) => /^[2-9]\d{2}[2-9]\d{6}$/.test(digitsOnly(v).replace(/^1(?=\d{10}$)/, ""));

// Mileage choices are the top of each range; the last one means "150,000 or more".
export const VSC_MILEAGE = ["25000", "50000", "75000", "100000", "125000", "150000", "200000"] as const;

const vehicleYear = z.string().refine((v) => {
  const n = Number(v);
  return Number.isInteger(n) && n >= 1981 && n <= currentYear + 1;
}, "Choose the vehicle year");

// ── Quote form (4 steps: vehicle, coverage, location, contact) ─────────────
// All form values are strings; the server converts them.
export const quoteFormSchema = z.object({
  // Step: vehicle
  vehicleYear,
  vehicleMake: z.string().min(1, "Choose the make").max(40),
  vehicleModel: z.string().trim().min(1, "Choose the model").max(80),
  mileage: z.enum(VSC_MILEAGE, { message: "Choose the mileage" }),
  ownership: z.enum(["own", "finance", "lease"], { message: "Choose one" }),

  // Step: coverage
  factoryWarranty: z.enum(["yes", "no", "not_sure"], { message: "Choose one" }),
  planInterest: z.enum(PLAN_INTEREST, { message: "Choose a plan, or “Not sure yet”" }),

  // Step: location
  zip: z.string().regex(/^\d{5}$/, "Enter a 5-digit ZIP code"),
  state: z.string().refine((v) => STATE_CODES.includes(v), "Choose your state"),

  // Step: contact
  firstName: z.string().trim().min(1, "Enter your first name").max(60),
  lastName: z.string().trim().min(1, "Enter your last name").max(60),
  email: z.string().trim().email("Enter a valid email").max(200),
  phone: z.string().refine(usPhone, "Enter a valid US phone number"),
  consent: z.literal(true, { errorMap: () => ({ message: "Please check the box to continue" }) }),
});
export type QuoteFormValues = z.infer<typeof quoteFormSchema>;

// Which fields belong to which step (used to validate one step at a time).
export const QUOTE_STEP_FIELDS = {
  vehicle: ["vehicleYear", "vehicleMake", "vehicleModel", "mileage", "ownership"],
  coverage: ["factoryWarranty", "planInterest"],
  location: ["zip", "state"],
  contact: ["firstName", "lastName", "email", "phone", "consent"],
} as const satisfies Record<string, readonly (keyof QuoteFormValues)[]>;
export type QuoteStepKey = keyof typeof QUOTE_STEP_FIELDS;

// ── Short form on the homepage hero ────────────────────────────────────────
export const quickQuoteSchema = z.object({
  vehicleYear,
  vehicleMake: z.string().min(1, "Choose the make").max(40),
  vehicleModel: z.string().trim().min(1, "Enter the model").max(80),
  name: z.string().trim().min(2, "Enter your full name").max(120),
  email: z.string().trim().email("Enter a valid email").max(200),
  phone: z.string().refine(usPhone, "Enter a valid US phone number"),
  zip: z.string().regex(/^\d{5}$/, "Enter a 5-digit ZIP code"),
  consent: z.literal(true, { errorMap: () => ({ message: "Please check the box to continue" }) }),
});
export type QuickQuoteValues = z.infer<typeof quickQuoteSchema>;

export const trackingSchema = z
  .object({
    utmSource: z.string().max(200).optional(),
    utmMedium: z.string().max(200).optional(),
    utmCampaign: z.string().max(200).optional(),
    utmTerm: z.string().max(200).optional(),
    utmContent: z.string().max(200).optional(),
    gclid: z.string().max(300).optional(),
    fbclid: z.string().max(300).optional(),
    landingPage: z.string().max(500).optional(),
    referrer: z.string().max(500).optional(),
  })
  .partial();

const envelope = {
  tracking: trackingSchema.optional().default({}),
  trustedFormCertUrl: z.string().url().max(300).optional().or(z.literal("")),
  pageUrl: z.string().max(500),
  consentVersion: z.string().max(60),
  website: z.string().max(200).optional(), // honeypot, must stay empty
};

export const leadSubmissionSchema = z.object({ kind: z.literal("quote").optional().default("quote"), form: quoteFormSchema, ...envelope });
export const quickSubmissionSchema = z.object({ kind: z.literal("quick"), form: quickQuoteSchema, ...envelope });

// ── Contact form ───────────────────────────────────────────────────────────
export const contactSchema = z.object({
  name: z.string().trim().min(2, "Enter your name").max(120),
  email: z.string().trim().email("Enter a valid email").max(200),
  phone: z.string().trim().max(30).optional().default(""),
  subject: z.string().trim().max(120).optional().default(""),
  message: z.string().trim().min(10, "Tell us a little more (at least 10 characters)").max(4000),
  website: z.string().max(200).optional(), // honeypot
  pageUrl: z.string().max(500).optional().default(""),
});
export type ContactValues = z.infer<typeof contactSchema>;
