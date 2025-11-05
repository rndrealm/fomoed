"use client";
import { Loader } from "@/components/dashboard";
import Home from "@/components/dashboard/home";
import { useSupabaseAuth } from "@/components/providers";
import { useReadDashboardData } from "@/services/queries/home";
import { getUserOnboardingStatus } from "@/services/queries/users/server-action";
import { useEffect, useState } from "react";

export default function Page() {
  const { session } = useSupabaseAuth();
  const { data } = useReadDashboardData(session?.user?.id || "");
  const [onboardingStatus, setOnboardingStatus] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchOnboardingStatus() {
      if (session?.user?.id) {
        try {
          const status = await getUserOnboardingStatus();
          setOnboardingStatus(status);
        } catch (error) {
          console.error("Error fetching onboarding status:", error);
          setOnboardingStatus(true); // Default to true on error
        } finally {
          setIsLoading(false);
        }
      }
    }

    fetchOnboardingStatus();
  }, [session?.user?.id]);

  if (!data || isLoading || onboardingStatus === null) {
    return <Loader />;
  }

  return <Home dashboardData={data} showTermsModal={!onboardingStatus} />;
}