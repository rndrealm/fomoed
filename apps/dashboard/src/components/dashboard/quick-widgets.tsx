import React, { useMemo, useRef, useState } from "react";
import SearchIcon from "../icons/SearchIcon";
import { Input } from "../ui/input";
import { QuickWidgetItem } from "./quick-widget-item";
import { layoutOptionsMap, LayoutOptionType, widgetPropsDefaults } from "@/lib/static";
import { RenderIf } from "../shared";
import Image from "next/image";
import dashboard from "@/lib/assets/dashboard";
import { cn, joinWidgetSlug, maxTabsByPlan } from "@/lib/utils";
import { useAtomValue, useSetAtom } from "jotai";
import { settingAtom, updateSettingAtom } from "@/lib/atoms/settingsAtom";
import { v4 as uuidv4 } from "uuid";

import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { CommunityIcon } from "../icons/icons";
import CloseIcon from "../icons/CloseIcon";
import { addWidgetToExistingLayoutAtom, addWidgetToNewLayoutAtom, layoutAtom } from "@/lib/atoms/layoutAtom";
import { activeTabAtom } from "@/lib/atoms/tabsAtom";
import { useGetUserPlans } from "@/services/queries/subscriptions";
import { getGridPosition } from "@/charts/helpers";
import { track } from "@vercel/analytics";
import PlusIcon from "../icons/PlusIcon";
import Star from "../icons/Star";
import StarFilled from "../icons/StarFilled";
import { motion, useAnimate } from "motion/react";

const categoriesOptions = [
  { id: 1, label: "All", value: "all" },
  { id: 4, label: "New", value: "new" },
  { id: 2, label: "Charts", value: "charts" },
  { id: 3, label: "News", value: "news" },
  { id: 6, label: "Games", value: "games" },
  { id: 5, label: "Favorite", value: "favorite" },
  // { id: 4, label: "Custom Widgets", value: "custom-widgets" },
];

const textCategoryContent = ["Charts", "BTC", "News", "Others"];

interface IProps {
  handleBack?: () => void;
}

export function QuickWidgets(props: IProps) {
  const { handleBack = () => {} } = props;

  const settings = useAtomValue(settingAtom);

  const [selectedTag, setSelectedTag] = useState(categoriesOptions[0].value);
  const [searchValue, setSearchValue] = useState("");

  const filteredWidget = useMemo(() => {
    const filteredDefaultWidgetLayout = [...layoutOptionsMap].sort((a, b) => {
      const showIdA = a.showId ?? 99;
      const showIdB = b.showId ?? 8999;
      return showIdA - showIdB;
    });

    // return the default widget layout for the modal
    if (!searchValue && selectedTag === "all") return filteredDefaultWidgetLayout;

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

      return name.includes(search) && (tags.includes(selectedTag) || selectedTag === "all");
    });
  }, [searchValue, selectedTag, settings.favorite_widgets]);

  const layouts = useAtomValue(layoutAtom);
  const activeTab = useAtomValue(activeTabAtom);
  const addWidgetToNewLayout = useSetAtom(addWidgetToNewLayoutAtom);
  const dashboardSetting = useAtomValue(settingAtom);
  const addWidgetToExistingLayout = useSetAtom(addWidgetToExistingLayoutAtom);

  const updateSettings = useSetAtom(updateSettingAtom);

  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  const { data } = useGetUserPlans();

  const isClicked = useRef(false);

  const handleWidgetClick = (widget: LayoutOptionType[0]) => {
    isClicked.current = true;
    const currLayoutId = activeTab.layout_id;
    const currLayout = layouts.find((item) => item.id === currLayoutId);

    const { x, y } = getGridPosition(currLayout?.widgets.length || 0);
    const newId = uuidv4();
    const widgetDefaults = widgetPropsDefaults[widget.slug as keyof typeof widgetPropsDefaults];
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

  const variants = {
    default: {
      scale: 1,
      transition: { ease: [0.4, 0, 0.2, 1], duration: 0.125 },
    },
    small: {
      scale: 0.825,
      transition: { ease: [0.4, 0, 0.2, 1], duration: 0.175 },
    },
  };

  return (
    <Command style={{ backdropFilter: "blur(24px)" }} className="bg-[#1011139a] rounded-[40px] py-8">
      <div className="relative h-full w-full flex flex-col justify-start items-center gap-8">
        {/* bottom opacity thing */}
        <div className="absolute z-10 bottom-16 left-0 w-full h-24 bg-gradient-to-b from-transparent to-black/100 pointer-events-none"></div>

        <div className="w-full flex flex-col gap-10">
          {/* Search top thing */}
          <div className="relative w-full px-18 flex items-center justify-center">
            <div className="flex flex-row gap-4 justify-between items-center">
              <div className="w-[256px] px-4 py-1.5 relative bg-[#1D1D1D] rounded-[12px]">
                <span className="absolute left-[16px] top-[53%] -translate-y-1/2">
                  <SearchIcon />
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
              <button type="button" className="scale-[0.675]" onClick={handleBack}>
                <CloseIcon color="#fff" />
              </button>
            </div>
          </div>

          {/* Category buttons */}
          <div className="flex items-center gap-3 px-8 xl:px-16">
            {categoriesOptions.map((item) => {
              const active = selectedTag === item.value;
              return (
                <button
                  key={item.id}
                  type="button"
                  className={cn("px-3 py-2 rounded-[34px] relative")}
                  onClick={() => {
                    setSelectedTag(item.value);
                  }}
                >
                  {active && (
                    <motion.div
                      layoutId="app_widget_preview_tags"
                      className="absolute top-0 left-0 right-0 bottom-0 rounded-[34px] bg-white z-[1]"
                    />
                  )}
                  <p className="text-[#737373] text-xs font-semibold relative z-[2]">{item.label}</p>
                </button>
              );
            })}
          </div>
        </div>

        {/* widget grid */}
        <CommandList className="h-[70%] scrollbar max-h-full min-w-full px-8 xl:px-16 focus:outline-hidden pb-4">
          <div className="flex flex-col gap-8">
            <RenderIf condition={filteredWidget.length !== 0}>
              <h2 className="text-white text-base font-medium">Suggested Widgets</h2>
            </RenderIf>

            <div className="grid min-w-full min-h-0 grid-cols-1 overflow-auto md:grid-cols-2 xl:grid-cols-3 gap-x-8 gap-y-8">
              {filteredWidget.map((widget, index) => {
                const widgetSlug = widget.slug;

                //every index of element that comes after third element
                const indexTarget = index % 3 === 0 && index !== 0;

                //every second row starting from the second
                const rowTarget = (index / 3 - 1) * 2 + 2;

                // only for the default state of the widgets when the modal is opened - (no search no tags selected)
                const defaultSettings = !searchValue && selectedTag === "all";
                // console.log("defaultSettings", selectedTag, searchValue);

                const textCondition = indexTarget && defaultSettings;

                return (
                  <>
                    {/* text elements */}
                    {textCondition && (
                      <div
                        key={index}
                        className={`hidden xl:block w-full col-span-3 max-w-[17rem] row-start-[${rowTarget}]`}
                      >
                        <h2 className="text-white text-base font-medium">{textCategoryContent[index / 3 - 1]}</h2>
                      </div>
                    )}

                    {/* widget cell */}
                    <CommandGroup key={widget.slug} className="relative min-h-fit aspect-square rounded-[24px] p-0">
                      <CommandItem
                        key={widget.name}
                        className="min-h-fit aspect-square bg-[#28282866] data-[selected=true]:bg-[#27292E] rounded-[24px] p-0 overflow-hidden cursor-pointer"
                        onSelect={(e) => {
                          // console.log("gggg", e);
                          handleWidgetClick(widget);
                        }}
                      >
                        <QuickWidgetItem tag={selectedTag} key={widget.id} widget={widget} handleGoBack={handleBack} />
                      </CommandItem>

                      {/* button for favourites */}
                      <div
                        style={{ background: "transparent", borderWidth: 0 }}
                        className="absolute bg-gradient-widget-preview-button z-[100] top-5 right-5 h-[24px] aspect-square border-[1px] border-[#353535] rounded-[6px] flex items-center justify-center"
                      >
                        {/* <button
                          type="button"
                          className="scale-[0.875]"
                          // onClick={handleBack}
                        >
                          <PlusIcon fill="#fff" />
                          <Star fill="#fff" />
                        </button> */}
                        <motion.button
                          key={widget.id}
                          type="button"
                          variants={variants}
                          className="absolute scale-[0.875]"
                          whileTap="small"
                          onClick={() => {
                            const isFavorite = settings.favorite_widgets.includes(widgetSlug);

                            let newWidgetArray: string[] = [];

                            if (isFavorite) {
                              newWidgetArray = settings.favorite_widgets.filter((item) => item !== widgetSlug);
                            } else {
                              newWidgetArray = [...settings.favorite_widgets, widgetSlug];
                            }
                            updateSettings({
                              ...settings,
                              favorite_widgets: newWidgetArray,
                            });
                          }}
                        >
                          {settings.favorite_widgets.includes(widgetSlug) ? <StarFilled /> : <Star />}
                        </motion.button>
                      </div>
                    </CommandGroup>
                  </>
                );
              })}

              {/* if no widgets */}
              <RenderIf condition={filteredWidget.length === 0}>
                <div className="absolute left-1/2 top-[45%] translate-x-[-50%] translate-y-[-50%]">
                  <div className="max-w-[18rem] mx-auto h-full flex items-center">
                    <div className="flex flex-col gap-1 items-center justify-between">
                      <div className="mb-7">
                        <Image src={dashboard.layout} alt="layout" />
                      </div>
                      <p className="text-[#9A9E9E] text-sm font-medium text-center font-sans">
                        We can’t find your widget.
                      </p>
                    </div>
                  </div>
                </div>
              </RenderIf>
            </div>
          </div>
        </CommandList>
      </div>
    </Command>
  );
}
