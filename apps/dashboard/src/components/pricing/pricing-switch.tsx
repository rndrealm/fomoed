import React from "react";
import { CustomizedSwitch } from "@/components/ui/customized-switch";
import { Label } from "../ui/label";
import { cn } from "@/lib/utils";

interface IPricingSwitch {
    name: string;
    label: string[];
    labelClassName?: string;
    setSwitchActive: React.Dispatch<React.SetStateAction<boolean>>;
}

const PricingSwitch = (props: IPricingSwitch) => {
    const { name, label, labelClassName, setSwitchActive } = props;
    return (
        <div className="flex items-center space-x-3">
            <Label htmlFor={name} className={cn(labelClassName)}>
                {label[0]}
            </Label>
            <CustomizedSwitch id={name} className="rounded-md bg-[#535353]" onCheckedChange={setSwitchActive} />
            <Label htmlFor={name} className={cn(labelClassName)}>
                {label[1]}
            </Label>
        </div>
    );
};

export default PricingSwitch;
