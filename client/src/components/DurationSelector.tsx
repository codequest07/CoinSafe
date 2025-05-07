"use client";

import { CalendarIcon } from "lucide-react";
import { Label } from "./ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { Calendar } from "./ui/calendar";

interface PillOption {
  value: number;
  label: string;
}

interface PillSelectorProps {
  options: PillOption[];
  selectedValue: number;
  onChange: (value: number) => void;
  onCustomDateSelect: (date: Date | undefined) => void;
  customDate: Date | undefined;
  isCustomSelected: boolean;
  disablePastDates?: boolean;
  className?: string;
  isDisabled?: boolean;
}

export function DurationSelector({
  options,
  selectedValue,
  onChange,
  className = "",
  onCustomDateSelect,
  customDate,
  isCustomSelected,
  disablePastDates = true,
  isDisabled,
}: PillSelectorProps) {
  // // if a date should be disabled
  // const isDateDisabled = (date: Date) => {
  //   if (!disablePastDates) return false;
  //   return date < new Date(new Date().setHours(0, 0, 0, 0));
  // };

  // if a date should be disabled
  const isDateDisabled = (date: Date) => {
    // Get today's date with time set to midnight
    const today = new Date(new Date().setHours(0, 0, 0, 0));

    // Calculate the date 30 days from today
    const thirtyDaysFromNow = new Date(today);
    thirtyDaysFromNow.setDate(today.getDate() + 30);

    // Disable if date is before today (if disablePastDates is true)
    // OR if date is less than 30 days from today
    return (disablePastDates && date < today) || date < thirtyDaysFromNow;
  };

  return (
    <div className={`flex flex-col space-y-3 `}>
      <div className="flex justify-between items-center text-white">
        <Label htmlFor="duration">Duration</Label>
      </div>

      <div className={`flex space-x-2 ${className}`}>
        {options.map((option) => (
          <button
            key={option.value}
            onClick={() => onChange(option.value)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors
              ${
                selectedValue === option.value
                  ? "bg-[#79E7BA] text-[#010104]"
                  : "bg-[#092324] text-[#F1F1F1] hover:bg-secondary/80"
              }`}
            disabled={isDisabled}
          >
            {option.label}
          </button>
        ))}

        {/* Custom date option */}
        <Popover>
          <PopoverTrigger asChild>
            <button
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors flex items-center
                ${
                  isCustomSelected
                    ? "bg-[#79E7BA] text-[#010104]"
                    : "bg-[#092324] text-[#F1F1F1] hover:bg-secondary/80"
                }`}
              disabled={isDisabled}
            >
              {isCustomSelected ? `${selectedValue} days` : "Custom"}
              <CalendarIcon className="ml-1 h-4 w-4" />
            </button>
          </PopoverTrigger>
          <PopoverContent
            className="w-auto p-0 bg-[#092324] text-white"
            align="start"
          >
            <Calendar
              mode="single"
              selected={customDate}
              onSelect={onCustomDateSelect}
              disabled={isDateDisabled}
              initialFocus
            />
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
}
