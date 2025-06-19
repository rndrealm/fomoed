"use client";

import React from "react";
import WeightedSentimentWidget from "@/components/widgets/weighted-sentiment/weighted-sentiment";

const Page = () => {
  // Mock widget configuration for testing
  const mockWidget = {
    id: "weighted-sentiment-test",
    type: "weighted-sentiment",
    props: {
      period: "15m", // Default to 15 minutes
    },
    meta: {
      i: "weighted-sentiment-test",
      x: 0,
      y: 0,
      w: 6,
      h: 4,
      minW: 2,
      minH: 2,
    },
  };

  return (
    <div className="h-screen p-4">
      <WeightedSentimentWidget widget={mockWidget} />
    </div>
  );
};

export default Page;
