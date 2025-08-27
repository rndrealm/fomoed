import React from "react";
import { EconomicEvent } from "@/services/queries/charts/types"; 
import Image from "next/image"; 
import dashboard from "@/lib/assets/dashboard";

interface IProps {
  eventsByDate: Map<string, EconomicEvent[]>;
}

const EconomicCalendarTableView = ({ eventsByDate }: IProps) => {
  if (eventsByDate.size === 0) {
    return (
      <div className="flex items-center justify-center h-full text-neutral-500">
        No upcoming events found for the remainder of the month.
      </div>
    );
  }

  const days = Array.from(eventsByDate.entries());

 return (
    <div className="space-y-6">
      {days.map(([dateString, events]) => (
        <div key={dateString}>
          <h3 className="font-semibold text-lg mb-2">{dateString}</h3>
          <table className="w-full table-fixed text-sm text-left text-[#5A5A5A]">
            <thead className="text-xs uppercase bg-[#E5E7EB]">
              <tr>
                <th scope="col" className="py-3 px-2 font-medium w-1/2">
                  <div className="flex items-center gap-2">
                    <Image 
                      src= {dashboard.usaIcon}
                      width={20} 
                      height={20} 
                      alt="USA Flag" 
                    />
                    USA
                  </div>
                </th>
                <th scope="col" className="py-3 px-2 text-right font-medium w-6">
                  Actual
                </th>
                <th scope="col" className="py-3 px-2 text-right font-medium w-6">
                  Prior
                </th>
                <th scope="col" className="py-3 px-2 text-right font-medium w-6">
                  Forecast
                </th>
              </tr>
            </thead>
            <tbody>
              {events.map((event, index) => (
                <tr key={index} className="border-b border-gray-200">
                  <td className="py-2 px-2">
                    <div className="flex items-center">
                      <span className="w-24 text-[#5A5A5A] font-medium flex-shrink-0">
                        {new Date(event.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                      <span className="font-medium">{event.name}</span>
                    </div>
                  </td>
                  <td className="py-2 px-2 text-right font-medium">
                    {event.actual || "-"}
                  </td>
                  <td className="py-2 px-2 text-right font-medium">
                    {event.previous || "-"}
                  </td>
                  <td className="py-2 px-2 text-right font-medium">
                    {event.forecast || "-"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ))}
    </div>
  );
};

export default EconomicCalendarTableView;
