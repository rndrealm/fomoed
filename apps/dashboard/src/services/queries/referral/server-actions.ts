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
  let paidOutAmount = 0; // Changed from paidOutCount

  if (referralIds.length > 0) {
    const { data: commissions, error: commissionsError } = await supabase
      .from("referral_commissions")
      .select("amount, status")
      .in("referral_id", referralIds);

    if (commissionsError) {
      console.error("Error fetching commissions:", commissionsError);
    } else if (commissions) {
      totalCommission = commissions.reduce((sum, item) => sum + (item.amount || 0), 0);
      paidOutAmount = commissions
        .filter((c) => c.status === "Paid")
        .reduce((sum, item) => sum + (item.amount || 0), 0); // Sum paid amounts
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
    paidOut: paidOutAmount, // Now returns dollar amount instead of count
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
  // Only fetch active referrals
  const { data: referrals, error: referralsError } = await query
    .from("referrals")
    .select("referred_user_id, status, referral_id, created_at")
    .eq("referrer_user_id", user.id)
    .eq("status", "Active")
    .order("updated_at", { ascending: false });
  if (referralsError) {
    console.error("Error fetching subscribers:", referralsError);
    return [];
  }
  if (!referrals || referrals.length === 0) {
    return [];
  }
  const referralIds = referrals.map((r) => r.referral_id);
  let commissions: {
    referral_id: string;
    amount: number | null;
    billing_period_start: string | null;
  }[] = [];
  if (referralIds.length > 0) {
    const { data: commData, error: commError } = await query
      .from("referral_commissions")
      .select("referral_id, amount, billing_period_start")
      .in("referral_id", referralIds);
    if (commError) {
      console.error("Error fetching subscriber commissions:", commError);
    } else {
      commissions = commData || [];
    }
  }

  // Fetch user emails
  const referredUserIds = referrals
    .map((r) => r.referred_user_id)
    .filter((id): id is string => id !== null);

  const { data: users, error: usersError } = await query
    .from("users")
    .select("user_id, email")
    .in("user_id", referredUserIds);

  if (usersError) {
    console.error("Error fetching user emails:", usersError);
  }

  const userEmailMap = new Map((users || []).map((u) => [u.user_id, u.email]));

  // Helper function to mask email
  const maskEmail = (email: string | null | undefined): string => {
    if (!email) return "N/A";
    const [localPart, domain] = email.split("@");
    if (!domain) return "N/A";
    const prefix = localPart.substring(0, 3);
    return `${prefix}***@${domain}`;
  };

  const subscribers = referrals.map((referral) => {
    const totalEarnings = commissions
      .filter((c) => c.referral_id === referral.referral_id)
      .reduce((sum, item) => sum + (item.amount || 0), 0);
    // Get the earliest billing_period_start as joined date
    const referralCommissions = commissions.filter(
      (c) => c.referral_id === referral.referral_id
    );
    const joinedDate =
      referralCommissions.length > 0
        ? referralCommissions.reduce((earliest, c) =>
            c.billing_period_start &&
            (!earliest || c.billing_period_start < earliest)
              ? c.billing_period_start
              : earliest,
          null as string | null
        )
        : referral.created_at;

    const email = referral.referred_user_id
      ? userEmailMap.get(referral.referred_user_id)
      : null;

    return {
      email: maskEmail(email),
      joined_date: joinedDate,
      status: referral.status,
      total_earnings: totalEarnings,
    };
  });
  return subscribers;
}

export async function getFreeUsers() {
  const supabase = await createSupabaseServerClient();
  const query = await createSupabaseServiceClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    throw new Error("User not authenticated");
  }
  // Fetch referrals with Pending or Cancelled status
  const { data: referrals, error: referralsError } = await query
    .from("referrals")
    .select("referred_user_id, status")
    .eq("referrer_user_id", user.id)
    .in("status", ["Pending", "Cancelled"])
    .order("updated_at", { ascending: false });
  if (referralsError) {
    console.error("Error fetching free users:", referralsError);
    return [];
  }
  if (!referrals || referrals.length === 0) {
    return [];
  }
  const referredUserIds = referrals
    .map((r) => r.referred_user_id)
    .filter((id): id is string => id !== null);

  const { data: users, error: usersError } = await query
    .from("users")
    .select("user_id, email")
    .in("user_id", referredUserIds);

  if (usersError) {
    console.error("Error fetching user emails:", usersError);
    return [];
  }

  const userEmailMap = new Map((users || []).map((u) => [u.user_id, u.email]));

  // Helper function to mask email
  const maskEmail = (email: string | null | undefined): string => {
    if (!email) return "N/A";
    const [localPart, domain] = email.split("@");
    if (!domain) return "N/A";
    const prefix = localPart.substring(0, 3);
    return `${prefix}***@${domain}`;
  };

  const freeUsers = referrals.map((referral) => ({
    email: referral.referred_user_id
      ? maskEmail(userEmailMap.get(referral.referred_user_id))
      : "N/A",
    status: referral.status,
  }));
  return freeUsers;
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
  now.setHours(0, 0, 0, 0);
  let startDate = new Date();
  startDate.setHours(0, 0, 0, 0);

  switch (timeRange) {
    case "7D":
      startDate.setDate(now.getDate() - 6); // 7 days including today
      break;
    case "4W":
      startDate.setDate(now.getDate() - 27); // 28 days including today
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
    .order("created_at", { ascending: true });

  if (referralsError) {
    console.error("Error fetching referral chart data:", referralsError);
    return { labels: [], activeData: [], inactiveData: [], pendingData: [] };
  }

  // Initialize all dates in the range with zero counts
  const dateMap = new Map<string, { active: Set<string>; inactive: Set<string>; pending: Set<string> }>();
  
  const currentDate = new Date(startDate);
  while (currentDate <= now) {
    const dateKey = currentDate.toISOString().split('T')[0];
    dateMap.set(dateKey, { 
      active: new Set(), 
      inactive: new Set(), 
      pending: new Set() 
    });
    currentDate.setDate(currentDate.getDate() + 1);
  }

  // Process each referral and add to appropriate dates
  referrals?.forEach((referral) => {
    const createdDate = new Date(referral.created_at);
    createdDate.setHours(0, 0, 0, 0);

    // Add this referral to all dates from creation date onwards (within our range)
    const refDate = new Date(Math.max(createdDate.getTime(), startDate.getTime()));
    
    while (refDate <= now) {
      const dateKey = refDate.toISOString().split('T')[0];
      const counts = dateMap.get(dateKey);
      
      if (counts) {
        if (referral.status === "Active") {
          counts.active.add(referral.referral_id);
        } else if (referral.status === "Pending") {
          counts.pending.add(referral.referral_id);
        } else if (referral.status === "Cancelled") {
          counts.inactive.add(referral.referral_id);
        }
      }
      
      refDate.setDate(refDate.getDate() + 1);
    }
  });

  // Convert to arrays
  const labels: string[] = [];
  const activeData: number[] = [];
  const inactiveData: number[] = [];
  const pendingData: number[] = [];

  dateMap.forEach((counts, dateKey) => {
    labels.push(dateKey);
    activeData.push(counts.active.size);
    inactiveData.push(counts.inactive.size);
    pendingData.push(counts.pending.size);
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
