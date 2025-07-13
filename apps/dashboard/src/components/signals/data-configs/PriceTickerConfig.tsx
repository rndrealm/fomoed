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
import { useCallback, useEffect, useMemo, useState } from "react";

interface PriceTickerConfigProps {
  value: string | null;
  onChange: (value: string) => void;
}

export function PriceTickerConfig({ value, onChange }: PriceTickerConfigProps) {
  const [products, setProducts] = useState<
    { display_name: string; value: string }[]
  >([]);
  const [open, setOpen] = useState(false);

  // Memoize the selected product display name
  const selectedProduct = useMemo(() => {
    return products.find((p) => p.value === value)?.display_name || value;
  }, [products, value]);

  // Memoize the onSelect handler
  const handleSelect = useCallback(
    (currentValue: string) => {
      onChange(currentValue === value ? "" : currentValue);
      setOpen(false);
    },
    [onChange, value],
  );

  useEffect(() => {
    // Only fetch products once when component mounts
    const fetchProducts = async () => {
      try {
        const res = await fetch("https://api.exchange.coinbase.com/products");
        const data = await res.json();
        if (Array.isArray(data)) {
          setProducts(
            data.map((p) => ({
              display_name: p.display_name,
              value: `ticker_${p.display_name?.replaceAll("-", "")}`,
            })),
          );
        }
      } catch (error) {
        console.error("Failed to fetch products:", error);
      }
    };

    fetchProducts();
  }, []); // Empty dependency array means this runs once on mount

  return (
    <div className="w-full full">
      <Label className="mb-2 text-muted-foreground">Symbol</Label>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between bg-[#2A2A2A] border-[#3A3A3A] text-white px-4 py-2 h-12"
            id="symbol"
          >
            {value ? selectedProduct : "Select symbol"}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0">
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
                    onSelect={handleSelect}
                    className="cursor-pointer px-4 py-2"
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        value === product.value ? "opacity-100" : "opacity-0",
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
