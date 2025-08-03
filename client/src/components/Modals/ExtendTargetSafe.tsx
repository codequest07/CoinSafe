"use client";

import { X } from "lucide-react";
import { useState } from "react";
// import { useActiveAccount } from "thirdweb/react";
import { DurationSelector } from "../DurationSelector";
import { addDays, differenceInDays, format, startOfDay } from "date-fns";
import { useRecoilState } from "recoil";
import { saveAtom } from "@/store/atoms/save";
import { useExtendSavingsTarget } from "@/hooks/useExtendSavingsTarget";
import { useParams } from "react-router-dom";

interface ExtendTargetSafeModalProps {
  details: any;
  onClose: () => void;
  // closeAllModals: () => void;
}

// this is to show a modal to seactivate a autosafe will check if all tokens are removed from the safe

export default function ExtendTargetSafeModal({
  details,
  onClose,
}: // closeAllModals,
ExtendTargetSafeModalProps) {
  // const [isSafeEmpty, setIsSafeEmpty] = useState(true);
  // const account = useActiveAccount();
  const { id: safeId } = useParams();

  const [saveState, setSaveState] = useRecoilState(saveAtom);

  //   Duration state
  const [savingsDuration, setSavingsDuration] = useState(30);
  const [endDate, setEndDate] = useState("");
  const [, setUnlockDate] = useState<Date | null>(null);

  const [isDurationDisabled] = useState(false);

  // Custom date state
  const [customDate, setCustomDate] = useState<Date | undefined>(undefined);
  const [isCustomSelected, setIsCustomSelected] = useState(false);
  const today = startOfDay(new Date());

  // Handle custom date selection
  const handleCustomDateSelect = (date: Date | undefined) => {
    if (!date) return;

    setCustomDate(date);
    setIsCustomSelected(true);

    const daysDiff = differenceInDays(date, today);
    setSavingsDuration(daysDiff);
    setEndDate(format(date, "dd MMMM yyyy"));
    setUnlockDate(date);

    const durationInSeconds = daysDiff * 24 * 60 * 60;
    setSaveState((prevState) => ({
      ...prevState,
      duration: durationInSeconds,
    }));
  };

  // useEffect(() => {
  //   const checkSafeStatus = async () => {
  //     if (!details || !details.tokenDetails) {
  //       setIsSafeEmpty(false);
  //       return;
  //     }
  //     details?.tokenDetails?.map((td: { amountSaved: bigint }) => {
  //       if (td.amountSaved > 0) {
  //         setIsSafeEmpty(false);
  //       }
  //     });
  //   };

  //   checkSafeStatus();
  // }, []);

  // const { extendAutoSafe, isLoading: extending } = useCreateAutoSavings({
  //   address: account?.address as `0x${string}`,
  //   saveState,
  //   onSuccess: () => {
  //     closeAllModals();
  //   },
  //   onError: (error) => {
  //     console.error("Extend Safe failed:", error);
  //     // Handle error, e.g., show a toast notification
  //   }
  // });

  const { extendTargetSafe, isLoading: extending } = useExtendSavingsTarget({
    // address: account?.address as `0x${string}`,
    safeId: Number(safeId),
    saveState,
    onSuccess: () => {
      // closeAllModals();
      console.log("Successful extension");
    },
    onError: (error) => {
      console.error("Extend Safe failed:", error);
      // Handle error, e.g., show a toast notification
    },
  });

  const savingsDurationOptions = [
    { value: 30, label: "30 days" },
    { value: 60, label: "60 days" },
    { value: 120, label: "120 days" },
  ];

  const calculateEndDate = (days: number) => {
    const currentDate = new Date(
      details?.unlockTime ? Number(details.unlockTime) * 1000 : Date.now()
    );
    const futureDate = addDays(currentDate, days);
    return format(futureDate, "dd MMMM yyyy");
  };

  const handleDurationChange = (duration: number) => {
    setSavingsDuration(duration);
    setEndDate(calculateEndDate(duration));
    setIsCustomSelected(false);

    const durationInSeconds = duration * 24 * 60 * 60;

    setSaveState((prevState) => ({
      ...prevState,
      duration: durationInSeconds,
    }));

    const calculatedUnlockDate = addDays(new Date(), duration);
    setUnlockDate(calculatedUnlockDate);
  };

  return (
    <>
      <div></div>
      <div className="fixed inset-0 flex items-center justify-center bg-transparent z-50">
        <div
          className="absolute inset-0 bg-black/80"
          onClick={(e) => {
            e.stopPropagation();
            onClose();
          }}
        ></div>
        <div className="relative w-full max-w-md rounded-xl bg-[#17171C] text-white shadow-lg p-5 border border-white/15">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-[500]">Extend Target</h2>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onClose();
              }}
              className="rounded-full p-1 bg-white "
              aria-label="Close"
            >
              <X className="h-4 w-4 text-black" />
            </button>
          </div>

          <div className="mt-8">
            <div className="text-[14px] mt-4 mb-3 flex justify-between items-center">
              <p className="">Current Duration</p>
              <p className="text-[12px]">
                Unlocks on{" "}
                {details?.unlockTime
                  ? format(new Date(Number(details.unlockTime)), "PPP")
                  : "N/A"}
              </p>
            </div>
            <p className="text-[#7F7F7F]/80 text-[15px] font-light border border-[#7F7F7F]/80 rounded-lg px-4 py-2 w-full bg-transparent">
              {Number(details?.duration ?? 0n) / 86400} days
            </p>
          </div>

          <div className="mt-8">
            <DurationSelector
              options={savingsDurationOptions}
              selectedValue={savingsDuration}
              onChange={handleDurationChange}
              onCustomDateSelect={handleCustomDateSelect}
              customDate={customDate}
              isCustomSelected={isCustomSelected}
              className="mb-4"
              isDisabled={isDurationDisabled}
              label="New Duration"
              unlockDate={endDate}
            />
          </div>

          <div className="mt-8 flex justify-between">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onClose();
              }}
              className="rounded-full bg-[#FFFFFF2B]  text-[14px] px-5 py-2.5 text-white "
            >
              Cancel
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                extendTargetSafe(e);
              }}
              disabled={!details || extending}
              className="disabled:cursor-not-allowed disabled:opacity-70 rounded-full bg-white text-[14px] py-2.5 transition text-black px-6"
            >
              {extending ? "Extending" : "Extend"}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
