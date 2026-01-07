/* eslint-disable react-hooks/exhaustive-deps */
"use client";
import { Loader } from "@/components/dashboard";
import Home from "@/components/dashboard/home";
import { useSupabaseAuth } from "@/components/providers";
import { useReadDashboardData } from "@/services/queries/home";
import { getUserOnboardingStatus } from "@/services/queries/users/server-action";
import { getGuestDashboardData } from "@/services/queries/home/server-actions";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";

export default function Page() {
  const { session, isLoading: authLoading } = useSupabaseAuth();
  const isGuest = !session?.user?.id;

  // Only fetch data from server for authenticated users
  const { data: serverData } = useReadDashboardData(session?.user?.id || "");
  const [guestData, setGuestData] = useState<any>(null);
  const [onboardingStatus, setOnboardingStatus] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const queryClient = useQueryClient();

  // Clear guest data and timer when user authenticates
  useEffect(() => {
    if (session?.user?.id && !authLoading) {
      // User just logged in, clear guest data and timer
      try {
        localStorage.removeItem("fomoed_guest_dashboard");
        localStorage.removeItem("fomoed_guest_timer");
      } catch (error) {
        console.error("Error clearing guest data:", error);
      }
    }
  }, [session?.user?.id, authLoading]);

  // Handle guest data (localStorage or default)
  useEffect(() => {
    if (isGuest && !authLoading) {
      try {
        // Try to load from localStorage first
        const savedGuestData = localStorage.getItem("fomoed_guest_dashboard");
        if (savedGuestData) {
          setGuestData(JSON.parse(savedGuestData));
        } else {
          // Generate default guest data
          const defaultGuestData = getGuestDashboardData();
          setGuestData(defaultGuestData);
        }
        setOnboardingStatus(true); // Guests don't see terms modal
        setIsLoading(false);
      } catch (error) {
        console.error("Error loading guest data:", error);
        // Fallback to default guest data
        const defaultGuestData = getGuestDashboardData();
        setGuestData(defaultGuestData);
        setOnboardingStatus(true);
        setIsLoading(false);
      }
    }
  }, [isGuest, authLoading]);

  // Handle authenticated user onboarding status
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

  // Todo: this is a short term solution (need to rethink)
  useEffect(() => {
    queryClient.invalidateQueries({ queryKey: ["read-dashboard-data"] });
  }, []);

  // Determine which data to use
  const dashboardData = isGuest ? guestData : serverData;

  if (!dashboardData || isLoading || onboardingStatus === null || authLoading) {
    return <Loader />;
  }

  return <Home dashboardData={dashboardData} showTermsModal={!onboardingStatus} isGuest={isGuest} />;
}
