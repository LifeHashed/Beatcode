"use client";

import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface CalendarProps {
  selected?: Date | { from?: Date; to?: Date };
  onSelect?: (date: Date | { from?: Date; to?: Date } | undefined) => void;
  mode?: "single" | "range";
  numberOfMonths?: number;
  className?: string;
  initialFocus?: boolean;
  defaultMonth?: Date;
}

export function Calendar({
  selected,
  onSelect,
  mode = "single",
  numberOfMonths = 1,
  className,
  defaultMonth,
  ...props
}: CalendarProps) {
  const [currentMonth, setCurrentMonth] = React.useState(
    defaultMonth || new Date()
  );

  const monthNames = [
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

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const navigateMonth = (direction: "prev" | "next") => {
    setCurrentMonth((prev) => {
      const newMonth = new Date(prev);
      if (direction === "prev") {
        newMonth.setMonth(newMonth.getMonth() - 1);
      } else {
        newMonth.setMonth(newMonth.getMonth() + 1);
      }
      return newMonth;
    });
  };

  const handleDateClick = (day: number) => {
    const clickedDate = new Date(
      currentMonth.getFullYear(),
      currentMonth.getMonth(),
      day
    );

    if (mode === "single") {
      onSelect?.(clickedDate);
    } else if (mode === "range") {
      const range = selected as { from?: Date; to?: Date } | undefined;
      if (!range?.from || (range.from && range.to)) {
        onSelect?.({ from: clickedDate, to: undefined });
      } else if (range.from && !range.to) {
        if (clickedDate >= range.from) {
          onSelect?.({ from: range.from, to: clickedDate });
        } else {
          onSelect?.({ from: clickedDate, to: range.from });
        }
      }
    }
  };

  const isDateSelected = (day: number) => {
    const date = new Date(
      currentMonth.getFullYear(),
      currentMonth.getMonth(),
      day
    );

    if (mode === "single") {
      const singleDate = selected as Date | undefined;
      return (
        singleDate &&
        date.getDate() === singleDate.getDate() &&
        date.getMonth() === singleDate.getMonth() &&
        date.getFullYear() === singleDate.getFullYear()
      );
    } else if (mode === "range") {
      const range = selected as { from?: Date; to?: Date } | undefined;
      if (!range?.from) return false;

      if (range.to) {
        return date >= range.from && date <= range.to;
      } else {
        return date.getTime() === range.from.getTime();
      }
    }
    return false;
  };

  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth(currentMonth);
    const firstDay = getFirstDayOfMonth(currentMonth);
    const days = [];

    // Empty cells for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="h-9 w-9" />);
    }

    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const isSelected = isDateSelected(day);
      days.push(
        <Button
          key={day}
          variant={isSelected ? "default" : "ghost"}
          className="h-9 w-9 p-0 font-normal"
          onClick={() => handleDateClick(day)}
        >
          {day}
        </Button>
      );
    }

    return days;
  };

  return (
    <div className={cn("p-3", className)} {...props}>
      <div className="flex justify-between items-center mb-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigateMonth("prev")}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <div className="font-semibold">
          {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigateMonth("next")}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      <div className="grid grid-cols-7 gap-1 mb-2">
        {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((day) => (
          <div
            key={day}
            className="h-9 w-9 text-center text-sm font-medium text-muted-foreground flex items-center justify-center"
          >
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">{renderCalendar()}</div>
    </div>
  );
}
