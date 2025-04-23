import React from "react";
import { Switch } from "../ui/switch";
import { Label } from "../ui/label";
import { cn } from "@/lib/utils";

interface IPricingSwitch {
  name: string;
  label: string;
  labelClassName?: string;
}

const PricingSwitch = (props: IPricingSwitch) => {
  const { name, label, labelClassName } = props;
  return (
    <div className="flex items-center space-x-2">
      <Switch id={name} className="rounded-md bg-[#535353]" />
      <Label htmlFor={name} className={cn(labelClassName)}>
        {label}
      </Label>
    </div>
  );
};

export default PricingSwitch;
