import React, { useMemo, useState } from "react";
import SearchIcon from "../icons/SearchIcon";
import { Input } from "../ui/input";
import { QuickWidgetItem } from "./quick-widget-item";
import { layoutOptionsMap } from "@/lib/static";
import { RenderIf } from "../shared";
import Image from "next/image";
import dashboard from "@/lib/assets/dashboard";
import { cn } from "@/lib/utils";
import { useAtomValue } from "jotai";
import { settingAtom } from "@/lib/atoms/settingsAtom";

const categoriesOptions = [
  { id: 1, label: "All", value: "all" },
  { id: 4, label: "New", value: "new" },
  { id: 2, label: "Charts", value: "charts" },
  { id: 3, label: "News", value: "news" },
  { id: 5, label: "Favorite", value: "favorite" },
  // { id: 4, label: "Custom Widgets", value: "custom-widgets" },
];

interface IProps {
  handleBack?: () => void;
}

export function QuickWidgets(props: IProps) {
  const { handleBack = () => {} } = props;

  const settings = useAtomValue(settingAtom);

  const [selectedTag, setSelectedTag] = useState(categoriesOptions[0].value);
  const [searchValue, setSearchValue] = useState("");

  const filteredWidget = useMemo(() => {
    if (!searchValue && selectedTag === "all") return layoutOptionsMap;

    const fillFavoriteWidgetOptions = settings.favorite_widgets.map((slug) => {
      const findWidget = layoutOptionsMap.find((ln) => ln.slug === slug)!;
      return findWidget;
    });

    if (selectedTag === "favorite") {
      return fillFavoriteWidgetOptions.filter((widget) => {
        const name = widget.name.toLowerCase();
        return name.includes(searchValue.toLowerCase());
      });
    }

    return layoutOptionsMap.filter((widget) => {
      const name = widget.name.toLowerCase();
      const tags = widget.tags;
      // const category = widget.category.toLowerCase();
      const search = searchValue.toLowerCase();

      return (
        name.includes(search) &&
        (tags.includes(selectedTag) || selectedTag === "all")
      );
    });
  }, [searchValue, selectedTag, settings.favorite_widgets]);

  return (
    <div
      className="flex items-center justify-center w-full h-full overflow-hidden"
      id="second-step"
    >
      <div className="max-w-[732px] h-full w-full bg-[#090909] rounded-2xl overflow-hidden border border-[#333] flex flex-col gap-6">
        <div className="flex items-center bg-[#0b0b0b] border-b border-[#121212]">
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
        <div className="flex items-center gap-1 px-4">
          {categoriesOptions.map((item) => {
            const active = selectedTag === item.value;
            return (
              <button
                key={item.id}
                type="button"
                className={cn(
                  "text-xs font-medium leading-[18px] py-[5px] px-[9px]",
                  active
                    ? "text-white bg-[#1D1D1D] rounded-md"
                    : "text-[#7a7a7a]"
                )}
                onClick={() => {
                  setSelectedTag(item.value);
                }}
              >
                {item.label}
              </button>
            );
          })}
        </div>
        <div className="px-4 pb-4 flex-1 flex flex-col gap-[10px] h-full w-full min-h-0">
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
                  We can’t find your widget.
                </p>
              </div>
            </div>
          </RenderIf>
          <RenderIf condition={filteredWidget.length > 0}>
            <div className="grid min-h-0 grid-cols-1 overflow-auto sm:grid-cols-2 gap-x-2 gap-y-4 scrollbar">
              {filteredWidget.map((widget, index) => (
                <QuickWidgetItem
                  tag={selectedTag}
                  key={index}
                  widget={widget}
                  handleGoBack={handleBack}
                />
              ))}
            </div>
          </RenderIf>
        </div>
      </div>
    </div>
  );
}
