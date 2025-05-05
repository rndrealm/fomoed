import Home from "@/components/dashboard/home";
import { getUserTabsAction } from "@/services/queries/widgets/actions";
import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from "@tanstack/react-query";
import React from "react";

export default async function Page() {
  const queryClient = new QueryClient();

  await queryClient.prefetchQuery({
    queryKey: ["tabs"],
    queryFn: async () => {
      const response = await getUserTabsAction();
      console.log("response:", response);
      return response.tabs;
    },
  });
  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <Home />
    </HydrationBoundary>
  );
}
