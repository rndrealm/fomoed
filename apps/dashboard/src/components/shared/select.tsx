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

interface IProps {
  options: {
    label: string;
    value: string;
  }[];
  value: string;
  setValue: (value: string) => void;
  placeholder?: string;
  label?: string;
}

export function SelectComp(props: IProps) {
  const { options, placeholder = "Select", label, value, setValue } = props;
  return (
    <Select value={value} onValueChange={setValue}>
      <RenderIf condition={!!label}>
        <Label className="pb-1 text-white">{label}</Label>
      </RenderIf>
      <SelectTrigger className="w-full bg-white">
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          {options.map((option, i) => (
            <SelectItem key={i} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}
