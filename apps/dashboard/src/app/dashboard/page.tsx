"use client";
import { Loader } from "@/components/dashboard";
import Home from "@/components/dashboard/home";
import { useGetDashboardData } from "@/services/queries/home";
import { useFetchTokenNews } from "@/services/queries/news";
import React, { Fragment, Suspense } from "react";

export default function Page() {
  const { data: dashboardData } = useGetDashboardData();
  const { data: newsData } = useFetchTokenNews();

  return (
    <Fragment>
      {dashboardData ? <Home dashboardData={dashboardData} /> : <Loader />}
    </Fragment>
  );
}
