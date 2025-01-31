import React, { createContext, useState, useContext, useEffect } from "react";

interface ApprovalContextType {
  hasApproved: boolean;
  setApproved: () => void;
}

const ApprovalContext = createContext<ApprovalContextType | undefined>(
  undefined
);

export const ApprovalProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [hasApproved, setHasApproved] = useState(false);

  useEffect(() => {
    const approvedStatus = localStorage.getItem("userApproved");
    if (approvedStatus === "true") {
      setHasApproved(true);
    }
  }, []);

  const setApproved = () => {
    setHasApproved(true);
    localStorage.setItem("userApproved", "true");
  };

  return (
    <ApprovalContext.Provider value={{ hasApproved, setApproved }}>
      {children}
    </ApprovalContext.Provider>
  );
};

export const useApproval = () => {
  const context = useContext(ApprovalContext);
  if (context === undefined) {
    throw new Error("useApproval must be used within an ApprovalProvider");
  }
  return context;
};
