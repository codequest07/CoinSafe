import { useRef } from "react";
import { useNavigate } from "react-router-dom";
// import { ChevronRight, ChevronLeft } from "lucide-react";
// import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useSavingsCardsData } from "@/hooks/useSavingsCardsData";

export default function MobileSavingsCards() {
  const navigate = useNavigate();

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const {
    safes,
    displaySafes,
    totalUsdValue,
    isLoading,
    isError,
    hasActiveAutoSavings,
  } = useSavingsCardsData();

  return (
    <div className="bg-black text-white p-4 w-full">
      <div className="max-w-[73rem] w-full">
        {/* <h2 className="text-xl mb-4">Your savings targets</h2> */}
        <div className="relative">
          {isLoading ? (
            <div className="flex flex-col gap-4 pb-4">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="shrink-0 w-[280px] p-6 rounded-lg border border-[#FFFFFF21]"
                >
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
          ) : displaySafes.length === 0 && safes.length === 0 ? (
            <div className="text-white text-center py-8">
              You don't have any safes yet.
            </div>
          ) : displaySafes.length === 0 && safes.length > 0 ? (
            <div className="flex flex-col gap-4 pb-4">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="shrink-0 w-[280px] p-6 rounded-lg border border-[#FFFFFF21]"
                >
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
          ) : (
            <>
              <div
                ref={scrollContainerRef}
                className="flex flex-col gap-4 pb-4"
                style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
              >
                {hasActiveAutoSavings && (
                  <button
                    onClick={() => navigate("/vault/auto-safe")}
                    className="text-left shrink-0 w-[280px] p-6 rounded-lg border border-[#FFFFFF21] transition-colors"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div className="text-sm text-gray-400 font-[300]">
                        {"Auto-savings"}
                      </div>
                      <Badge
                        className={`
                        bg-[#79E7BA33] font-[400] text-[#F1F1F1] rounded-xl flex items-center p-1 px-2 hover:bg-[#79E7BA33]
                      `}
                      >
                        {"Locked"}
                      </Badge>
                    </div>
                    <div className="flex items-baseline">
                      <span className="text-2xl font-[400]">$</span>
                      <span className="text-2xl font-[400] ml-1">
                        {/* {Number(
                          formatUnits(
                            details?.tokenDetails?.reduce(
                              (total: any, obj: any) => total + obj.amountSaved,
                              0n
                            ),
                            getTokenDecimals(
                              details?.tokenDetails?.[0]?.token || "0x"
                            )
                          )
                        ).toLocaleString("en-US", {
                          minimumFractionDigits: 2,
                        }) || 0.0} */}
                        {totalUsdValue}
                      </span>
                      <span className="text-sm text-gray-400 ml-2">USD</span>
                    </div>
                  </button>
                )}

                {displaySafes.map((safe) => (
                  <button
                    key={safe.id}
                    onClick={() =>
                      navigate(
                        safe.id === "911" && safe.name === "Emergency Safe"
                          ? "/vault/emergency-safe"
                          : `/vault/${safe.id}`,
                      )
                    }
                    className="text-left shrink-0 w-[280px] p-6 rounded-lg border border-[#FFFFFF21] transition-colors"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div className="text-sm text-gray-400 font-[300]">
                        {safe.name}
                      </div>
                      <Badge
                        className={`
                        bg-[#79E7BA33] font-[400] text-[#F1F1F1] rounded-xl flex items-center p-1 px-2 hover:bg-[#79E7BA33]
                      `}
                      >
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
            </>
          )}

          {/* <Button
            variant="ghost"
            size="icon"
            onClick={handleScrollBack}
            className="absolute left-0 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full bg-black/80 hover:bg-black/70 text-white z-10 border border-gray-700"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={handleScroll}
            className="absolute right-0 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full bg-black/80 hover:bg-black/70 text-white z-10 border border-gray-700"
          >
            <ChevronRight className="h-4 w-4" />
          </Button> */}
        </div>
      </div>
    </div>
  );
}
