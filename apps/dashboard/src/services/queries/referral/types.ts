import { SuperbaseFunctionsBaseType } from "../auth/types";

export interface GenerateReferralCodeResponse extends SuperbaseFunctionsBaseType {
  code?: string;
}

export interface Subscriber {
  referred_user_id: string;
  referred_user_email: string;
  referral_status: string;
  total_earnings: number;
}

export interface FreeUserItem {
  user_id: string;
  status: string;
}

export interface StatsData {
  estimatedTotalCommission: number;
  activeSubscribers: number;
  inactiveSubscribers: number;
  numberOfReferrals: number;
  paidOut: number;
}

export interface ChartData {
  labels: string[];
  activeData: number[];
  inactiveData: number[];
  pendingData: number[];
}

export interface SubscriberItem {
  referred_user_id: string | null;
  joined_date: string | null;
  status: string;
  total_earnings: number;
}

export interface PayoutItem {
  email: string;
  status: string;
  amount: number;
  billing_period_start: string | null;
  payout_eligible_date: string | null;
  eligibility: "Eligible" | "Not Eligible";
}
