import { useState, useEffect } from "react";

export const useApprovalStatus = () => {
  const [hasApproved, setHasApproved] = useState(false);

  useEffect(() => {
    // Check if the user has previously approved
    const approvedStatus = localStorage.getItem("userApproved");
    if (approvedStatus === "true") {
      setHasApproved(true);
    }
  }, []);

  const setApproved = () => {
    setHasApproved(true);
    localStorage.setItem("userApproved", "true");
  };

  return { hasApproved, setApproved };
};
