import getStripe from "../utils/stripe";
import {
  DynamicPlanData,
  DynamicPlanDataMap,
  PlanType,
  PriceLookupKey,
  priceLookupKeys,
} from "./plans.types";

export async function getDynamicPlanDataMap(): Promise<DynamicPlanDataMap> {
  const stripe = getStripe()
  const prices = await stripe.prices.list({ active: true });

  const dynamicPlanDatas: Record<PriceLookupKey, DynamicPlanData> = {} as any;

  for (const price of prices.data) {
    const planId = price.metadata.plan_id;

    if (!planId) {
      console.warn(
        "No plan_id found for price, check stripe if plan_id is correctly set on price metadata in stripe.",
        price.id,
      );
      continue;
    }

    if (!priceLookupKeys.includes(planId as any)) {
      console.warn(
        "Unknown plan_id found for price, check stripe if plan_id is correctly set on price metadata in stripe.",
        price.id,
      );
      continue;
    }

    const priceUsd = (price.unit_amount || 0) / 100;

    dynamicPlanDatas[planId as PriceLookupKey] = {
      price: "$" + priceUsd.toFixed(2),
      planType: planId.split("_")[0] as PlanType,
      priceId: price.id,
    };
  }

  return dynamicPlanDatas as DynamicPlanDataMap;
}
