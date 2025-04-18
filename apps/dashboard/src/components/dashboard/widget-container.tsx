import { layoutAtom } from "@/lib/atoms/layoutAtom";
import { layoutClassMap } from "@/lib/static";
import { cn } from "@/lib/utils";
import { useAtomValue } from "jotai";
import React from "react";

const baseClassName = "flex-1 h-full w-full overflow-hidden grid gap-2";

export function WidgetContainer() {
  const layout = useAtomValue(layoutAtom);

  const paneClassName = layoutClassMap[layout.name];

  return (
    <div className={cn(baseClassName, paneClassName)}>
      {Array(8)
        .fill(0)
        .map((_, index) => (
          <div key={index} className="bg-[#333]"></div>
        ))}
    </div>
  );
}
