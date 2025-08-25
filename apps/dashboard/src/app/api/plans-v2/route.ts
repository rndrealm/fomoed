import type { DynamicPlanDataMap } from "@/lib/plans/plans.types";
import { getDynamicPlanDataMap } from "@/lib/plans";

export interface PlansV2Response {
  success: boolean;
  data: DynamicPlanDataMap;
}

export async function GET() {
  return Response.json({ data: await getDynamicPlanDataMap() });
}
