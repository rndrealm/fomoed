import React, { Fragment, useMemo, useState } from "react";
import Image from "next/image";
import widgetsPreview from "@/lib/assets/widgetsPreview";
import { widgetPreviewData, WidgetPreviewItem } from "@/lib/static";
import SearchIcon from "../icons/SearchIcon";
import { Input } from "../ui/input";
import { Close, SpotlightSearch } from "../icons/icons";
import { useDebounce } from "@/hooks/useDebounce";
import { RenderIf } from "../shared";

interface IProps {
  handleClose: () => void;
}

const sizeMap = {
  sm: {
    maxWidth: 235,
    aspectRatio: 1,
  },
  md: {
    maxWidth: 297,
    aspectRatio: 297 / 221,
  },
  lg: {
    maxWidth: 454,
    aspectRatio: 454 / 221,
  },
};

interface IWidgetsPreviewItem {
  data: WidgetPreviewItem;
}

function WidgetsPreviewItem(props: IWidgetsPreviewItem) {
  const { data } = props;

  return (
    <button type="button">
      <div
        className="flex flex-col justify-between gap-3"
        style={{
          maxWidth: `${sizeMap[data?.size].maxWidth}px`,
          // maxWidth: "454px",
        }}
      >
        <div className="w-full flex-1 overflow-hidden rounded-[20px]">
          <Image
            src={data?.img}
            alt="preview"
            style={
              {
                // width: "100%",
                // height: "100%",
                // objectFit: "cover",
              }
            }
          />
        </div>

        <div className="flex max-w-[235px] flex-col gap-2">
          <p className="text-left text-[13px] leading-[18px] font-semibold text-white">{data?.name}</p>
          <p className="text-left text-xs leading-[16px] text-[#BABABA]">{data?.descripton}</p>
        </div>
      </div>
    </button>
  );
}

function EmptyState() {
  return (
    <div className="rounded-xl bg-[#1D1D1D] px-4 py-3">
      <div className="flex gap-1">
        <div className="flex h-[20px] w-[20px] items-center justify-center">
          <SpotlightSearch />
        </div>

        <div className="flex flex-col">
          <p className="text-[13px] leading-[18px] font-semibold text-[#737373]">Widget to end all widgets</p>

          <p className="text-xs leading-[16px] text-[#737373]">No Results</p>
        </div>
      </div>
    </div>
  );
}

export function WidgetsPreview(props: IProps) {
  const { handleClose } = props;

  const [searchValue, setSearchValue] = useState("");
  const debouncedSearch = useDebounce(searchValue, 200);

  const filtrerdOptions = useMemo(() => {
    if (!debouncedSearch) return widgetPreviewData;

    const lowerSearch = debouncedSearch.toLowerCase();

    return widgetPreviewData
      .map((group) => {
        const filteredOptions = group.options.filter((opt) => {
          return (
            opt.name.toLowerCase().includes(lowerSearch) ||
            opt.slug.toLowerCase().includes(lowerSearch) ||
            opt.descripton.toLowerCase().includes(lowerSearch)
          );
        });

        if (filteredOptions.length === 0) return null;

        return {
          ...group,
          options: filteredOptions,
        };
      })
      .filter(Boolean);
  }, [debouncedSearch]);

  return (
    <div className="flex flex-col gap-4 overflow-hidden pt-8">
      <div className="flex items-center justify-between gap-4 px-4 sm:px-4 md:px-6 lg:px-7 xl:px-[96px]">
        <div className="hidden h-[32px] w-[32px] sm:block"></div>

        <div className="relative w-full flex-1 sm:max-w-[256px]">
          <span className="absolute top-[50%] left-[16px] -translate-y-1/2">
            <SearchIcon />
          </span>
          <Input
            placeholder="Search Widgets"
            className="h-[45px] w-full rounded-[12px] border border-none border-white/10 bg-[#1D1D1D] py-[1px] pr-[9px] pl-9 text-sm text-white transition-all placeholder:text-white/40 focus:shadow-none focus:ring-0 focus:ring-offset-0 focus:outline-none focus-visible:ring-0 [&:focus]:outline-none [&:focus-visible]:outline-none"
            name="search"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
          />
        </div>

        <button
          className="flex h-[32px] w-[32px] items-center justify-center rounded-lg bg-[#373737]"
          type="button"
          onClick={handleClose}
        >
          <Close />
        </button>
      </div>
      <div className="scrollbar flex flex-1 flex-col gap-12 overflow-y-auto px-4 pt-4 pb-[96px] sm:px-4 md:px-6 lg:px-7 xl:px-[96px]">
        <RenderIf condition={filtrerdOptions.length === 0}>
          <EmptyState />
        </RenderIf>

        <RenderIf condition={filtrerdOptions.length !== 0}>
          {filtrerdOptions?.map((item) => {
            return (
              <div key={item?.id} className="flex flex-col gap-6">
                <p className="text-sm leading-[1] text-white">{item?.group}</p>

                <div className="justify-betwee flex flex-wrap gap-2 sm:gap-4 md:gap-5 xl:gap-[48px]">
                  {/* <div className="grid grid-cols-3 gap-4 sm:gap-4 md:gap-5 xl:gap-[48px]"> */}
                  {item?.options?.map((widget) => {
                    return <WidgetsPreviewItem key={widget?.id} data={widget} />;
                  })}
                </div>
              </div>
            );
          })}
        </RenderIf>
      </div>
    </div>
  );
}
