"use client";

import { initMixpanel } from "@/lib/analytics/mixpanelClient";
import { useEffect } from "react";

const AnalyticsProvider = ({ children }: { children: React.ReactNode }) => {
  useEffect(() => {
    initMixpanel();
  }, []);

  return children;
};

export default AnalyticsProvider;
