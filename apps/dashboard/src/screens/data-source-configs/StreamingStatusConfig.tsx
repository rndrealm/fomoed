import React, { useState, useEffect } from "react";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { DataConfigComponentProps } from "../conditionTypes";

const channels = ["DiscoverCrypto"];

export function StreamingStatusConfig({ setDataObject }: DataConfigComponentProps) {
    const [open, setOpen] = useState(false);
    const [selected, setSelected] = useState<string>("");

    useEffect(() => {
        if (selected) {
            // Compose topic for streaming status
            setDataObject({ topic: [`youtube_streaming_${selected}`, "isStreaming"] });
        }
    }, [selected, setDataObject]);

    return (
        <div className="space-y-4 p-4 max-w-sm">
            <div className="space-y-2">
                <Label htmlFor="streaming-channel" className="text-gray-400">
                    Channel
                </Label>
                <Popover open={open} onOpenChange={setOpen}>
                    <PopoverTrigger asChild>
                        <Button
                            variant="outline"
                            role="combobox"
                            aria-expanded={open}
                            className="w-full justify-between bg-[#2A2A2A] border-[#3A3A3A] text-white px-4 py-2"
                            id="streaming-channel"
                        >
                            {selected ? selected : "Select channel"}
                            <ChevronsUpDown className="pl-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-full p-0 bg-[#222222] border-[#333333] text-white">
                        <Command>
                            <CommandInput placeholder="Search channel..." className="px-4 py-2" />
                            <CommandList>
                                <CommandEmpty>No channel found.</CommandEmpty>
                                <CommandGroup>
                                    {channels.map((channel) => (
                                        <CommandItem
                                            key={channel}
                                            value={channel}
                                            onSelect={(currentValue) => {
                                                setSelected(currentValue === selected ? "" : currentValue);
                                                setOpen(false);
                                            }}
                                            className="cursor-pointer px-4 py-2"
                                        >
                                            <Check
                                                className={cn(
                                                    "mr-2 h-4 w-4",
                                                    selected === channel ? "opacity-100" : "opacity-0"
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
            {/* Add more streaming status-specific configurations here */}
        </div>
    );
}
