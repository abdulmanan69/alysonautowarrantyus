// The site sells vehicle service contracts (extended auto warranties). A vehicle service
// contract is NOT insurance, so public copy never uses insurance words (policy, premium, insurer).

/** Shown next to every service contract offer. */
export const VSC_DISCLOSURE =
  "A vehicle service contract is not insurance. It's an optional contract that pays for repairs to the parts it lists, subject to its terms, exclusions and deductible.";

/** Plan the visitor is most interested in (quote form). Keys match Plan.slug for the coverage plans. */
export const PLAN_INTEREST = ["platinum", "gold", "powertrain", "not_sure"] as const;
export type PlanInterest = (typeof PLAN_INTEREST)[number];

export const PLAN_INTEREST_LABELS: Record<PlanInterest, string> = {
  platinum: "Platinum Protection",
  gold: "Gold Protection",
  powertrain: "Powertrain Protection",
  not_sure: "Not sure yet",
};

export const planInterestLabel = (v: string) => PLAN_INTEREST_LABELS[v as PlanInterest] ?? "Not sure yet";
