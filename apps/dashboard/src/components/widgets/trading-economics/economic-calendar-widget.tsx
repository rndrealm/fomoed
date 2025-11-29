"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useFetchEconomicCalendar } from "@/services/queries/charts";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { Calendar as CalendarIcon } from "lucide-react";
import { Close } from "@/components/icons/icons";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import EconomicCalendarTableView from "./economic-calendar-table";
import { LayoutType } from "@/lib/atoms/layoutAtom";
import { WidgetWrapper } from "../shared";
import { AnimatePresence, motion } from "motion/react";
import { modalSlide } from "@/lib/utils";
import { EconomicEvent } from "@/services/queries/charts/types";

interface IProps {
  widget: LayoutType["widgets"][0];
}

const TradingEconomicsWidget = (props: IProps) => {
  const { widget } = props;
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [initialDate] = useState(() => new Date()); // Capture initial date
  const [currentTime, setCurrentTime] = useState(new Date());
  const [showInfo, setShowInfo] = useState(false);

  const { data: events = [], isPending, error } = useFetchEconomicCalendar();

  if (error) {
    const message = error.message || "Unexpected error occurred";
    throw new Error(`API request failed - ${message}`);
  }

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const eventsForCalendarView = useMemo(() => {
    const isInitialView = selectedDate.toDateString() === initialDate.toDateString();

    const startDate = isInitialView
      ? new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1)
      : new Date(selectedDate);

    startDate.setHours(0, 0, 0, 0);

    const endOfMonth = new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 0);
    endOfMonth.setHours(23, 59, 59, 999);

    const filteredEvents = events.filter((event) => {
      const eventDate = new Date(event.timestamp);
      return eventDate >= startDate && eventDate <= endOfMonth;
    });

    const groupedEvents = new Map<string, EconomicEvent[]>();
    filteredEvents.forEach((event) => {
      const dateString = new Date(event.timestamp).toDateString();
      if (!groupedEvents.has(dateString)) {
        groupedEvents.set(dateString, []);
      }
      groupedEvents.get(dateString)!.push(event);
    });

    return groupedEvents;
  }, [events, selectedDate, initialDate]);

  const offsetMinutes = new Date().getTimezoneOffset();
  const offsetHours = -offsetMinutes / 60;
  const utcOffsetString = `UTC ${offsetHours >= 0 ? "+" : ""}${offsetHours}`;

  return (
    <WidgetWrapper
      title={"US Economic Calendar"}
      widget={widget}
      handleLearnMore={() => setShowInfo(true)}
      className="text-white"
    >
      {/* Date and Time Controls */}
      <div className="bg-neutral-800/70 rounded-lg py-2 px-6 flex justify-between items-center mb-1">
        <Popover>
          <PopoverTrigger asChild>
            <button className="flex items-center gap-2 cursor-pointer text-sm p-1 rounded-md">
              <CalendarIcon className="h-5 w-5 text-neutral-400" />
              <span className="font-medium">{selectedDate.toDateString()}</span>
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={(date) => date && setSelectedDate(date)}
              initialFocus
            />
          </PopoverContent>
        </Popover>
        <div className="text-sm text-neutral-400">
          {currentTime.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} ({utcOffsetString})
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-grow overflow-auto py-1 no-scrollbar overflow-auto">
        {isPending ? (
          <Skeleton className="h-full w-full bg-neutral-800" />
        ) : (
          <EconomicCalendarTableView eventsByDate={eventsForCalendarView} />
        )}
      </div>

      <AnimatePresence>
        {showInfo && (
          <div className="absolute top-[10px] right-[10px] bottom-[10px] left-[10px] z-9 flex items-end">
            <motion.div
              className="scrollbar max-h-full overflow-auto rounded-[22px] bg-neutral-800 text-white px-5 py-4"
              variants={modalSlide}
              initial="hidden"
              animate="visible"
              exit="hidden"
            >
              <div className="flex flex-col gap-4 overflow-auto">
                <div className="flex flex-col gap-3">
                  <div className="flex flex-col">
                    <h3 className="text-base leading-[1.35] font-semibold">Economic Calendar</h3>
                    <p className="text-[13px] leading-[1.25] font-light text-neutral-400">
                      Tracking High-Impact US Data
                    </p>
                  </div>
                  <p className="text-[13px] leading-[1.4] font-medium">
                    This calendar tracks key <strong>high-impact US economic events</strong> known to cause market
                    volatility. For each event, you will see three key figures:
                  </p>
                  <ul className="list-disc pl-5 text-[13px] leading-[1.5] font-medium flex flex-col gap-1">
                    <li>
                      <strong>Forecast:</strong> The market&apos;s consensus prediction for the data.
                    </li>
                    <li>
                      <strong>Prior:</strong> The result from the previous reporting period.
                    </li>
                    <li>
                      <strong>Actual:</strong> The official number released at the time of the event.
                    </li>
                  </ul>
                  <p className="text-[13px] leading-[1.4] font-medium">
                    Traders closely watch for any major difference between the <strong>Actual</strong> and{" "}
                    <strong>Forecast</strong> numbers, as this surprise factor is what typically drives the strongest
                    market reactions.
                  </p>
                  <p className="text-[13px] leading-[1.4] font-medium text-neutral-400">
                    Please note: This widget only supports data for the previous 15 days and the next 15 days.
                  </p>
                </div>
                <p className="text-xs font-semibold text-neutral-400 text-[1.25]">
                  We use data from{" "}
                  <a href="https://www.coinglass.com/" target="_blank" className="underline">
                    Coinglass.com
                  </a>
                </p>

                <div className="flex justify-center">
                  <button
                    type="button"
                    className="app_widget_button flex h-[26px] items-center justify-center gap-1 rounded-[40px] bg-neutral-700"
                    onClick={() => setShowInfo(false)}
                  >
                    <p className="app_widget_button__text text-[13px] font-medium whitespace-nowrap">Close</p>
                    <div className="app_widget_button__icon">
                      <Close />
                    </div>
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </WidgetWrapper>
  );
};

export default TradingEconomicsWidget;
