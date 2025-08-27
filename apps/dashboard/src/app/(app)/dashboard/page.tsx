"use client";
import { Loader } from "@/components/dashboard";
import Home from "@/components/dashboard/home";
import { useSupabaseAuth } from "@/components/providers";
import { RenderIf } from "@/components/shared";
import { useReadDashboardData } from "@/services/queries/home";

import { Fragment, Suspense } from "react";

export default function Page() {
  const { session } = useSupabaseAuth();

  const { data, isPending, error, isSuccess } = useReadDashboardData(
    session?.user?.id || "",
  );

  if (!data) {
    return <Loader />;
  }

  return <Home dashboardData={data} />;
}
