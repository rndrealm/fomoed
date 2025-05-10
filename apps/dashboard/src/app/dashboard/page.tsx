"use client";

import Home from "@/components/dashboard/home";
import { Skeleton } from "@/components/ui/skeleton";
import { useGetDashboardData } from "@/services/queries/home";
import { useFetchTokenNews } from "@/services/queries/news";
import React, { Fragment, Suspense } from "react";

export default function Page() {
  const { data: dashboardData } = useGetDashboardData();
  const { data: newsData } = useFetchTokenNews();

  return (
    <Fragment>
      {dashboardData && newsData ? (
        <Home dashboardData={dashboardData} />
      ) : (
        <Skeleton className="w-full h-full bg-widget-background-200" />
      )}
    </Fragment>
  );
}
