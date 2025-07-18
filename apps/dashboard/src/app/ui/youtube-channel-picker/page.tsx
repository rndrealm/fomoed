"use client";

import YoutubeChannelSearchDialog from "@/components/modals/signal-builder/YoutubeChannelSearchDialog";
import { useCallback } from "react";

export default function YoutubeChannelSearchPage() {
  const setSelectedChannelId = useCallback((id: string | null) => {
    console.log("Selected Channel ID:", id);
  }, []);

  return (
    <div className="flex min-h-screen items-center justify-center p-8 max-w-64 mx-auto">
      <YoutubeChannelSearchDialog onChange={(v) => setSelectedChannelId(v)} />
    </div>
  );
}
