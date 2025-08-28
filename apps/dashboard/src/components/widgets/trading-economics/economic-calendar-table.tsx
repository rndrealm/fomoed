import React from "react";
import { EconomicEvent } from "@/services/queries/charts/types"; 
import Image from "next/image"; 
import dashboard from "@/lib/assets/dashboard";

interface IProps {
  eventsByDate: Map<string, EconomicEvent[]>;
}

const EconomicCalendarTableView = ({ eventsByDate }: IProps) => {
  // Function to format event names based on parenthesis content
  const formatEventName = (name: string) => {
    // Match content within parentheses
    const parenthesesRegex = /\(([^)]+)\)/g;
    
    return name.replace(parenthesesRegex, (match, content) => {
      const trimmedContent = content.trim();
      
      // Check if it's MoM, YoY, or QoQ - remove parentheses but keep the text
      if (['MoM', 'YoY', 'QoQ', 'Preliminary'].includes(trimmedContent)) {
        return ` ${trimmedContent}`;
      }
      
      // Check if it's a month abbreviation - remove parentheses and style
      const monthAbbreviations = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
                                 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      
      if (monthAbbreviations.includes(trimmedContent)) {
        return ` <span class="text-gray-400">${trimmedContent}</span>`;
      }
      
      // Keep other parentheses as they are
      return match;
    });
  };

  if (eventsByDate.size === 0) {
    return (
      <div className="flex items-center justify-center h-full text-neutral-500">
        No upcoming events found for the remainder of the month.
      </div>
    );
  }

  const days = Array.from(eventsByDate.entries());

  return (
    <div className="space-y-6 pr-2"> {/* Added right padding for scrollbar */}
      {days.map(([dateString, events]) => (
        <div key={dateString}>
          <h3 className="font-semibold text-lg mb-2">{dateString}</h3>
          <table className="w-full table-fixed text-sm text-left text-[#5A5A5A]">
            <thead className="text-xs uppercase bg-[#E5E7EB]">
              <tr>
                <th scope="col" className="py-3 px-2 font-medium w-[65%]"> {/* Increased width for name column */}
                  <div className="flex items-center gap-2">
                    <Image 
                      src={dashboard.usaIcon}
                      width={20} 
                      height={20} 
                      alt="USA Flag" 
                    />
                    USA
                  </div>
                </th>
                <th scope="col" className="py-3 px-2 text-center font-medium w-[12%]"> {/* Reduced width */}
                  Actual
                </th>
                <th scope="col" className="py-3 px-2 text-center font-medium w-[12%]"> {/* Reduced width */}
                  Prior
                </th>
                <th scope="col" className="py-3 px-2 text-center font-medium w-[11%]"> {/* Reduced width */}
                  Forecast
                </th>
              </tr>
            </thead>
            <tbody>
              {events.map((event, index) => (
                <tr key={index} className="border-b border-gray-200">
                  <td className="py-2 px-2">
                    <div className="flex items-center gap-2">
                      <span className="bg-red-800 text-white px-2 py-1 rounded text-xs font-medium flex-shrink-0">
                        {new Date(event.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                      <span 
                        className="font-medium"
                        dangerouslySetInnerHTML={{ __html: formatEventName(event.name) }}
                      />
                    </div>
                  </td>
                  <td className="py-2 px-2 text-center font-medium text-xs"> {/* Smaller text */}
                    {event.actual || "-"}
                  </td>
                  <td className="py-2 px-2 text-center font-medium text-xs"> {/* Smaller text */}
                    {event.previous || "-"}
                  </td>
                  <td className="py-2 px-2 text-center font-medium text-xs"> {/* Smaller text */}
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