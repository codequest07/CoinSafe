"use client";

import { Label } from "./ui/label";

interface PillOption {
  value: number;
  label: string;
}

interface PillSelectorProps {
  options: PillOption[];
  selectedValue: number;
  onChange: (value: number) => void;
  className?: string;
}

export function DurationSelector({
  options,
  selectedValue,
  onChange,
  className = "",
}: PillSelectorProps) {
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
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
}
