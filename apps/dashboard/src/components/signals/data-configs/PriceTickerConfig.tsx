import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { Check, ChevronsUpDown } from "lucide-react";
import { useEffect, useState } from "react";

interface PriceTickerConfigProps {
  value: string | null;
  onChange: (value: string) => void;
}

export function PriceTickerConfig({ value, onChange }: PriceTickerConfigProps) {
  const [products, setProducts] = useState<
    { display_name: string; value: string }[]
  >([]);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    fetch("https://api.exchange.coinbase.com/products")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setProducts(
            data.map((p) => ({
              display_name: p.display_name,
              value: `ticker_${p.display_name?.replaceAll("-", "")}`,
            }))
          );
        }
      });
  }, []);

  return (
    <div className="space-y-2 p-2">
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
              ? products.find((p) => p.value === value)?.display_name || value
              : "Select symbol"}
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
                {products.map((product) => (
                  <CommandItem
                    key={product.display_name}
                    value={product.value}
                    onSelect={(currentValue) => {
                      onChange(currentValue === value ? "" : currentValue);
                      setOpen(false);
                    }}
                    className="cursor-pointer px-4 py-2"
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        value === product.value ? "opacity-100" : "opacity-0"
                      )}
                    />
                    {product.display_name}
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
