import React, { Suspense } from "react";
import { NewsSection } from "../../components/news/feed/news-section";

export default async function Page() {
  return (
    <Suspense>
      <NewsSection />
    </Suspense>
  );
}
