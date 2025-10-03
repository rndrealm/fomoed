"use server";

import { createSupabaseServerClient, createSupabaseServiceClient } from "@/lib/utils/supabase/server-client";
import { GenerateReferralCodeResponse } from "./types";
import { revalidatePath } from "next/cache";
import { customAlphabet } from "nanoid";

const ALPHANUMERIC_CHARS = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const generateRandomPart = customAlphabet(ALPHANUMERIC_CHARS, 10);

export async function generateUserReferralCode(): Promise<GenerateReferralCodeResponse> {
  const supabase = await createSupabaseServerClient();

  try {
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return {
        success: false,
        message: "You must be logged in to generate a referral code.",
      };
    }

    const { data: userProfile, error: profileError } = await supabase
      .from("users")
      .select("referral_code")
      .eq("user_id", user.id)
      .single();

    if (profileError) {
      return {
        success: false,
        message: profileError.message || "Failed to retrieve user profile.",
      };
    }

    if (userProfile.referral_code) {
      return {
        success: true,
        message: "Referral code already exists.",
        code: userProfile.referral_code,
      };
    }

    let newCode: string | null = null;
    let isCodeUnique = false;
    let attempts = 0;
    const maxAttempts = 5;

    while (!isCodeUnique && attempts < maxAttempts) {
      attempts++;
      const randomPart = await generateRandomPart();
      const candidateCode = `U${randomPart}`;

      const { data, error } = await supabase
        .from("users")
        .select("user_id")
        .eq("referral_code", candidateCode)
        .limit(1)
        .single();

      if (error && error.code !== "PGRST116") {
        console.error("DB error checking for referral code uniqueness:", error);
        break;
      }

      if (!data) {
        isCodeUnique = true;
        newCode = candidateCode;
      }
    }

    if (!newCode) {
      return {
        success: false,
        message: "Could not generate a unique referral code. Please try again later.",
      };
    }

    const { error: updateError } = await supabase
      .from("users")
      .update({ referral_code: newCode })
      .eq("user_id", user.id);

    if (updateError) {
      return {
        success: false,
        message: updateError.message || "Failed to save referral code.",
      };
    }

    revalidatePath("/referral");

    return {
      success: true,
      message: "Successfully generated referral code.",
      code: newCode,
    };
  } catch (error) {
    console.log("Error in generateUserReferralCode:", error);
    return {
      success: false,
      message: "Something went wrong while generating the code.",
    };
  }
}

export async function getReferralIdForUser(referredUserId: string): Promise<string | null> {
  const supabase = await createSupabaseServerClient();

  try {
    const { data, error } = await supabase
      .from("referrals")
      .select("referral_id")
      .eq("referred_user_id", referredUserId)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error && error.code !== "PGRST116") {
      console.error("Database error fetching referral ID:", error.message);
      console.error("Database error:", error);
      return null;
    }

    return data ? data.referral_id : null;
  } catch (err) {
    console.error("An unexpected error occurred in getReferralIdForUser:", err);
    return null;
  }
}

export async function getReferralDashboardStats() {
  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("User not authenticated");
  }

  const { data: userReferrals, error: referralsError } = await supabase
    .from("referrals")
    .select("referral_id, status")
    .eq("referrer_user_id", user.id);

  if (referralsError) {
    console.error("Error fetching user referrals:", referralsError);
    return null;
  }

  const referralIds = userReferrals.map((r) => r.referral_id);

  let totalCommission = 0;
  let paidOutCount = 0;

  if (referralIds.length > 0) {
    const { data: commissions, error: commissionsError } = await supabase
      .from("referral_commissions")
      .select("amount, status")
      .in("referral_id", referralIds);

    if (commissionsError) {
      console.error("Error fetching commissions:", commissionsError);
    } else if (commissions) {
      totalCommission = commissions.reduce((sum, item) => sum + (item.amount || 0), 0);
      paidOutCount = commissions.filter((c) => c.status === "Paid").length;
    }
  }

  const numberOfReferrals = userReferrals.length;
  const activeSubscribers = userReferrals.filter((r) => r.status === "Active").length;
  const inactiveSubscribers = userReferrals.filter((r) => r.status === "Pending" || r.status === "Cancelled").length;

  return {
    estimatedTotalCommission: totalCommission,
    activeSubscribers: activeSubscribers,
    inactiveSubscribers: inactiveSubscribers,
    numberOfReferrals: numberOfReferrals,
    paidOut: paidOutCount,
  };
}

export async function getUserSubscribers() {
  const supabase = await createSupabaseServerClient();
  const query = await createSupabaseServiceClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("User not authenticated");
  }

  const { data: referrals, error: referralsError } = await query
    .from("referrals")
    .select("referred_user_id, status, referral_id")
    .eq("referrer_user_id", user.id)
    .order("updated_at", { ascending: false });

  if (referralsError) {
    console.error("Error fetching subscribers:", referralsError);
    return [];
  }

  if (!referrals || referrals.length === 0) {
    return [];
  }

  const referredUserIds = referrals.map((r) => r.referred_user_id).filter((id): id is string => id !== null);

  const { data: users, error: usersError } = await query
    .from("users")
    .select("user_id, email")
    .in("user_id", referredUserIds);

  if (usersError) {
    console.error("Error fetching user emails:", usersError);
  }

  const userEmailMap = new Map((users || []).map((u) => [u.user_id, u.email]));

  const referralIds = referrals.map((r) => r.referral_id);

  let commissions: {
    referral_id: string;
    amount: number | null;
  }[] = [];

  if (referralIds.length > 0) {
    const { data: commData, error: commError } = await query
      .from("referral_commissions")
      .select("referral_id, amount")
      .in("referral_id", referralIds);
    if (commError) {
      console.error("Error fetching subscriber commissions:", commError);
    } else {
      commissions = commData || [];
    }
  }

  const subscribers = referrals.map((referral) => {
    const totalEarnings = commissions
      .filter((c) => c.referral_id === referral.referral_id)
      .reduce((sum, item) => sum + (item.amount || 0), 0);

    const referredUserEmail = referral.referred_user_id ? userEmailMap.get(referral.referred_user_id) : undefined;

    return {
      referred_user_id: referral.referred_user_id,
      referred_user_email: referredUserEmail || "N/A",
      referral_status: referral.status,
      total_earnings: totalEarnings,
    };
  });

  return subscribers;
}

export async function getReferralChartData(timeRange: "7D" | "4W" | "6M" | "YTD" | "1Y") {
  const supabase = await createSupabaseServerClient();
  const query = await createSupabaseServiceClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("User not authenticated");
  }

  const now = new Date();
  let startDate = new Date();

  switch (timeRange) {
    case "7D":
      startDate.setDate(now.getDate() - 7);
      break;
    case "4W":
      startDate.setDate(now.getDate() - 28);
      break;
    case "6M":
      startDate.setMonth(now.getMonth() - 6);
      break;
    case "YTD":
      startDate = new Date(now.getFullYear(), 0, 1);
      break;
    case "1Y":
      startDate.setFullYear(now.getFullYear() - 1);
      break;
  }

  const { data: referrals, error: referralsError } = await query
    .from("referrals")
    .select("referral_id, status, created_at, updated_at")
    .eq("referrer_user_id", user.id)
    .gte("created_at", startDate.toISOString())
    .order("created_at", { ascending: true });

  if (referralsError) {
    console.error("Error fetching referral chart data:", referralsError);
    return { labels: [], activeData: [], inactiveData: [], pendingData: [] };
  }

  const groupedData = new Map<string, { active: number; inactive: number; pending: number }>();

  referrals?.forEach((referral) => {
    const date = new Date(referral.created_at);
    let key: string;

    if (timeRange === "7D") {
      key = date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    } else if (timeRange === "4W") {
      const weekStart = new Date(date);
      weekStart.setDate(date.getDate() - date.getDay());
      key = weekStart.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    } else {
      key = date.toLocaleDateString("en-US", { month: "short", year: timeRange === "1Y" ? "2-digit" : "numeric" });
    }

    if (!groupedData.has(key)) {
      groupedData.set(key, { active: 0, inactive: 0, pending: 0 });
    }

    const counts = groupedData.get(key)!;

    if (referral.status === "Active") {
      counts.active++;
    } else if (referral.status === "Pending") {
      counts.pending++;
      counts.inactive++;
    } else if (referral.status === "Cancelled") {
      counts.inactive++;
    }
  });

  // Convert to cumulative counts
  const labels = Array.from(groupedData.keys());
  const activeData: number[] = [];
  const inactiveData: number[] = [];
  const pendingData: number[] = [];

  let cumulativeActive = 0;
  let cumulativeInactive = 0;
  let cumulativePending = 0;

  Array.from(groupedData.values()).forEach((v) => {
    cumulativeActive += v.active;
    cumulativeInactive += v.inactive;
    cumulativePending += v.pending;

    activeData.push(cumulativeActive);
    inactiveData.push(cumulativeInactive);
    pendingData.push(cumulativePending);
  });

  return {
    labels,
    activeData,
    inactiveData,
    pendingData,
  };
}

export async function getUserPayouts() {
  const supabase = await createSupabaseServerClient();
  const query = await createSupabaseServiceClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("User not authenticated");
  }

  const { data: referrals, error: referralsError } = await query
    .from("referrals")
    .select("referral_id, referred_user_id")
    .eq("referrer_user_id", user.id);

  if (referralsError) {
    console.error("Error fetching referrals:", referralsError);
    return [];
  }

  if (!referrals || referrals.length === 0) {
    return [];
  }

  const referralIds = referrals.map((r) => r.referral_id);

  const { data: commissions, error: commissionsError } = await query
    .from("referral_commissions")
    .select("referral_id, amount, status, payout_eligible_date, billing_period_start")
    .in("referral_id", referralIds)
    .order("created_at", { ascending: false });

  if (commissionsError) {
    console.error("Error fetching commissions:", commissionsError);
    return [];
  }

  if (!commissions || commissions.length === 0) {
    return [];
  }

  const referredUserIds = referrals.map((r) => r.referred_user_id).filter((id): id is string => id !== null);

  const { data: users, error: usersError } = await query
    .from("users")
    .select("user_id, email")
    .in("user_id", referredUserIds);

  if (usersError) {
    console.error("Error fetching user emails:", usersError);
  }

  const userEmailMap = new Map((users || []).map((u) => [u.user_id, u.email]));
  const referralUserMap = new Map(referrals.map((r) => [r.referral_id, r.referred_user_id]));

  const currentDate = new Date();

  const payouts = commissions.map((commission) => {
    const referredUserId = referralUserMap.get(commission.referral_id);
    const email = referredUserId ? userEmailMap.get(referredUserId) : undefined;

    const payoutEligibleDate = commission.payout_eligible_date ? new Date(commission.payout_eligible_date) : null;
    const isEligible = payoutEligibleDate ? currentDate > payoutEligibleDate : false;

    return {
      email: email || "N/A",
      status: commission.status,
      amount: commission.amount || 0,
      billing_period_start: commission.billing_period_start,
      payout_eligible_date: commission.payout_eligible_date,
      eligibility: (isEligible ? "Eligible" : "Not Eligible") as "Eligible" | "Not Eligible",
    };
  });

  return payouts;
}
