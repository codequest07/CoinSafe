"use client";

import type React from "react";

import { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Plus } from "lucide-react";
// import AddItemModal from "./add-item-modal"
// import CreateSavingsTargetModal from "./Modals/CreateSavingsTarget";

type SavingsTargetInputProps<T> = {
  data: T[];
  value: string;
  onChange: (value: string) => void;
  onSelect?: (item: T) => void;
  onAddItem?: (value: string) => void;
  placeholder?: string;
  className?: string;
  renderItem?: (item: T) => React.ReactNode;
  getItemValue?: (item: T) => string;
  setShowAddModal: (state: boolean) => any;
  handleAddItem: () => any;
  filterItem?: (item: T, query: string) => boolean;
  label?: string;
  maxSuggestions?: number;
  disabled?: boolean;
  itemName?: string; // Name of the item type (e.g., "city")
};

export default function SavingsTargetInput<T>({
  data,
  value,
  onChange,
  onSelect,
  onAddItem,
  placeholder = "Type to search...",
  className,
  renderItem,
  //   setShowAddModal,
  handleAddItem,
  getItemValue = (item: any) => item.toString(),
  filterItem = (item: T, query: string) =>
    getItemValue(item).toLowerCase().includes(query.toLowerCase()),
  //   label,
  maxSuggestions = 5,
  disabled = false,
  itemName = "target",
}: SavingsTargetInputProps<T>) {
  const [isFocused, setIsFocused] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  //   const [showAddModal, setShowAddModal] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Filter suggestions based on input value
  const filteredSuggestions =
    value.trim() !== ""
      ? data.filter((item) => filterItem(item, value)).slice(0, maxSuggestions)
      : [];

  // Check if the current value exists in the data
  const valueExists =
    value.trim() !== "" &&
    data.some(
      (item) => getItemValue(item).toLowerCase() === value.toLowerCase()
    );

  // Determine if we should show the "add" option
  const showAddOption = value.trim() !== "" && !valueExists && onAddItem;

  // Combine filtered suggestions with the "add" option if needed
  const suggestions = showAddOption
    ? [...filteredSuggestions]
    : filteredSuggestions;

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const totalOptions = suggestions.length + (showAddOption ? 1 : 0);
    if (totalOptions === 0) return;

    // Arrow down
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev < totalOptions - 1 ? prev + 1 : 0));
    }
    // Arrow up
    else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : totalOptions - 1));
    }
    // Enter
    else if (e.key === "Enter" && highlightedIndex >= 0) {
      e.preventDefault();
      if (highlightedIndex < suggestions.length) {
        handleSelectItem(suggestions[highlightedIndex]);
      } else if (showAddOption) {
        handleAddItem();
      }
    }
    // Escape
    else if (e.key === "Escape") {
      e.preventDefault();
      inputRef.current?.blur();
    }
  };

  // Handle item selection
  const handleSelectItem = (item: T) => {
    onChange(getItemValue(item));
    onSelect?.(item);
    setIsFocused(false);
    inputRef.current?.blur();
  };

  // Handle add item action
  //   const handleAddItem = () => {
  //     setShowAddModal(true);
  //     setIsFocused(false);
  //   };

  // Handle adding a new item
  //   const handleAddNewItem = () => {
  //     if (onAddItem && value.trim() !== "") {
  //       onAddItem(value);
  //       setShowAddModal(false);
  //     }
  //   };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        inputRef.current &&
        !inputRef.current.contains(e.target as Node) &&
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setIsFocused(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Reset highlighted index when suggestions change
  useEffect(() => {
    setHighlightedIndex(-1);
  }, [value]);

  //   const handleCreateTarget = (newTarget: SavingsTarget) => {
  //     setSavingsTargets((prev) => [...prev, newTarget]);
  //     console.log("Created new target:", newTarget);
  //   };

  return (
    <div className="relative w-full">
      {/* {label && (
        <label className="block text-sm font-medium mb-1">{label}</label>
      )} */}

      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setIsFocused(true)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        disabled={disabled}
        className={cn(
          "w-full px-4 py-2 rounded-[8px] bg-transparent border-[1px] border-[#FFFFFF3D] focus:outline-none focus:ring-2 focus:ring-primary",
          disabled && "opacity-50 cursor-not-allowed",
          className
        )}
      />

      {/* Suggestions dropdown */}
      {isFocused && (suggestions.length > 0 || showAddOption) && (
        <div
          ref={dropdownRef}
          className="absolute z-10 w-full mt-1 bg-[#212126] text-white rounded-lg shadow-lg max-h-60 overflow-auto"
        >
          {suggestions.map((item, index) => (
            <div
              key={index}
              onClick={() => handleSelectItem(item)}
              onMouseEnter={() => setHighlightedIndex(index)}
              className={cn(
                "px-4 py-2 cursor-pointer hover:bg-[#2121261]",
                index === highlightedIndex && "bg-[#2121261]"
              )}
            >
              {renderItem ? renderItem(item) : getItemValue(item)}
            </div>
          ))}

          {/* Add item option */}
          {showAddOption && (
            <div
              onClick={() => {
                handleAddItem();
                setIsFocused(false);
              }}
              onMouseEnter={() => setHighlightedIndex(suggestions.length)}
              className={cn(
                "px-4 py-2 cursor-pointer hover:bg-gray-400 hover:text-black text-white flex items-center",
                highlightedIndex === suggestions.length && "bg-gray-400"
              )}
            >
              <Plus size={16} className="mr-1" />
              <span>
                Add {itemName}: "{value}"
              </span>
            </div>
          )}
        </div>
      )}

      {/* Add item modal */}
      {/* {showAddModal && (
        <CreateSavingsTargetModal
          isOpen={showAddModal}
          onClose={() => setShowAddModal(false)}
          //   onAdd={handleAddNewItem}
          onCreate={handleCreateTarget}
          itemName={itemName}
          value={value}
          onChange={onChange}
        />
      )} */}
    </div>
  );
}
