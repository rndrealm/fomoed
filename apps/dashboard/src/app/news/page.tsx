import React, { Suspense } from "react";
import { NewsSection } from "./NewsSection";

export default async function Page() {
  return (
    <Suspense>
      <NewsSection />
    </Suspense>
  );
}
