import Home from "@/components/dashboard/home";
import { getDashboardData } from "@/services/queries/home/server-actions";
import { Suspense } from "react";

export default async function Page() {
  const dashboardData = await getDashboardData();
  return (
    // <Fragment>
    //   {dashboardData ? <Home dashboardData={dashboardData} /> : <Loader />}
    // </Fragment>
    <Suspense fallback={<p>Error</p>}>
      <Home dashboardData={dashboardData} />
    </Suspense>
  );
}
