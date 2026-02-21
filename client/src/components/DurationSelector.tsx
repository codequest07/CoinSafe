"use client";

import { CalendarIcon } from "lucide-react";
import { Label } from "./ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { Calendar } from "./ui/calendar";
import { useEffect, useState } from "react";
import { getContractFeePercentage } from "@/lib/utils";
import { useActiveAccount } from "thirdweb/react";
import { Skeleton } from "./ui/skeleton";
import { useChainConfig } from "@/hooks/useChainConfig";

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
  label?: string;
  unlockDate?: string;
  apy?: number;
  isLoading?: boolean;
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
  label,
  unlockDate,
  apy,
  isLoading,
}: PillSelectorProps) {
  // // if a date should be disabled
  // const isDateDisabled = (date: Date) => {
  //   if (!disablePastDates) return false;
  //   return date < new Date(new Date().setHours(0, 0, 0, 0));
  // };

  const isCustomDateDisabled = true;
  const account = useActiveAccount();
  const address = account?.address;
  const { chain, diamondAddress } = useChainConfig();

  const [apys, setApys] = useState<Record<number, number>>(
    Object.fromEntries(options.map(({ value }) => [value, apy])) as Record<
      number,
      number
    >,
  );

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

  useEffect(() => {
    if (!address || !apy || !options) return;

    const getApyByDuration = async () => {
      try {
        // Run all async calls in parallel
        const results = await Promise.all(
          options.map(async (option) => {
            console.log(option);
            const percent = await getContractFeePercentage(
              option.value * 24 * 60 * 60,
              address,
              chain,
              diamondAddress,
            );
            const newApy = ((100 - Number(percent) / 100) / 100) * apy;
            return [option.value, newApy] as const;
          }),
        );

        // Convert results array to object
        const apyMap = Object.fromEntries(results);
        setApys(apyMap);
      } catch (error) {
        console.error("Error fetching APYs:", error);
      }
    };

    getApyByDuration();
  }, [options, apy, address, chain, diamondAddress]);

  return (
    <div className={`flex flex-col space-y-3`}>
      <div className="flex justify-between items-center text-white">
        <Label htmlFor="duration">{label ? label : "Duration"}</Label>

        {unlockDate && (
          <p className="text-xs text-[#CACACA]">
            Unlocks on <span className="text-[#79E7BA]">{unlockDate}</span>
          </p>
        )}
      </div>

      <div className={`flex flex-wrap gap-2 ${className}`}>
        {options.map((option) => (
          <button
            key={option.value}
            onClick={() => onChange(option.value)}
            className={`flex flex-col gap-1 text-left px-3 py-2 rounded-[8px] text-sm font-medium transition-colors flex-shrink-0
              ${
                selectedValue === option.value
                  ? "bg-[#79E7BA0F] text-[#010104] border-2 border-[#79E7BA]"
                  : "bg-[#1D1D1D73] text-[#F1F1F1] hover:bg-secondary/20"
              }`}
            disabled={isDisabled}
          >
            <span className="text-[#ffffff] font-medium text-sm">
              {option.label}
            </span>
            {isLoading ? (
              <>
                <span className="inline-flex items-center gap-1 text-[#C7C7D1] font-light text-[10px]">
                  Earn up to
                  <Skeleton className="h-3 w-6 rounded">
                    <span className="font-medium text-[#79E7BA] invisible">
                      88.88%
                    </span>
                  </Skeleton>
                  APY
                </span>
              </>
            ) : (
              <>
                {apy ? (
                  <>
                    <span className="text-[#C7C7D1] font-light text-[10px]">
                      {/* {`Earn up to ${apy.toFixed(2)}% APY`} */}
                      Earn up to{" "}
                      <span className="font-medium text-[#79E7BA]">
                        {apys[option.value].toFixed(2)}%
                      </span>{" "}
                      APY
                    </span>
                  </>
                ) : null}
              </>
            )}
          </button>
        ))}

        {/* Custom date option */}
        {!isCustomDateDisabled ? (
          <>
            <Popover>
              <PopoverTrigger asChild>
                <button
                  className={`px-3 py-2 rounded-full text-sm font-medium transition-colors flex items-center flex-shrink-0
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
          </>
        ) : (
          <></>
        )}
      </div>
    </div>
  );
}
