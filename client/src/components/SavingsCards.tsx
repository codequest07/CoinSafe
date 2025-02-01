import { useRef } from "react";
import { useNavigate } from "react-router-dom";
import {  ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";

interface SavingsTarget {
  id: string;
  name: string;
  amount: number;
  status: "Flexible" | "Locked";
}

export default function SavingsCards() {
  const navigate = useNavigate();
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const handleScroll = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({
        left: 296,
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
    },
    { id: "general", name: "General savings", amount: 6000, status: "Locked" },
    {
      id: "wealth",
      name: "Generational wealth",
      amount: 3000,
      status: "Locked",
    },
    { id: "house", name: "House hunting", amount: 2000, status: "Locked" },
  ];

  return (
    <div className="bg-black text-white">
      <div className="max-w-[67rem]">
        <h2 className="text-xl mb-4">Your savings targets</h2>
        <div className="relative">
          <ScrollArea className="w-full">
            <div ref={scrollContainerRef} className="flex space-x-4 pb-4">
              {/* <div className="shrink-0">
                <Button
                  variant="outline"
                  className="h-[120px] w-[180px] flex flex-col items-center justify-center border-dashed border-gray-700 bg-transparent text-white hover:bg-gray-900">
                  <Plus className="h-6 w-6 mb-2" />
                  <span>Set up a target</span>
                </Button>
              </div> */}
              {targets.map((target) => (
                <button
                  key={target.id}
                  onClick={() => navigate(`/dashboard/vault/${target.id}`)}
                  className="text-left shrink-0 w-[280px] p-6 rounded-lg  border border-gray-800  transition-colors">
                  <div className="flex justify-between items-start mb-4">
                    <div className="text-sm text-gray-400">{target.name}</div>
                    <Badge
                      className={`
                        ${
                          target.status === "Flexible"
                            ? "bg-[#79E7BA33] text-[#F1F1F1] rounded-xl flex items-center p-1 px-2 hover:bg-[#79E7BA33]"
                            : "bg-[#79E7BA33] text-[#F1F1F1] rounded-xl flex items-center  p-1 px-2 hover:bg-[#79E7BA33]"
                        }
                      `}>
                      {target.status}
                    </Badge>
                  </div>
                  <div className="flex items-baseline">
                    <span className="text-2xl">$</span>
                    <span className="text-3xl font-semibold ml-1">
                      {target.amount.toLocaleString("en-US", {
                        minimumFractionDigits: 2,
                      })}
                    </span>
                    <span className="text-sm text-gray-400 ml-2">USD</span>
                  </div>
                </button>
              ))}
            </div>
            <ScrollBar orientation="horizontal" className="bg-gray-800" />
          </ScrollArea>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleScroll}
            className="absolute right-0 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full bg-black/50  hover:bg-black/50 hover:text-white">
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
