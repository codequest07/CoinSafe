import { useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronRight, ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useGetSafes } from "@/hooks/useGetSafes";
import { formatUnits } from "viem";
import { Skeleton } from "@/components/ui/skeleton";

interface DisplaySafe {
  id: string;
  name: string;
  amount: number;
  status: "Flexible" | "Locked";
  unlockDate: string;
}

export default function SavingsCards() {
  const navigate = useNavigate();

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const { safes, isLoading, isError, fetchSafes } = useGetSafes();

  // Force refresh safes when component mounts
  useEffect(() => {
    fetchSafes();
  }, [fetchSafes]);

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

  // Transform safes data to display format
  const displaySafes: DisplaySafe[] =
    safes?.map((safe) => {
      // Calculate total amount across all tokens
      const totalAmount = safe.tokenAmounts.reduce((sum, token) => {
        // Convert BigInt to number with proper decimal formatting
        const tokenAmount = Number(formatUnits(token.amount, 18));
        return sum + tokenAmount;
      }, 0);

      // Format unlock date
      const unlockDate = new Date(Number(safe.unlockTime) * 1000);
      const formattedDate = unlockDate.toLocaleDateString("en-US", {
        day: "numeric",
        month: "long",
        year: "numeric",
      });

      return {
        id: safe.id.toString(),
        name: safe.target,
        amount: totalAmount,
        // Determine if flexible or locked based on duration
        status: Number(safe.duration) > 0 ? "Locked" : "Flexible",
        unlockDate: `Unlocks on ${formattedDate}`,
      };
    }) || [];

  return (
    <div className="bg-black text-white p-4 w-full">
      <div className="max-w-[73rem] w-full">
        <h2 className="text-xl mb-4">Your savings targets</h2>
        <div className="relative">
          {isLoading ? (
            <div className="flex space-x-4 pb-4">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="shrink-0 w-[280px] p-6 rounded-lg border border-[#FFFFFF21]">
                  <div className="flex justify-between items-start mb-4">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-6 w-16 rounded-xl" />
                  </div>
                  <div className="flex items-baseline mb-2">
                    <Skeleton className="h-8 w-32" />
                  </div>
                  <Skeleton className="h-4 w-40" />
                </div>
              ))}
            </div>
          ) : isError ? (
            <div className="text-red-500 text-center py-8">
              Error loading safes. Please try again.
            </div>
          ) : displaySafes.length === 0 ? (
            <div className="text-white text-center py-8">
              You don't have any safes yet.
            </div>
          ) : (
            <div
              ref={scrollContainerRef}
              className="flex space-x-4 pb-4 overflow-x-auto hide-scrollbar"
              style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}>
              {displaySafes.map((safe) => (
                <button
                  key={safe.id}
                  onClick={() => navigate(`/dashboard/vault/${safe.id}`)}
                  className="text-left shrink-0 w-[280px] p-6 rounded-lg border border-[#FFFFFF21] transition-colors">
                  <div className="flex justify-between items-start mb-4">
                    <div className="text-sm text-gray-400 font-[300]">
                      {safe.name}
                    </div>
                    <Badge
                      className={`
                        bg-[#79E7BA33] font-[400] text-[#F1F1F1] rounded-xl flex items-center p-1 px-2 hover:bg-[#79E7BA33]
                      `}>
                      {safe.status}
                    </Badge>
                  </div>
                  <div className="flex items-baseline">
                    <span className="text-2xl font-[400]">$</span>
                    <span className="text-2xl font-[400] ml-1">
                      {safe.amount.toLocaleString("en-US", {
                        minimumFractionDigits: 2,
                      })}
                    </span>
                    <span className="text-sm text-gray-400 ml-2">USD</span>
                  </div>
                  <span className="text-[12px] text-[#CACACA]">
                    {safe.unlockDate}
                  </span>
                </button>
              ))}
            </div>
          )}

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
