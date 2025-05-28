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
import { useEffect, useState } from "react";

interface MarketCapConfigProps {
  value: string | null;
  onChange: (value: string) => void;
}

export function MarketCapConfig({ value, onChange }: MarketCapConfigProps) {
  const [slugs, setSlugs] = useState<string[]>(["bitcoin", "ethereum"]);
  const [open, setOpen] = useState(false);

  return (
    <div className="w-full full">
      <Label className="mb-2 text-muted-foreground">Symbol</Label>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between bg-[#2A2A2A] border-[#3A3A3A] text-white px-4 py-2"
            id="symbol"
          >
            {value
              ? slugs.find((s) => s === value) || value
              : "Select symbol"}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0">
          <Command>
            <CommandInput
              placeholder="Search symbol..."
              className="px-4 py-2"
            />
            <CommandList className=" ">
              <CommandEmpty>No symbol found.</CommandEmpty>
              <CommandGroup>
                {slugs.map((slug) => (
                  <CommandItem
                    key={slug}
                    value={slug}
                    onSelect={(currentValue) => {
                      onChange(currentValue === value ? "" : currentValue);
                      setOpen(false);
                    }}
                    className="cursor-pointer px-4 py-2"
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        value === slug ? "opacity-100" : "opacity-0"
                      )}
                    />
                    {slug}
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
