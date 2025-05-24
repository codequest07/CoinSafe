import React, { RefObject, useState } from "react";
import { toast } from "@/hooks/use-toast";
import Loading from "./loading-screen";
import SaveSenseResp from "./SaveSenseResp";
import KitchenLoading from "./kitchen-loading";
import { PermissionModal } from "./Permission-modal";
import { useApproval } from "@/contexts/ApprovalContext";
import { useActiveAccount } from "thirdweb/react";

interface SaveSenseModalManagerProps {
  trigger?: RefObject<{ fetchData: () => void; download: () => void }>;
  onClose?: () => void;
}

export const SaveSenseModalManager: React.FC<SaveSenseModalManagerProps> = ({
  trigger,
  onClose,
}) => {
  const [isLoadingModalOpen, setIsLoadingModalOpen] = useState(false);
  const [isSaveSenseModalOpen, setIsSaveSenseModalOpen] = useState(false);
  const [saveSenseData, setSaveSenseData] = useState<{
    savingsPlan: string;
  } | null>(null);
  const [showKitchenLoading, setShowKitchenLoading] = useState(false);
  const [isPermissionModalOpen, setIsPermissionModalOpen] = useState(false);
  const { hasApproved, setApproved } = useApproval();

  const account = useActiveAccount();
  const address = account?.address;

  const handleFetchData = async () => {
    if (!address) {
      toast({
        title: "No wallet connected",
        variant: "destructive",
      });
      return;
    }

    console.log("Current approval status:", hasApproved);
    if (hasApproved) {
      await fetchDataFromAPI();
    } else {
      setIsPermissionModalOpen(true);
    }
  };

  const fetchDataFromAPI = async () => {
    setIsLoadingModalOpen(true);
    setSaveSenseData(null); // Reset previous data

    try {
      const response = await fetch(
        `https://save-senseee.vercel.app/api/ai/savings-plan`,
        // `http://localhost:1234/api/ai/savings-plan`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ address }),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log("API response:", result);

      // Handle both direct and nested response structures
      const data = result.savingsPlan ? result : result.data;
      if (!data?.savingsPlan) {
        throw new Error("Invalid data format: missing savingsPlan");
      }

      setSaveSenseData(data);
      setIsSaveSenseModalOpen(true);
    } catch (error) {
      console.error("Error fetching data:", error);
      toast({
        title: "Failed to fetch data",
        description:
          error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive",
      });
    } finally {
      setIsLoadingModalOpen(false);
    }
  };

  const handlePermissionApprove = async () => {
    setIsPermissionModalOpen(false);
    setApproved();
    await fetchDataFromAPI();
  };

  const handlePermissionReject = () => {
    setIsPermissionModalOpen(false);
    onClose?.();
  };

  const handleDownload = () => {
    setShowKitchenLoading(true);
  };

  const closeSaveSenseModal = () => {
    setIsSaveSenseModalOpen(false);
    onClose?.();
  };

  const closeKitchenLoading = () => {
    setShowKitchenLoading(false);
  };

  React.useImperativeHandle(trigger, () => ({
    fetchData: handleFetchData,
    download: handleDownload,
  }));

  return (
    <>
      <PermissionModal
        isOpen={isPermissionModalOpen}
        onClose={() => setIsPermissionModalOpen(false)}
        onApprove={handlePermissionApprove}
        onReject={handlePermissionReject}
      />

      <Loading
        isOpen={isLoadingModalOpen}
        onClose={() => setIsLoadingModalOpen(false)}
      />

      <SaveSenseResp
        isOpen={isSaveSenseModalOpen}
        onClose={closeSaveSenseModal}
        data={saveSenseData}
      />

      <KitchenLoading
        isOpen={showKitchenLoading}
        onClose={closeKitchenLoading}
      />
    </>
  );
};
