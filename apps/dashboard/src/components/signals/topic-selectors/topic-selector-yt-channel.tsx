import YoutubeChannelSearchDialog from "@/components/modals/signal-builder/YoutubeChannelSearchDialog";
import { Label } from "@/components/ui/label";
import { useEffect, useState } from "react";

interface YouTubeChannelConfigProps {
  selectedTopic: string | null;
  onChange: (value: string) => void;
}

export function TopicSelectorYtChannel({
  selectedTopic,
  onChange,
}: YouTubeChannelConfigProps) {
  const [selectedChannelId, setSelectedChannelId] = useState<string | null>(
    null,
  );

  useEffect(() => {
    const formattedValue = `youtube_streaming_${selectedChannelId}`;

    if (selectedTopic !== formattedValue) {
      onChange(formattedValue);
    }
  }, [selectedChannelId, onChange, selectedTopic]);

  return (
    <div className="w-full">
      <Label className="mb-2 text-muted-foreground">YouTube Channel</Label>
      <YoutubeChannelSearchDialog
        onChannelIdPick={(v) => setSelectedChannelId(v)}
      />
    </div>
  );
}
