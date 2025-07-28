import * as React from "react";

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RenderIf } from "./render-if";
import { Label } from "../ui/label";
import { cn } from "@/lib/utils";

interface IProps {
  options: {
    label: string;
    value: string;
  }[];
  value: string;
  setValue: (value: string) => void;
  placeholder?: string;
  label?: string;
  triggerClassName?: string;
}

export function SelectComp(props: IProps) {
  const { options, placeholder = "Select", label, value, setValue, triggerClassName } = props;
  return (
    <Select value={value} onValueChange={setValue}>
      <RenderIf condition={!!label}>
        <Label className="pb-1 text-white">{label}</Label>
      </RenderIf>
      <SelectTrigger className={cn("w-full bg-white", triggerClassName)}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent className="bg-[#090909]">
        <SelectGroup className="h-[160px]">
          {options.map((option, i) => (
            <SelectItem key={i} value={option.value} className="focus:bg-widget-background text-white focus:text-white">
              {option.label}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}
