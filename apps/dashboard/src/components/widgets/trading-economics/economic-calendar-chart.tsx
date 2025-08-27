import React from "react";
import { EconomicEvent } from "@/services/queries/charts/types"; 
import { cn } from "@/lib/utils";

interface IProps {
  events: EconomicEvent[];
}

const EconomicCalendarChartView = ({ events }: IProps) => {
  if (events.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-neutral-500">
        No events scheduled for this day.
      </div>
    );
  }

  return (
    <div className="relative flex justify-center">
      {/* Vertical Timeline Bar */}
      <div className="absolute top-0 h-full w-0.5 bg-gray-300" />

      {/* Events List */}
      <div className="space-y-8">
        {events.map((event, index) => (
          <div key={index} className="relative flex justify-center items-center">
            {/* Dot on the timeline has been removed */}
            
            <div className="w-[390px]">
              <div className="grid grid-cols-[1fr_auto_auto] items-center gap-4 p-2 bg-white rounded-lg border border-gray-200 shadow-sm">
                <p className="text-sm font-medium text-[#5A5A5A] break-words bg-[#F2F2F2] px-2 py-1 rounded-md">
                  {event.name}
                </p>
                <p className="text-sm text-black whitespace-nowrap">
                  {new Date(event.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
                <div 
                  className={cn(
                    "px-2 py-1 text-xs font-semibold rounded-md w-18 text-center",
                    event.actual ? "bg-green-100 text-green-800 border-green-800" : "bg-orange-100 text-orange-800 border-orange-800"
                  )}
                >
                  {event.actual ? event.actual : "Pending"}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default EconomicCalendarChartView;
