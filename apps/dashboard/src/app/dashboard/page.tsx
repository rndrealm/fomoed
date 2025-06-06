// "use client";
import { Loader } from "@/components/dashboard";
import Home from "@/components/dashboard/home";
import { useGetDashboardData } from "@/services/queries/home";
import { getDashboardData } from "@/services/queries/home/server-actions";
import { useFetchTokenNews } from "@/services/queries/news";
import { fetchNewsData } from "@/services/queries/news/server-actions";
import React, { Fragment, Suspense } from "react";

export default async function Page() {
  // const { data: dashboardData } = useGetDashboardData();
  // const { data: newsData } = useFetchTokenNews();
  const dashboardData = await getDashboardData();
  // await fetchNewsData();
  return (
    // <Fragment>
    //   {dashboardData ? <Home dashboardData={dashboardData} /> : <Loader />}
    // </Fragment>
    <Suspense fallback={<p>Error</p>}>
      <Home dashboardData={dashboardData} />
    </Suspense>
  );
}
