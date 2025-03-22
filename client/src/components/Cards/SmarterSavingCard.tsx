"use client";

import React, { useEffect } from "react";
import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { SavingsOverviewData } from "@/lib/data";
import { SaveSenseModalManager } from "../Modals/SaveSenseModalManager";
import { toast } from "@/hooks/use-toast";
import { useActiveAccount } from "thirdweb/react";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function SmarterSavingCard({
  setIsConnectModalOpen,
}: {
  setIsConnectModalOpen?: (open: boolean) => void;
}) {
  const account = useActiveAccount();
  const address = account?.address;
  const modalManagerRef = useRef<{
    fetchData: () => void;
    download: () => void;
  }>(null);
  const [activeSlide, setActiveSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  // Auto-rotate carousel every 5 seconds
  useEffect(() => {
    if (isPaused) return;

    const interval = setInterval(() => {
      setActiveSlide((prev) =>
        prev === SavingsOverviewData.length - 1 ? 0 : prev + 1
      );
    }, 5000); // Change slide every 5 seconds

    return () => clearInterval(interval);
  }, [isPaused]);

  const handleButtonClick = (buttonText: string) => {
    if (buttonText === "Get started") {
      if (!address) {
        toast({
          title: "No wallet connected",
          variant: "destructive",
        });
        setIsConnectModalOpen && setIsConnectModalOpen(true);
        return;
      }

      // Trigger fetch data method on modal manager
      modalManagerRef.current?.fetchData();
    } else if (buttonText === "Download") {
      // Trigger download method on modal manager
      modalManagerRef.current?.download();
    }
  };

  const nextSlide = () => {
    // Pause auto-rotation temporarily when user interacts
    setIsPaused(true);
    setActiveSlide((prev) =>
      prev === SavingsOverviewData.length - 1 ? 0 : prev + 1
    );
    // Resume auto-rotation after 10 seconds of inactivity
    setTimeout(() => setIsPaused(false), 10000);
  };

  const prevSlide = () => {
    // Pause auto-rotation temporarily when user interacts
    setIsPaused(true);
    setActiveSlide((prev) =>
      prev === 0 ? SavingsOverviewData.length - 1 : prev - 1
    );
    // Resume auto-rotation after 10 seconds of inactivity
    setTimeout(() => setIsPaused(false), 10000);
  };

  const goToSlide = (index: number) => {
    // Pause auto-rotation temporarily when user interacts
    setIsPaused(true);
    setActiveSlide(index);
    // Resume auto-rotation after 10 seconds of inactivity
    setTimeout(() => setIsPaused(false), 10000);
  };

  return (
    <>
      {/* Mobile View Carousel */}
      <div className="block sm:hidden mb-6 relative">
        {/* Card */}
        <div
          className="relative bg-[#092324] rounded-[16px] p-5 text-[#F1F1F1] overflow-hidden mb-3"
          onTouchStart={() => setIsPaused(true)}
          onTouchEnd={() => setTimeout(() => setIsPaused(false), 10000)}>
          <div className="flex justify-between items-start">
            <div className="max-w-[70%]">
              <h3 className="text-sm">
                {SavingsOverviewData[activeSlide].title}
              </h3>
              <p className="text-xs font-[300]">
                {SavingsOverviewData[activeSlide].description}
              </p>
            </div>
            <div>
              {React.createElement(SavingsOverviewData[activeSlide].icon, {
                className: "w-6 h-6 text-[#20FFAF]",
              })}
            </div>
          </div>
        </div>

        {/* Carousel Indicators */}
        <div className="flex justify-center gap-2">
          {SavingsOverviewData.map((_, index) => (
            <div
              key={index}
              className={`w-1.5 h-1.5 rounded-full ${
                index === activeSlide ? "bg-[#20FFAF]" : "bg-[#FFFFFF33]"
              } cursor-pointer`}
              onClick={() => goToSlide(index)}></div>
          ))}
        </div>

        {/* Optional: Navigation Arrows */}
        <button
          onClick={prevSlide}
          className="absolute left-2 top-1/3 -translate-y-1/2 w-8 h-8 flex items-center justify-center bg-black/20 rounded-full text-white opacity-0"
          aria-label="Previous slide">
          <ChevronLeft className="w-5 h-5" />
        </button>
        <button
          onClick={nextSlide}
          className="absolute right-2 top-1/3 -translate-y-1/2 w-8 h-8 flex items-center justify-center bg-black/20 rounded-full text-white opacity-0"
          aria-label="Next slide">
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* Desktop View */}
      <div className="hidden sm:grid sm:grid-cols-2 gap-3 pb-2">
        {SavingsOverviewData.map((items, index) => (
          <div
            key={index}
            className="flex border-0 items-center space-x-4 justify-between bg-[#092324] rounded-[12px] p-4 text-[#F1F1F1]">
            <div>
              <items.icon className="w-9 h-9 text-[#20FFAF]" />
            </div>
            <div>
              <div className="text-sm">{items.title}</div>
              <div className="text-xs font-[300]">{items.description}</div>
            </div>
            <div>
              <Button
                onClick={() => handleButtonClick(items.buttonText)}
                className="px-4 py-2 text-white bg-[#FFFFFF2B] text-sm text-nowrap rounded-[100px]">
                {items.buttonText}
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal Manager Component */}
      <SaveSenseModalManager trigger={modalManagerRef} onClose={() => {}} />
    </>
  );
}
