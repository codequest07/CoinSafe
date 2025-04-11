"use client";

import { useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface SavingsTarget {
  id: string;
  title: string;
  amount: number;
  currency: string;
  status: "Locked" | "Flexible";
  unlockDate: string;
}

export default function SavingsTargetsCarousel() {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const savingsTargets: SavingsTarget[] = [
    {
      id: "1",
      title: "Auto-savings",
      amount: 0.0,
      currency: "USD",
      status: "Locked",
      unlockDate: "Unlocks on 25th January,2025",
    },
    {
      id: "2",
      title: "Emergency savings",
      amount: 0.0,
      currency: "USD",
      status: "Flexible",
      unlockDate: "Unlocks anytime",
    },
    {
      id: "3",
      title: "General savings",
      amount: 0.0,
      currency: "USD",
      status: "Flexible",
      unlockDate: "Unlocks on 25th January,2025",
    },
    {
      id: "4",
      title: "Custom savings",
      amount: 0.0,
      currency: "USD",
      status: "Flexible",
      unlockDate: "Unlocks on 25th January,2025",
    },
    {
      id: "5",
      title: "Vacation savings",
      amount: 0.0,
      currency: "USD",
      status: "Flexible",
      unlockDate: "Unlocks on 30th June,2025",
    },
  ];

  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -300, behavior: "smooth" });
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 300, behavior: "smooth" });
    }
  };

  return (
    <div className="w-full overflow-hidden">
      <div className="">
        <h2 className="text-xl font-medium mb-4 text-white">
          Your savings targets
        </h2>
        <div className="relative">
          <div
            ref={scrollContainerRef}
            className="flex overflow-x-auto gap-4 pb-4 scrollbar-hide scroll-smooth"
            // className="flex shrink-0 overflow-x-auto gap-4 pb-4 scrollbar-hide scroll-smooth max-w-full"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            {savingsTargets.map((target) => (
              <Card
                key={target.id}
                className="min-w-[280px] bg-[#111] border-[#333] text-white"
              >
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <h3 className="text-sm font-medium">{target.title}</h3>
                  <Badge
                    variant={target.status === "Locked" ? "default" : "outline"}
                    className={`
                    ${
                      target.status === "Locked"
                        ? "bg-emerald-950 text-emerald-400 hover:bg-emerald-950"
                        : "border-emerald-400 text-emerald-400"
                    }
                  `}
                  >
                    {target.status}
                  </Badge>
                </CardHeader>
                <CardContent className="pb-2">
                  <div className="flex items-end gap-1">
                    <span className="text-2xl font-bold">
                      ${target.amount.toFixed(2)}
                    </span>
                    <span className="text-sm text-gray-400 mb-1">
                      {target.currency}
                    </span>
                  </div>
                </CardContent>
                <CardFooter>
                  <p className="text-xs text-gray-400">{target.unlockDate}</p>
                </CardFooter>
              </Card>
            ))}
          </div>

          <Button
            onClick={scrollLeft}
            variant="outline"
            size="icon"
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 bg-black/80 border-gray-700 text-white hover:bg-black/90 hover:text-white rounded-full h-8 w-8 hidden md:flex"
          >
            <ChevronLeft className="h-4 w-4" />
            <span className="sr-only">Scroll left</span>
          </Button>

          <Button
            onClick={scrollRight}
            variant="outline"
            size="icon"
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 bg-black/80 border-gray-700 text-white hover:bg-black/90 hover:text-white rounded-full h-8 w-8 hidden md:flex"
          >
            <ChevronRight className="h-4 w-4" />
            <span className="sr-only">Scroll right</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
