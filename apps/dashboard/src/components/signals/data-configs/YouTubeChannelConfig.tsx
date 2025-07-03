import YoutubeChannelSearchDialog from "@/components/modals/signal-builder/YoutubeChannelSearchDialog";
import { Label } from "@/components/ui/label";
import { useEffect, useState } from "react";

interface YouTubeChannelConfigProps {
  value: string | null;
  onChange: (value: string) => void;
}

export function YouTubeChannelConfig({
  value,
  onChange,
}: YouTubeChannelConfigProps) {
  const [selectedChannelId, setSelectedChannelId] = useState<string | null>(
    null,
  );

  useEffect(() => {
    const formattedValue = `youtube_streaming_${selectedChannelId}`;

    if (value !== formattedValue) {
      onChange(formattedValue);
    }
  }, [selectedChannelId, onChange, value]);

  return (
    <div className="w-full">
      <Label className="mb-2 text-muted-foreground">YouTube Channel</Label>
      <YoutubeChannelSearchDialog
        onChannelIdPick={(v) => setSelectedChannelId(v)}
      />
    </div>
  );
}
