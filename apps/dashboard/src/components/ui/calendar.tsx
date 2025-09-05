import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export interface CalendarProps {
  mode?: "single" | "multiple" | "range";
  selected?: Date;
  onSelect?: (date: Date | undefined) => void;
  className?: string;
  initialFocus?: boolean;
  disabled?: (date: Date) => boolean;
  showOutsideDays?: boolean;
}

const DAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

export function Calendar({
  mode = "single",
  selected,
  onSelect,
  className,
  initialFocus,
  disabled,
  showOutsideDays = true,
  ...props
}: CalendarProps) {
  const [currentMonth, setCurrentMonth] = React.useState(() => {
    if (mode === "single" && selected instanceof Date) {
      return new Date(selected.getFullYear(), selected.getMonth(), 1);
    }
    return new Date(new Date().getFullYear(), new Date().getMonth(), 1);
  });

  const isSelected = (date: Date) => {
    if (mode === "single" && selected instanceof Date) {
      return date.toDateString() === selected.toDateString();
    }
    return false;
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const isDisabled = (date: Date) => {
    return disabled ? disabled(date) : false;
  };

  const handleDateClick = (date: Date) => {
    if (isDisabled(date)) return;

    if (mode === "single" && onSelect) {
      onSelect(date);
    }
  };

  const navigateMonth = (direction: "prev" | "next") => {
    setCurrentMonth((prev) => {
      const newMonth = new Date(prev);
      if (direction === "prev") {
        newMonth.setMonth(prev.getMonth() - 1);
      } else {
        newMonth.setMonth(prev.getMonth() + 1);
      }
      return newMonth;
    });
  };

  const getDaysInMonth = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();

    // First day of the current month
    const firstDay = new Date(year, month, 1);
    // Last day of the current month
    const lastDay = new Date(year, month + 1, 0);
    // First day of week (0 = Sunday)
    const firstDayOfWeek = firstDay.getDay();
    // Total days in current month
    const daysInMonth = lastDay.getDate();

    const days: (Date | null)[] = [];

    // Add previous month's days to fill the first week
    if (showOutsideDays && firstDayOfWeek > 0) {
      // Get the last day of previous month
      const prevMonthLastDay = new Date(year, month, 0);
      const prevMonthLastDate = prevMonthLastDay.getDate();
      
      // Add the last few days of previous month
      for (let i = firstDayOfWeek - 1; i >= 0; i--) {
        const dayNumber = prevMonthLastDate - i;
        days.push(new Date(year, month - 1, dayNumber));
      }
    } else {
      // Add null placeholders
      for (let i = 0; i < firstDayOfWeek; i++) {
        days.push(null);
      }
    }

    // Add current month days
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }

    // Add next month days to complete the 6-week grid
    const totalCells = 42; // 6 weeks × 7 days
    const remainingCells = totalCells - days.length;
    
    if (showOutsideDays && remainingCells > 0) {
      for (let day = 1; day <= remainingCells; day++) {
        days.push(new Date(year, month + 1, day));
      }
    } else {
      // Add null placeholders
      for (let i = 0; i < remainingCells; i++) {
        days.push(null);
      }
    }

    return days;
  };

  const days = getDaysInMonth();

  return (
    <div className={cn("p-3", className)} {...props}>
      {/* Header */}
      <div className="flex justify-center pt-1 relative items-center mb-4">
        <Button
          variant="outline"
          size="icon"
          className="h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100 absolute left-1"
          onClick={() => navigateMonth("prev")}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>

        <div className="text-sm font-medium">
          {MONTHS[currentMonth.getMonth()]} {currentMonth.getFullYear()}
        </div>

        <Button
          variant="outline"
          size="icon"
          className="h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100 absolute right-1"
          onClick={() => navigateMonth("next")}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Days of week */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {DAYS.map((day) => (
          <div
            key={day}
            className="h-9 w-9 text-center text-sm font-normal text-muted-foreground flex items-center justify-center"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1">
        {days.map((day, index) => {
          if (!day) {
            return <div key={index} className="h-9 w-9" />;
          }

          const isCurrentMonth = day.getMonth() === currentMonth.getMonth();
          const selected = isSelected(day);
          const today = isToday(day);
          const disabled = isDisabled(day);

          return (
            <Button
              key={index}
              variant="ghost"
              className={cn(
                "h-9 w-9 p-0 font-normal",
                !isCurrentMonth && "text-muted-foreground opacity-50",
                selected &&
                  "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground",
                today && !selected && "bg-accent text-accent-foreground",
                disabled &&
                  "text-muted-foreground opacity-50 cursor-not-allowed",
              )}
              onClick={() => handleDateClick(day)}
              disabled={disabled}
            >
              {day.getDate()}
            </Button>
          );
        })}
      </div>
    </div>
  );
}