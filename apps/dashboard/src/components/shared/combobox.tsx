"use client";

import * as React from "react";
import { Check, ChevronsUpDown } from "lucide-react";

import { cn } from "@/lib/utils";
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
import { RenderIf } from "./render-if";
import { Label } from "../ui/label";

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
  } = props;
  const [open, setOpen] = React.useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <RenderIf condition={!!label}>
        <Label className="pb-1 text-white">{label}</Label>
      </RenderIf>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="justify-between w-full"
        >
          {value
            ? options.find((option) => option.value === value)?.label
            : emptySearch}
          <ChevronsUpDown className="opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0">
        <Command>
          <CommandInput placeholder={inputPlaceholder} className="h-9" />
          <CommandList>
            <CommandEmpty>{emptySelect}</CommandEmpty>
            <CommandGroup>
              {options.map((option) => (
                <CommandItem
                  key={option.value}
                  value={option.value}
                  onSelect={(currentValue) => {
                    setValue(currentValue === value ? "" : currentValue);
                    setOpen(false);
                  }}
                >
                  {option.label}
                  <Check
                    className={cn(
                      "ml-auto",
                      value === option.value ? "opacity-100" : "opacity-0"
                    )}
                  />
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
