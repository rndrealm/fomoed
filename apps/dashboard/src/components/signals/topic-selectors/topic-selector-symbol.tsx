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
import { TopicSelectorProps } from "@/constant/signals/data-source-config";
import { useDataSources } from "@/hooks/smart-signals/use-data-sources";
import { cn } from "@/lib/utils";
import { Check, ChevronsUpDown } from "lucide-react";
import { useEffect, useState } from "react";

export function TopicSelectorSymbol({
  selectedTopic,
  onChange,
  dataSourcePrefix,
}: TopicSelectorProps) {
  const [open, setOpen] = useState(false);

  const handleItemSelect = (newVal: string) => {
    setOpen(false);
    onChange(newVal);
  };

  const { getDataSourceTopics } = useDataSources();

  const [topics, setTopics] = useState<string[]>([]);

  useEffect(() => {
    setTopics(getDataSourceTopics(dataSourcePrefix));
  }, [dataSourcePrefix, getDataSourceTopics]);

  return (
    <div className="w-full">
      <Label className="mb-2 text-muted-foreground">Symbol</Label>

      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between bg-[#2A2A2A] border-[#3A3A3A] text-white px-4 py-2 h-12"
            id="cfgi-symbol"
          >
            {selectedTopic ? selectedTopic : "Select symbol"}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>

        <PopoverContent className="w-full p-0 bg-[#222222] border-[#333333] text-white">
          <Command>
            <CommandInput
              placeholder="Search symbol..."
              className="px-4 py-2"
            />
            <CommandList>
              <CommandEmpty>No symbol found.</CommandEmpty>

              <CommandGroup>
                {topics.map((topic) => (
                  <CommandItem
                    key={topic}
                    value={topic}
                    onSelect={handleItemSelect}
                    className="cursor-pointer px-4 py-2"
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        topic === selectedTopic ? "opacity-100" : "opacity-0",
                      )}
                    />
                    {topic}
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
