import YoutubeChannelSearchDialog from "@/components/modals/signal-builder/YoutubeChannelSearchDialog";
import { Label } from "@/components/ui/label";
import { TopicSelectorProps } from "@/constant/signals/data-source-config";

export function TopicSelectorYtChannel({ onChange }: TopicSelectorProps) {
  return (
    <div className="w-full">
      <Label className="mb-2 text-muted-foreground">YouTube Channel</Label>
      <YoutubeChannelSearchDialog
        onChange={(v) => {
          onChange(v ? v : null);
        }}
      />
    </div>
  );
}
