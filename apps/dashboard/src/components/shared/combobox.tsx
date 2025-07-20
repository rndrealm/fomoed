"use client";

import * as React from "react";
import { Check, ChevronsUpDown } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { RenderIf } from "./render-if";
import { Label } from "../ui/label";
import Image from "next/image";
import dashboard from "@/lib/assets/dashboard";

interface IProps {
  options: {
    value: string;
    label: string;
  }[];
  value: string;
  setValue: (value: string) => void;
  emptySearch?: string;
  emptySelect?: string;
  inputPlaceholder?: string;
  label?: string;
  triggerClassName?: string;
}

export function ComboboxComp(props: IProps) {
  const {
    options,
    value,
    setValue,
    emptySearch = "Select...",
    emptySelect = "Select",
    inputPlaceholder,
    label,
    triggerClassName,
  } = props;
  const [open, setOpen] = React.useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <RenderIf condition={!!label}>
        <Label className="pb-1 text-white">{label}</Label>
      </RenderIf>
      <PopoverTrigger asChild className={cn("", triggerClassName)}>
        <Button variant="outline" role="combobox" aria-expanded={open}>
          {value ? options.find((option) => option.value === value)?.label : emptySearch}
          <ChevronsUpDown className="text-[#71717a] opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full border-none bg-[#090909] p-2">
        <Command className="max-h-[200px] w-56 rounded-none bg-[#090909]">
          <CommandInput placeholder={inputPlaceholder} className="h-9 bg-[#121212] text-white" />
          <CommandList className="mt-2">
            <CommandEmpty className="p-2 text-xs text-white">{emptySelect}</CommandEmpty>
            <CommandGroup>
              {options.map((option) => (
                <CommandItem
                  key={option.value}
                  value={option.value}
                  onSelect={(currentValue) => {
                    setValue(currentValue === value ? "" : currentValue);
                    setOpen(false);
                  }}
                  className="data-[selected=true]:bg-widget-background flex items-center justify-between px-4 text-white focus:text-white data-[selected=true]:text-white"
                >
                  <p className="font-inter text-xs">{option.label}</p>
                  {/* <Check className={cn("ml-auto", value === option.value ? "opacity-100" : "opacity-0")} /> */}
                  {option.value === value ? (
                    <div>
                      <Image src={dashboard.checkV2} alt="Selected icon" width={12} height={12} />
                    </div>
                  ) : null}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
