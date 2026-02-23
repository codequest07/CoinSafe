import { Skeleton } from "@/components/ui/skeleton";
import { useMobileHeader } from "@/hooks/useMobileHeader";

/**
 * A reusable mobile header component that displays:
 * - Current route name (with loading skeleton)
 * - Streak badge
 * - Motivational message
 *
 * Only visible on mobile devices (hidden on sm and larger screens)
 *
 * This component is completely self-contained and handles all its own data fetching
 * and state management through the useMobileHeader hook.
 */
export default function MobileHeader() {
  const { routeName, isLoading } = useMobileHeader();
  return (
    <div className="flex flex-col space-y-2 py-2 sm:hidden items-start">
      {/* Current Route Name and Badge */}
      <div className="flex px-2 space-x-2 items-center">
        {isLoading ? (
          <Skeleton className="h-5 w-32" />
        ) : (
          <span className="text-sm text-[#F1F1F1]">{routeName}</span>
        )}
        {/* <span className="text-xs bg-[#F3B42324] text-[#F1F1F1] py-1 px-2 rounded-full">
          {formattedStreak}
        </span> */}
      </div>
    </div>
  );
}
