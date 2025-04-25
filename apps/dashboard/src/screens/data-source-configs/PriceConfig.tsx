import React, { useEffect, useState } from "react";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";

function fetchProducts(): Promise<{ display_name: string }[]> {
    return fetch("https://api.exchange.coinbase.com/products")
        .then((res) => res.json())
        .then((data) => (Array.isArray(data) ? data.map((p) => ({ display_name: p.display_name })) : []));
}

export function PriceConfig() {
    const [products, setProducts] = useState<{ display_name: string }[]>([]);
    const [open, setOpen] = useState(false);
    const [selected, setSelected] = useState<string>("");

    useEffect(() => {
        fetchProducts().then(setProducts);
    }, []);

    return (
        <div className="space-y-4 p-4 max-w-sm">
            <div className="space-y-2">
                <Label htmlFor="symbol" className="text-gray-400">
                    Symbol
                </Label>
                <Popover open={open} onOpenChange={setOpen}>
                    <PopoverTrigger asChild>
                        <Button
                            variant="outline"
                            role="combobox"
                            aria-expanded={open}
                            className="w-full justify-between bg-[#2A2A2A] border-[#3A3A3A] text-white px-4 py-2"
                            id="symbol"
                        >
                            {selected
                                ? products.find((p) => p.display_name === selected)?.display_name
                                : "Select symbol"}
                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-full p-0 bg-[#222222] border-[#333333] text-white">
                        <Command>
                            <CommandInput placeholder="Search symbol..." className="px-4 py-2" />
                            <CommandList>
                                <CommandEmpty>No symbol found.</CommandEmpty>
                                <CommandGroup>
                                    {products.map((product) => (
                                        <CommandItem
                                            key={product.display_name}
                                            value={product.display_name}
                                            onSelect={(currentValue) => {
                                                setSelected(currentValue === selected ? "" : currentValue);
                                                setOpen(false);
                                            }}
                                            className="cursor-pointer px-4 py-2"
                                        >
                                            <Check
                                                className={cn(
                                                    "mr-2 h-4 w-4",
                                                    selected === product.display_name ? "opacity-100" : "opacity-0"
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
            {/* Add more price-specific configurations here */}
        </div>
    );
}
