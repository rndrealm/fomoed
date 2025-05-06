import Home from "@/components/dashboard/home";
import { getDashboardData } from "@/services/queries/home/actions";
import React, { Suspense } from "react";

export default async function Page() {
  const dashboardData = await getDashboardData();

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Home dashboardData={dashboardData} />
    </Suspense>
  );
}
