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

const cfgiSupportedSymbols = [
  "BTC",
  "ETH",
  // "BNB",
  // "XRP",
  // "SOL",
  // "ADA",
  // "LUNA",
  // "AVAX",
  // "DOGE",
  // "DOT",
  // "SHIB",
  // "MATIC",
  // "CRO",
  // "TRX",
  // "XLM",
  // "LINK",
  // "UNI",
  // "FTM",
  // "ALGO",
  // "MANA",
  // "LTC",
  // "LEO",
  // "FTT",
  // "NEAR",
  // "BCH",
  // "ETC",
  // "XMR",
  // "ATOM",
  // "VET",
  // "HBAR",
  // "FLOW",
  // "ICP",
  // "APE",
  // "EGLD",
  // "XTZ",
  // "THETA",
  // "HNT",
  // "FIL",
  // "BSV",
  // "AXS",
  // "SAND",
  // "ZEC",
  // "EOS",
  // "IOTA",
  // "PEPE",
  // "ARB",
  // "INJ",
  // "GRT",
  // "WIF",
  // "SUI",
  // "BGB",
  // "BONK",
  // "NOT",
  // "AAVE",
  // "JUP",
  // "SEI",
  // "GALA",
  // "BTT",
  // "TON",
  // "NEIRO",
  // "BABYDOGE",
  // "FET",
  // "EIGEN",
  // "OG",
  // "POLY",
  // "APU",
  // "SPX",
  // "GIGA",
  // "BITCOIN",
  // "MOG",
  // "POPCAT",
  // "BOBO",
  // "TET",
  // "WOJAK",
  // "KAS",
  // "MOODENG",
  // "FLOKI",
  // "RUNE",
  // "TRUMP",
  // "MELANIA",
];

interface CFGIConfigProps {
  value: string | null;
  onChange: (value: string) => void;
}

export function CFGIConfig({ value, onChange }: CFGIConfigProps) {
  const [open, setOpen] = useState(false);

  const handleItemSelect = (currentValue: string) => {
    const formattedCurrentValue = `cfgi_${currentValue}`;

    onChange(value === formattedCurrentValue ? "" : formattedCurrentValue);
  };
  return (
    <div className="w-full">
      <Label className="mb-2 text-muted-foreground">CFGI Symbol</Label>

      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between bg-[#2A2A2A] border-[#3A3A3A] text-white px-4 py-2"
            id="cfgi-symbol"
          >
            {value ? value : "Select symbol"}
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
                {cfgiSupportedSymbols.map((symbol) => (
                  <CommandItem
                    key={symbol}
                    value={symbol}
                    onSelect={(currentValue) => {
                      handleItemSelect(currentValue);
                      setOpen(false);
                    }}
                    className="cursor-pointer px-4 py-2"
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        value?.replace("cfgi_", "") === symbol
                          ? "opacity-100"
                          : "opacity-0",
                      )}
                    />
                    {symbol}
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
