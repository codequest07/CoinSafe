"use client";

import { X } from "lucide-react";
import { useEffect, useState } from "react";
import {
  getContract,
  prepareContractCall,
  sendAndConfirmTransaction,
} from "thirdweb";
import { client } from "@/lib/config";
import { liskSepolia } from "@/lib/config";
import { Abi } from "viem";
import { CoinsafeDiamondContract, facetAbis } from "@/lib/contract";
import { useActiveAccount } from "thirdweb/react";
import { toast } from "@/hooks/use-toast";

interface DeactivateSafeModalProps {
  details: any;
  onClose: () => void;
}

// this is to show a modal to seactivate a autosafe will check if all tokens are removed from the safe

export default function DeactivateSafeModal({
  details,
  onClose,
}: DeactivateSafeModalProps) {
  const [isSafeEmpty, setIsSafeEmpty] = useState(true);
  const [deactivating, setDeactivating] = useState(false);
  const account = useActiveAccount();

  useEffect(() => {
    const checkSafeStatus = async () => {
      if (!details || !details.tokenDetails) {
        setIsSafeEmpty(false);
        return;
      }
      details?.tokenDetails?.map((td: { amountSaved: bigint }) => {
        if (td.amountSaved > 0) {
          setIsSafeEmpty(false);
        }
      });
    };

    checkSafeStatus();
  }, []);

  const handleDeactivateSafe = async () => {
    if (!isSafeEmpty || !account) return;
    const contract = getContract({
      client,
      chain: liskSepolia,
      address: CoinsafeDiamondContract.address,
      abi: facetAbis.automatedSavingsFacet as Abi,
    });

    setDeactivating(true);
    try {
      const deactivateTx = prepareContractCall({
        contract,
        method: "function terminateAutomatedPlan() external",
        params: [],
      });

      await sendAndConfirmTransaction({
        transaction: deactivateTx,
        account,
      });

    } catch (error) {
      console.error("Deactivate Safe failed:", error);
      toast({
        title: `Deactivate Safe failed:", ${error}`,
        variant: "destructive",
      });
    } finally {
      setDeactivating(false);
    }
  };
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-transparent z-50">
      <div
        className="absolute inset-0 bg-black/80"
        onClick={(e) => {
          e.stopPropagation();
          onClose();
        }}
      ></div>
      <div className="relative w-full max-w-md rounded-lg bg-[#17171C] text-white shadow-lg">
        <div className="flex items-center justify-between p-5">
          <h2 className="text-xl font-[500]">Deactivate autosavings</h2>
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

        <div className="px-5 pb-5">
          {isSafeEmpty ? (
            <p className="mb-8 text-[14px] text-[#CACACA]">
              Are you sure you want to deactivate autosavings? This will stop
              all autosavings on all the tokens you have saved
            </p>
          ) : (
            <p className="bg-[#FF484B24] text-[#FF484B] p-4 text-sm rounded-md">
              Your Safe isn't empty you cannot deactivate your safe yet. To
              deactivate your safe empty it first.
            </p>
          )}

          <div className="mt-8 flex justify-between">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onClose();
              }}
              className="rounded-full bg-[#FFFFFF2B]  text-[14px] px-5 py-3 text-white "
            >
              Cancel
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                console.log("meeee");
                handleDeactivateSafe();
              }}
              disabled={!isSafeEmpty || deactivating}
              className="disabled:cursor-not-allowed disabled:opacity-70 rounded-full bg-red-500 px-5 text-[14px] py-3 transition text-white hover:bg-red-600"
            >
              {deactivating ? "Deactivating" : "Deactivate"}
              
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
