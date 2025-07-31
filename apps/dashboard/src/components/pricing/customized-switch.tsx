"use client";

import * as React from "react";
import * as SwitchPrimitive from "@radix-ui/react-switch";

import { cn } from "@/lib/utils";

function CustomizedSwitch({ className, ...props }: React.ComponentProps<typeof SwitchPrimitive.Root>) {
    return (
        <SwitchPrimitive.Root
            data-slot="switch"
            className={cn(
                "peer data-[state=checked]:bg-[#232323] data-[state=unchecked]:bg-[#232323] focus-visible:border-ring focus-visible:ring-ring/50 dark:data-[state=unchecked]:bg-input/80 inline-flex h-[1.4rem] w-10 shrink-0 items-center rounded-[12px] border border-transparent shadow-xs transition-all outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50",
                className
            )}
            {...props}
        >
            <SwitchPrimitive.Thumb
                data-slot="switch-thumb"
                className={cn(
                    "bg-[#535353] dark:data-[state=unchecked]:bg-foreground dark:data-[state=checked]:bg-primary-foreground pointer-events-none block size-4 rounded-[8px] ring-0 transition-transform data-[state=checked]:translate-x-[calc(100%+3px)] data-[state=unchecked]:translate-x-[2px]"
                )}
            />
        </SwitchPrimitive.Root>

    );
}

export { CustomizedSwitch };

