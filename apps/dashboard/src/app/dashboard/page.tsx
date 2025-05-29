// "use client";
import Home from "@/components/dashboard/home";
import { getDashboardData } from "@/services/queries/home/server-actions";
import { fetchNewsData } from "@/services/queries/news/server-actions";
import { Suspense } from "react";

export default async function Page() {
  // const { data: dashboardData } = useGetDashboardData();
  // const { data: newsData } = useFetchTokenNews();
  const dashboardData = await getDashboardData();
  await fetchNewsData();
  return (
    // <Fragment>
    //   {dashboardData ? <Home dashboardData={dashboardData} /> : <Loader />}
    // </Fragment>
    <Suspense fallback={<p>Error</p>}>
      <Home dashboardData={dashboardData} />
    </Suspense>
  );
}
