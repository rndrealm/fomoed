import React, { useMemo, useRef, useState } from "react";
import SearchIcon from "../icons/SearchIcon";
import { Input } from "../ui/input";
import { QuickWidgetItem } from "./quick-widget-item";
import {
  layoutOptionsMap,
  LayoutOptionType,
  widgetPropsDefaults,
} from "@/lib/static";
import { RenderIf } from "../shared";
import Image from "next/image";
import dashboard from "@/lib/assets/dashboard";
import { cn, joinWidgetSlug, maxTabsByPlan } from "@/lib/utils";
import { useAtomValue, useSetAtom } from "jotai";
import { settingAtom } from "@/lib/atoms/settingsAtom";
import { v4 as uuidv4 } from "uuid";

import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { CommunityIcon } from "../icons/icons";
import CloseIcon from "../icons/CloseIcon";
import {
  addWidgetToExistingLayoutAtom,
  addWidgetToNewLayoutAtom,
  layoutAtom,
} from "@/lib/atoms/layoutAtom";
import { activeTabAtom } from "@/lib/atoms/tabsAtom";
import { useGetUserPlans } from "@/services/queries/subscriptions";
import { getGridPosition } from "@/charts/helpers";
import { track } from "@vercel/analytics";
import PlusIcon from "../icons/PlusIcon";
import Star from "../icons/Star";

const categoriesOptions = [
  { id: 1, label: "All", value: "all" },
  { id: 4, label: "New", value: "new" },
  { id: 2, label: "Charts", value: "charts" },
  { id: 3, label: "News", value: "news" },
  { id: 6, label: "Games", value: "games" },
  { id: 5, label: "Favorite", value: "favorite" },
  // { id: 4, label: "Custom Widgets", value: "custom-widgets" },
];

const textCategoryContent = ["Charts", "BTC", "News"];

interface IProps {
  handleBack?: () => void;
}

export function QuickWidgets(props: IProps) {
  const { handleBack = () => {} } = props;

  const settings = useAtomValue(settingAtom);

  const [selectedTag, setSelectedTag] = useState(categoriesOptions[0].value);
  const [searchValue, setSearchValue] = useState("");
  const [isWidgetClicked, setIsWidgetClicked] = useState(false);

  const filteredWidget = useMemo(() => {
    if (!searchValue && selectedTag === "all") return layoutOptionsMap;

    const fillFavoriteWidgetOptions = settings.favorite_widgets.map((slug) => {
      const findWidget = layoutOptionsMap.find((ln) => ln.slug === slug)!;
      return findWidget;
    });

    if (selectedTag === "favorite") {
      return fillFavoriteWidgetOptions.filter((widget) => {
        if (widget === undefined) return false;

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

  const layouts = useAtomValue(layoutAtom);
  const activeTab = useAtomValue(activeTabAtom);
  const addWidgetToNewLayout = useSetAtom(addWidgetToNewLayoutAtom);
  const dashboardSetting = useAtomValue(settingAtom);
  const addWidgetToExistingLayout = useSetAtom(addWidgetToExistingLayoutAtom);

  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  const { data } = useGetUserPlans();

  const isClicked = useRef(false);

  const handleWidgetClick = (widget: LayoutOptionType[0]) => {
    isClicked.current = true;
    const currLayoutId = activeTab.layout_id;
    const currLayout = layouts.find((item) => item.id === currLayoutId);

    const { x, y } = getGridPosition(currLayout?.widgets.length || 0);
    const newId = uuidv4();
    const widgetDefaults =
      widgetPropsDefaults[widget.slug as keyof typeof widgetPropsDefaults];
    const defaultWAndH = widgetDefaults.meta || { w: 3, h: 2 };
    const newWidget = {
      id: newId,
      props: widgetDefaults,
      meta: {
        i: joinWidgetSlug(newId, widget.slug),
        x,
        y,
        ...defaultWAndH,
      },
    };

    // Check if the current layout id on active tab is null or undefined
    const syncCondition = dashboardSetting.auto_save || currLayout?.draft;

    if (currLayoutId) {
      addWidgetToExistingLayout({
        widget: newWidget,
        layoutId: currLayoutId,
        sync: syncCondition,
      });
    } else {
      const planType = data?.planType || "FREE"; // Default to FREE if not set
      const maxTabs = maxTabsByPlan[planType] || 3;
      if (layouts.length >= maxTabs) {
        setShowUpgradeModal(true);
        return;
      }
      addWidgetToNewLayout({ newWidget });
    }
    track("widget_added", {
      widget: widget.slug,
      planType: data?.planType || "FREE",
    });
    handleBack();
    isClicked.current = false;
    // if (tour.currentStep === 1) {
    //   tour.setCurrentStep(tour.currentStep + 1);
    // }
  };

  return (
    // <div
    //   className="flex items-center justify-center w-full h-full overflow-hidden"
    //   id="second-step"
    // >
    //   <div className="max-w-[732px] h-full w-full bg-[#090909] rounded-2xl overflow-hidden border border-[#333] flex flex-col gap-6">
    //     <div className="flex items-center bg-[#0b0b0b] border-b border-[#121212]">
    //       <div className="relative flex-1">
    //         <span className="absolute left-[16px] top-[50%] -translate-y-1/2">
    //           <SearchIcon />
    //         </span>
    //         <Input
    //           placeholder="Search Widgets"
    //           className="h-[56px] pl-9 pr-[9px] py-[1px] rounded-[4px] border border-white/10 text-sm placeholder:text-white/40 bg-transparent text-white focus:outline-none focus:ring-0 focus:ring-offset-0 focus:shadow-none [&:focus-visible]:outline-none [&:focus]:outline-none transition-all w-full border-none focus-visible:ring-0"
    //           value={searchValue}
    //           onChange={(e) => setSearchValue(e.target.value)}
    //         />
    //       </div>

    //       <button
    //         type="button"
    //         className="bg-[#111] text-[#7a7a7a] text-xs leading-[1.5] border border-[#161616] rounded-sm py-[2px] px-2 mx-4"
    //         onClick={handleBack}
    //       >
    //         Back
    //       </button>
    //     </div>
    //     <div className="flex items-center gap-1 px-4">
    //       {categoriesOptions.map((item) => {
    //         const active = selectedTag === item.value;
    //         return (
    //           <button
    //             key={item.id}
    //             type="button"
    //             className={cn(
    //               "text-xs font-medium leading-[18px] py-[5px] px-[9px]",
    //               active
    //                 ? "text-white bg-[#1D1D1D] rounded-md"
    //                 : "text-[#7a7a7a]",
    //             )}
    //             onClick={() => {
    //               setSelectedTag(item.value);
    //             }}
    //           >
    //             {item.label}
    //           </button>
    //         );
    //       })}
    //     </div>
    //     <div className="px-4 pb-4 flex-1 flex flex-col gap-[10px] h-full w-full min-h-0">
    //       <p className="text-[#7d7d7d] leading-[1.33] font-semibold text-xs">
    //         Quick Widgets
    //       </p>

    //       <RenderIf condition={filteredWidget.length === 0}>
    //         <div className="max-w-[16.25rem] mx-auto h-full flex items-center">
    //           <div>
    //             <div className="mb-7">
    //               <Image src={dashboard.layout} alt="layout" />
    //             </div>
    //             <p className="text-[#9A9E9E] text-sm font-medium text-center font-sans">
    //               We can’t find your widget.
    //             </p>
    //           </div>
    //         </div>
    //       </RenderIf>
    //       <RenderIf condition={filteredWidget.length > 0}>
    //         <div className="grid min-h-0 grid-cols-1 overflow-auto sm:grid-cols-2 gap-x-2 gap-y-4 scrollbar">
    //           {filteredWidget.map((widget, index) => (
    //             <QuickWidgetItem
    //               tag={selectedTag}
    //               key={index}
    //               widget={widget}
    //               handleGoBack={handleBack}
    //             />
    //           ))}
    //         </div>
    //       </RenderIf>
    //     </div>
    //   </div>
    // </div>
    <Command
      style={{ backdropFilter: "blur(18px)" }}
      className="bg-[#101113B2] rounded-[40px] py-8"
    >
      <div className="relative h-full w-full flex flex-col justify-start items-center gap-8">
        {/* opacity thing */}

        <div className="absolute z-10 bottom-16 left-0 w-full h-24 bg-gradient-to-b from-transparent to-black/100 pointer-events-none"></div>

        <div className="w-full flex flex-col gap-10">
          {/* Search top thing */}
          <div className="relative w-full px-18 flex items-center justify-center">
            <div className="flex flex-row gap-4 justify-between items-center">
              <div className="w-[256px] px-4 py-1.5 relative bg-[#1D1D1D] rounded-[12px]">
                <span className="absolute left-[16px] top-[53%] -translate-y-1/2">
                  <SearchSvgIcon />
                </span>
                <Input
                  placeholder="Search Widget"
                  className=" pl-6 pr-[9px] py-[1px] text-sm placeholder:text-[#737373] placeholder:font-semibold bg-transparent text-white focus:outline-none focus:ring-0 focus:ring-offset-0 focus:shadow-none [&:focus-visible]:outline-none [&:focus]:outline-none transition-all w-full border-none focus-visible:ring-0"
                  value={searchValue}
                  onChange={(e) => setSearchValue(e.target.value)}
                />
              </div>
              {/* <button className="h-[44px] aspect-square flex items-center justify-center bg-[#1D1D1D] rounded-[8px]">
                <CommunityIcon color="#5F5F5F" />
              </button> */}
            </div>

            <div className="h-[32px] bg-gradient-widget-preview-button aspect-square border-[1px] border-[#353535] rounded-[8px] absolute top-0 right-18 translate-x-1/2 flex items-center justify-center">
              <button
                type="button"
                className="scale-[0.825]"
                onClick={handleBack}
              >
                <CloseIcon color="#fff" />
              </button>
            </div>
          </div>

          {/* Categories */}
          <div className="flex items-center gap-2.5 px-8 xl:px-16">
            {categoriesOptions.map((item) => {
              const active = selectedTag === item.value;
              return (
                <button
                  key={item.id}
                  type="button"
                  className={cn(
                    "text-xs font-semibold px-3 py-2 rounded-[34px]",
                    active
                      ? "text-[#737373] bg-[#fff]"
                      : "text-[#737373] bg-[#1D1D1D]",
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
        </div>

        {/* widget grid */}
        <CommandList className="h-[70%] scrollbar max-h-full min-w-full px-8 xl:px-16 focus:outline-hidden pb-4">
          <div className="flex flex-col gap-8">
            <h2 className="text-white text-base font-medium">
              Suggested Widgets
            </h2>

            <div className="grid min-w-full min-h-0 grid-cols-1 overflow-auto md:grid-cols-2 xl:grid-cols-3 gap-x-8 gap-y-8">
              {filteredWidget.map((widget, index) => {
                //every index of element that comes after third element
                const indexTarget = index % 3 === 0 && index !== 0;

                //every second row starting from the second
                const rowTarget = (index / 3 - 1) * 2 + 2;

                return (
                  <>
                    {/* text element */}
                    {indexTarget && (
                      <div
                        key={index}
                        className={`hidden xl:block w-full col-span-3 max-w-[17rem] row-start-[${rowTarget}]`}
                      >
                        <h2 className="text-white text-base font-medium">
                          {textCategoryContent[index / 3 - 1]}
                        </h2>
                      </div>
                    )}

                    {/* widget cell */}
                    <CommandGroup
                      key={widget.slug}
                      className="relative min-h-fit aspect-square rounded-[24px] p-0"
                    >
                      <CommandItem
                        key={widget.name}
                        className="min-h-fit aspect-square bg-[#28282866] data-[selected=true]:bg-[#27292E] rounded-[24px] p-0 overflow-hidden cursor-pointer"
                        onSelect={(e) => {
                          // console.log("gggg", e);
                          handleWidgetClick(widget);
                        }}
                      >
                        <QuickWidgetItem
                          tag={selectedTag}
                          key={widget.id}
                          widget={widget}
                          handleGoBack={handleBack}
                        />
                      </CommandItem>

                      {/* button for favourites */}
                      <div
                        style={{ background: "transparent", borderWidth: 0 }}
                        className="absolute bg-gradient-widget-preview-button z-[100] top-6 right-6 h-[24px] aspect-square border-[1px] border-[#353535] rounded-[6px] flex items-center justify-center"
                      >
                        <button
                          type="button"
                          className="scale-[0.875]"
                          // onClick={handleBack}
                        >
                          {/* <PlusIcon fill="#fff" /> */}
                          <Star fill="#fff" />
                        </button>
                      </div>
                    </CommandGroup>
                  </>
                );
              })}
            </div>
          </div>
        </CommandList>
      </div>
    </Command>
  );
}

const SearchSvgIcon = () => {
  return (
    <svg
      width="15"
      height="14"
      viewBox="0 0 15 14"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M13.4375 14L8.45833 9.02083C8.04167 9.32639 7.58479 9.56597 7.08771 9.73958C6.59062 9.91319 6.0616 10 5.50063 10C4.11132 10 2.93056 9.51389 1.95833 8.54167C0.986111 7.56944 0.5 6.38889 0.5 5C0.5 3.61111 0.986111 2.43056 1.95833 1.45833C2.93056 0.486111 4.11111 0 5.5 0C6.88889 0 8.06944 0.486111 9.04167 1.45833C10.0139 2.43056 10.5 3.61132 10.5 5.00063C10.5 5.5616 10.4132 6.09062 10.2396 6.58771C10.066 7.08479 9.82639 7.54167 9.52083 7.95833L14.5 12.9375L13.4375 14ZM5.5 8.5C6.47222 8.5 7.29861 8.15972 7.97917 7.47917C8.65972 6.79861 9 5.97222 9 5C9 4.02778 8.65972 3.20139 7.97917 2.52083C7.29861 1.84028 6.47222 1.5 5.5 1.5C4.52778 1.5 3.70139 1.84028 3.02083 2.52083C2.34028 3.20139 2 4.02778 2 5C2 5.97222 2.34028 6.79861 3.02083 7.47917C3.70139 8.15972 4.52778 8.5 5.5 8.5Z"
        fill="white"
      />
    </svg>
  );
};
