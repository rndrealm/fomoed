"use client";
import { Loader } from "@/components/dashboard";
import Home from "@/components/dashboard/home";
import { useSupabaseAuth } from "@/components/providers";
import { useReadDashboardData } from "@/services/queries/home";

export default function Page() {
  const { session } = useSupabaseAuth();

  const { data } = useReadDashboardData(session?.user?.id || "");

  if (!data) {
    return <Loader />;
  }

  return <Home dashboardData={data} />;
}
