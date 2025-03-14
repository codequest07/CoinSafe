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
  const [saveSenseData, setSaveSenseData] = useState(null);
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

    if (hasApproved) {
      fetchDataFromAPI();
    } else {
      setIsPermissionModalOpen(true);
    }
  };

  const fetchDataFromAPI = async () => {
    setIsLoadingModalOpen(true);

    try {
      const response = await fetch(
        `https://coinsafe-0q0m.onrender.com/main/${address}`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch data");
      }

      const data = await response.json();
      setSaveSenseData(data);
      setIsLoadingModalOpen(false);
      setIsSaveSenseModalOpen(true);
    } catch (error) {
      console.error("Error fetching data:", error);
      setIsLoadingModalOpen(false);
      toast({
        title: "Failed to fetch data",
        description: "Please try again later",
        variant: "destructive",
      });
    }
  };

  const handlePermissionApprove = () => {
    setIsPermissionModalOpen(false);
    setApproved();
    fetchDataFromAPI();
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

  // Expose methods to trigger from parent component
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
