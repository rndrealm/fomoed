import React, { useMemo, useState } from "react";
import SearchIcon from "../icons/SearchIcon";
import { Input } from "../ui/input";
import { QuickWidgetItem } from "./quick-widget-item";
import { layoutOptionsMap } from "@/lib/static";
import { RenderIf } from "../shared";
import Image from "next/image";
import dashboard from "@/lib/assets/dashboard";

interface IProps {
  handleBack?: () => void;
}

export function QuickWidgets(props: IProps) {
  const [searchValue, setSearchValue] = useState("");
  const filteredWidget = useMemo(() => {
    if (!searchValue) return layoutOptionsMap;
    return layoutOptionsMap.filter((widget) => {
      const name = widget.name.toLowerCase();
      const search = searchValue.toLowerCase();
      return name.includes(search);
    });
  }, [searchValue]);
  const { handleBack } = props;
  return (
    <div className="flex items-center justify-center w-full h-full overflow-hidden">
      <div className="max-w-[732px] h-full w-full bg-[#090909] rounded-2xl overflow-hidden border border-[#121212] flex flex-col">
        <div className="flex items-center bg-[#0b0b0b]">
          <div className="relative flex-1">
            <span className="absolute left-[16px] top-[50%] -translate-y-1/2">
              <SearchIcon />
            </span>
            <Input
              placeholder="Search Widgets"
              className="h-[56px] pl-9 pr-[9px] py-[1px] rounded-[4px] border border-white/10 text-sm placeholder:text-white/40 bg-transparent text-white focus:outline-none focus:ring-0 focus:ring-offset-0 focus:shadow-none [&:focus-visible]:outline-none [&:focus]:outline-none transition-all w-full border-none focus-visible:ring-0"
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
            />
          </div>

          <button
            type="button"
            className="bg-[#111] text-[#7a7a7a] text-xs leading-[1.5] border border-[#161616] rounded-sm py-[2px] px-2 mx-4"
            onClick={handleBack}
          >
            Back
          </button>
        </div>
        <div className="p-4 border-t border-[#121212] flex-1 flex flex-col gap-[10px] h-full w-full">
          <p className="text-[#7d7d7d] leading-[1.33] font-semibold text-xs">
            Quick Widgets
          </p>

          <RenderIf condition={filteredWidget.length === 0}>
            <div className="max-w-[16.25rem] mx-auto h-full flex items-center">
              <div>
                <div className="mb-7">
                  <Image src={dashboard.layout} alt="layout" />
                </div>
                <p className="text-[#9A9E9E] text-sm font-medium text-center font-sans">
                  We currently do not support that widget
                </p>
              </div>
            </div>
          </RenderIf>
          <RenderIf condition={filteredWidget.length > 0}>
            <div className="h-full w-full grid grid-cols-2 flex-1 overflow-auto gap-x-2 gap-y-3 pb-[50px]">
              {filteredWidget.map((widget, index) => (
                <QuickWidgetItem key={index} widget={widget} />
              ))}
            </div>
          </RenderIf>
        </div>
      </div>
    </div>
  );
}
