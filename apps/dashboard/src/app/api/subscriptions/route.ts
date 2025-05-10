import stripe from "@/lib/utils/stripe";
import { createSupabaseServerClient } from "@/lib/utils/supabase/server-client";

import { NextResponse } from "next/server";

const plansIdMap = {
  pro: "prod_QuL2KcFQNsFWb1",
  plus: "prod_Q4NT6y9VdwZlKo",
};

const fetchUserPlans = async () => {
  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Please login.");
  }
  // For some reason, on stripe there are multiple customers with the same email
  // Here we are searching for all customers with the email and retrieving all their subscriptions

  const user_customers = await stripe.customers.search({
    query: `email:"${user.email}"`,
  });

  const user_subscriptions = [];

  for (const customer of user_customers.data) {
    const customer_subs = await stripe.subscriptions.list({
      customer: customer.id,
    });

    user_subscriptions.push(...customer_subs.data);
  }

  const active_subs = user_subscriptions.filter(
    (sub) => sub.status === "active" || sub.status === "trialing"
  );

  let planType: "FREE" | "PRO" | "PLUS" = "FREE";

  for (const sub of active_subs) {
    const subProductId = sub.items.data?.[0]?.plan?.product;
    if (subProductId === plansIdMap.pro) {
      planType = "PRO";
      break;
    }
    if (subProductId === plansIdMap.plus) {
      planType = "PLUS";
      break;
    }
  }

  return {
    subscriptions: active_subs,
    hasPlan: active_subs.length > 0,
    hasTrial:
      active_subs.find((sub) => sub.status === "trialing") !== undefined,
    planType,
  };
};

//! REQUEST HANDLER FOR /api/subscriptions
export async function GET() {
  try {
    const data = await fetchUserPlans();

    return NextResponse.json({ success: "true", data });
  } catch (error) {
    // Handle errors gracefully
    console.error("Error fetching subsriptions data:", error);
    return NextResponse.json(
      { error: "Failed to fetch subsriptions data" },
      { status: 500 }
    );
  }
}
