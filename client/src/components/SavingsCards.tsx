import { useRef } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronRight, ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useGetSafes } from "@/hooks/useGetSafes";

interface SavingsTarget {
  id: string;
  name: string;
  amount: number;
  status: "Flexible" | "Locked";
  unlockDate: string;
}

export default function SavingsCards() {
  const navigate = useNavigate();
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const { safes } = useGetSafes();

  console.log(safes);

  const handleScroll = () => {
    if (scrollContainerRef.current) {
      const container = scrollContainerRef.current;
      const scrollAmount = 280 + 16;
      container.scrollTo({
        left: container.scrollLeft + scrollAmount,
        behavior: "smooth",
      });
    }
  };

  const handleScrollBack = () => {
    if (scrollContainerRef.current) {
      const container = scrollContainerRef.current;
      const scrollAmount = 280 + 16;
      container.scrollTo({
        left: container.scrollLeft - scrollAmount,
        behavior: "smooth",
      });
    }
  };

  const targets: SavingsTarget[] = [
    {
      id: "emergency",
      name: "Emergency savings",
      amount: 0,
      status: "Flexible",
      unlockDate: "Unlocks on 25th January,2025",
    },
    {
      id: "general",
      name: "General savings",
      amount: 6000,
      status: "Locked",
      unlockDate: "Unlocks on 25th January,2025",
    },
    {
      id: "wealth",
      name: "Generational wealth",
      amount: 3000,
      status: "Locked",
      unlockDate: "Unlocks on 25th January,2025",
    },
    {
      id: "house",
      name: "House hunting",
      amount: 2000,
      status: "Locked",
      unlockDate: "Unlocks on 25th January,2025",
    },
    {
      id: "house2",
      name: "House hunting",
      amount: 2000,
      status: "Locked",
      unlockDate: "Unlocks on 25th January,2025",
    },
  ];

  return (
    <div className="bg-black text-white p-4 w-full">
      <div className="max-w-[73rem] w-full">
        <h2 className="text-xl mb-4">Your savings targets</h2>
        <div className="relative">
          <div
            ref={scrollContainerRef}
            className="flex space-x-4 pb-4 overflow-x-auto hide-scrollbar"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}>
            {targets.map((target) => (
              <button
                key={target.id}
                onClick={() => navigate(`/dashboard/vault/${target.id}`)}
                className="text-left shrink-0 w-[280px] p-6 rounded-lg border border-[#FFFFFF21] transition-colors">
                <div className="flex justify-between items-start mb-4">
                  <div className="text-sm text-gray-400 font-[300]">
                    {target.name}
                  </div>
                  <Badge
                    className={`
                      bg-[#79E7BA33] font-[400] text-[#F1F1F1] rounded-xl flex items-center p-1 px-2 hover:bg-[#79E7BA33]
                    `}>
                    {target.status}
                  </Badge>
                </div>
                <div className="flex items-baseline">
                  <span className="text-2xl font-[400]">$</span>
                  <span className="text-2xl font-[400] ml-1">
                    {target.amount.toLocaleString("en-US", {
                      minimumFractionDigits: 2,
                    })}
                  </span>
                  <span className="text-sm text-gray-400 ml-2">USD</span>
                </div>
                <span className="text-[12px] text-[#CACACA]">
                  {target.unlockDate}
                </span>
              </button>
            ))}
          </div>

          <Button
            variant="ghost"
            size="icon"
            onClick={handleScrollBack}
            className="absolute left-0 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full bg-black/80 hover:bg-black/70 text-white z-10 border border-gray-700">
            <ChevronLeft className="h-4 w-4" />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={handleScroll}
            className="absolute right-0 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full bg-black/80 hover:bg-black/70 text-white z-10 border border-gray-700">
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
