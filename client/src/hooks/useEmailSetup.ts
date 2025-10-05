import { useState, useEffect } from "react";
import { useActiveAccount } from "thirdweb/react";
import { useProfile } from "./useProfile";

export function useEmailSetup() {
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [hasLoadedProfile, setHasLoadedProfile] = useState(false);
  const account = useActiveAccount();
  const address = account?.address;
  const { profile, loading } = useProfile(address);

  // Track when profile has been loaded
  useEffect(() => {
    if (!loading && address) {
      setHasLoadedProfile(true);
    }
  }, [loading, address]);

  // Check if user needs to set up email when wallet connects
  useEffect(() => {
    // Don't show modal while loading or if no address
    if (!address || loading || !hasLoadedProfile) {
      return;
    }

    // Only make decisions when we have loaded the profile data
    if (address && (!profile || !profile.email || !profile.emailVerified)) {
      setShowEmailModal(true);
    } else if (address && profile && profile.email && profile.emailVerified) {
      // If user has a verified email, hide the modal with a small delay to prevent flicker
      setTimeout(() => {
        setShowEmailModal(false);
      }, 100);
    }
  }, [address, profile, loading, hasLoadedProfile]);

  // Reset modal and state when wallet disconnects
  useEffect(() => {
    if (!address) {
      setShowEmailModal(false);
      setHasLoadedProfile(false);
    }
  }, [address]);

  const handleEmailAdded = () => {
    setShowEmailModal(false);
  };

  const handleCloseModal = () => {
    setShowEmailModal(false);
  };

  return {
    showEmailModal,
    handleEmailAdded,
    handleCloseModal,
  };
}
