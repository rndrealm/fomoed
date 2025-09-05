import React, { useState, useEffect } from "react";
import { EconomicEvent } from "@/services/queries/charts/types";
import Image from "next/image";
import dashboard from "@/lib/assets/dashboard";
import { ChevronDown } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { cn } from "@/lib/utils";

const useMediaQuery = (query: string) => {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const media = window.matchMedia(query);
    if (media.matches !== matches) {
      setMatches(media.matches);
    }
    const listener = () => setMatches(media.matches);
    window.addEventListener("resize", listener);
    return () => window.removeEventListener("resize", listener);
  }, [matches, query]);

  return matches;
};

interface IProps {
  eventsByDate: Map<string, EconomicEvent[]>;
}

const EconomicCalendarTableView = ({ eventsByDate }: IProps) => {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const isMobile = useMediaQuery("(max-width: 767px)");

  const [isClient, setIsClient] = useState(false);
  useEffect(() => {
    setIsClient(true);
  }, []);

  const formatEventName = (name: string) => {
    const parenthesesRegex = /\(([^)]+)\)/g;
    return name.replace(parenthesesRegex, (match, content) => {
      const trimmedContent = content.trim();
      if (["MoM", "YoY", "QoQ", "Preliminary"].includes(trimmedContent)) {
        return ` ${trimmedContent}`;
      }
      const monthAbbreviations = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      if (monthAbbreviations.includes(trimmedContent)) {
        return ` <span class="text-gray-500">${trimmedContent}</span>`;
      }
      return match;
    });
  };

  if (eventsByDate.size === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center text-neutral-400 space-y-2">
        <p>No upcoming events found for the remainder of the month.</p>
        <p className="text-sm text-neutral-500">
          This widget only supports data for the next 15 days and previous 15 days.
        </p>
      </div>
    );
  }

  const days = Array.from(eventsByDate.entries());

  return (
    <div className="space-y-6 pr-2">
      {days.map(([dateString, events]) => (
        <div key={dateString}>
          <h3 className="font-semibold text-lg mb-2">{dateString}</h3>

          {isClient && isMobile ? (
            // MOBILE VIEW
            <div className="space-y-2">
              {events.map((event, index) => {
                const uniqueId = `${dateString}-${index}`;
                const isExpanded = expandedId === uniqueId;
                const handleToggle = () => setExpandedId(isExpanded ? null : uniqueId);

                return (
                  <div key={uniqueId} className="bg-neutral-800 rounded-lg overflow-hidden border border-neutral-700">
                    <button onClick={handleToggle} className="w-full flex items-center justify-between p-2 text-left">
                      <div className="flex items-center gap-2">
                        <span className="bg-red-800 text-white px-2 py-1 rounded text-xs font-medium flex-shrink-0">
                          {new Date(event.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </span>
                        <span
                          className="font-medium text-neutral-300"
                          dangerouslySetInnerHTML={{ __html: formatEventName(event.name) }}
                        />
                      </div>
                      <ChevronDown
                        className={cn(
                          "h-5 w-5 text-neutral-400 transition-transform duration-200 flex-shrink-0",
                          isExpanded && "rotate-180",
                        )}
                      />
                    </button>
                    <AnimatePresence initial={false}>
                      {isExpanded && (
                        <motion.section
                          key="content"
                          initial="collapsed"
                          animate="open"
                          exit="collapsed"
                          variants={{ open: { opacity: 1, height: "auto" }, collapsed: { opacity: 0, height: 0 } }}
                          transition={{ duration: 0.3, ease: [0.04, 0.62, 0.23, 0.98] }}
                        >
                          <div className="grid grid-cols-3 text-center border-t border-neutral-700">
                            <div className="p-2">
                              <p className="text-xs text-neutral-400">Actual</p>
                              <p className="font-semibold text-sm">{event.actual || "-"}</p>
                            </div>
                            <div className="p-2 border-x border-neutral-700">
                              <p className="text-xs text-neutral-400">Prior</p>
                              <p className="font-semibold text-sm">{event.previous || "-"}</p>
                            </div>
                            <div className="p-2">
                              <p className="text-xs text-neutral-400">Forecast</p>
                              <p className="font-semibold text-sm">{event.forecast || "-"}</p>
                            </div>
                          </div>
                        </motion.section>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>
          ) : isClient && !isMobile ? (
            // DESKTOP VIEW
            <table className="w-full text-sm text-left text-neutral-300">
              <thead className="text-xs uppercase bg-neutral-800">
                <tr>
                  <th scope="col" className="py-3 px-2 font-medium w-[60%]">
                    <div className="flex items-center gap-2">
                      <Image src={dashboard.usaIcon} width={20} height={20} alt="USA Flag" />
                      USA
                    </div>
                  </th>
                  <th scope="col" className="py-3 px-2 text-center font-medium">
                    Actual
                  </th>
                  <th scope="col" className="py-3 px-2 text-center font-medium">
                    Prior
                  </th>
                  <th scope="col" className="py-3 px-2 text-center font-medium">
                    Forecast
                  </th>
                </tr>
              </thead>
              <tbody>
                {events.map((event, index) => (
                  <tr key={index} className="border-b border-neutral-700">
                    <td className="py-2 px-2">
                      <div className="flex items-center gap-2">
                        <span className="bg-red-800 text-white px-2 py-1 rounded text-xs font-medium flex-shrink-0">
                          {new Date(event.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </span>
                        <span
                          className="font-medium"
                          dangerouslySetInnerHTML={{ __html: formatEventName(event.name) }}
                        />
                      </div>
                    </td>
                    <td className="py-2 px-2 text-center font-medium text-xs">{event.actual || "-"}</td>
                    <td className="py-2 px-2 text-center font-medium text-xs">{event.previous || "-"}</td>
                    <td className="py-2 px-2 text-center font-medium text-xs">{event.forecast || "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : null}
        </div>
      ))}
    </div>
  );
};

export default EconomicCalendarTableView;
