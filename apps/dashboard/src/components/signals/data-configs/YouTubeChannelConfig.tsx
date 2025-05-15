import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { Check, ChevronsUpDown } from "lucide-react";
import { useState } from "react";

const youtubeChannels = ["DiscoverCrypto"];

interface YouTubeChannelConfigProps {
  value: string | null;
  onChange: (value: string) => void;
}

export function YouTubeChannelConfig({
  value,
  onChange,
}: YouTubeChannelConfigProps) {
  const [open, setOpen] = useState(false);

  const handleItemSelect = (currentValue: string) => {
    const formattedValue = `youtube_streaming_${currentValue}`;
    onChange(value === formattedValue ? "" : formattedValue);
  };

  return (
    <div className="w-full">
      <Label className="mb-2 text-muted-foreground">YouTube Channel</Label>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between bg-[#2A2A2A] border-[#3A3A3A] text-white px-4 py-2"
            id="youtube-channel"
          >
            {value ? value.replace("youtube_streaming_", "") : "Select channel"}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0 bg-[#222222] border-[#333333] text-white">
          <Command>
            <CommandInput
              placeholder="Search channel..."
              className="px-4 py-2"
            />
            <CommandList>
              <CommandEmpty>No channel found.</CommandEmpty>
              <CommandGroup>
                {youtubeChannels.map((channel) => (
                  <CommandItem
                    key={channel}
                    value={channel}
                    onSelect={(currentValue) => {
                      handleItemSelect(currentValue);
                      setOpen(false);
                    }}
                    className="cursor-pointer px-4 py-2"
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        value?.replace("youtube_streaming_", "") === channel
                          ? "opacity-100"
                          : "opacity-0"
                      )}
                    />
                    {channel}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}
