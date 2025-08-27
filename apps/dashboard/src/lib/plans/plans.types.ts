export const planTypes = ["basic", "pro", "plus"] as const;
export const priceLookupKeys = [
  "pro_monthly",
  "pro_yearly",
  "plus_monthly",
  "plus_yearly",
] as const;

export type PriceLookupKey = (typeof priceLookupKeys)[number];
export type PlanType = (typeof planTypes)[number];
export type BillingPeriod = "monthly" | "yearly";

export type DynamicPlanData = {
  price: string;
  planType: PlanType;
  priceId: string;
};

export type DynamicPlanDataMap = Record<PriceLookupKey, DynamicPlanData>;
