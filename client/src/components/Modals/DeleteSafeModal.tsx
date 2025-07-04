import React, { useState } from "react";
import { Loader2, X } from "lucide-react";
import { useDeleteSafe } from "@/hooks/useDeleteSafe";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

interface DeleteSafeModalProps {
  id: number;
  isOpen: boolean;
  onClose: () => void;
  onDelete: () => void;
}

const DeleteSafeModal: React.FC<DeleteSafeModalProps> = ({
  id,
  isOpen,
  onClose,
  //   onDelete,
}) => {
  const [inputValue, setInputValue] = useState("");
  const isDeleteEnabled = inputValue === "DELETE";
  const navigate = useNavigate();

  const { deleteSafe, isLoading } = useDeleteSafe({
    id,
    onSuccess: () => {
      //   closeAllModals();
      toast("Safe Deleted successfully");
      onClose();
      navigate("/dashboard/vault");
    },
    onError: (error) => {
      console.error("Extend Safe failed:", error);
      toast("Error Deleting Safe");
      // Handle error, e.g., show a toast notification
    },
  });

  const handleDelete = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (isDeleteEnabled) {
      //   onDelete();
      deleteSafe(e);
      setInputValue("");
    }
  };

  const handleClose = () => {
    onClose();
    setInputValue("");
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-[#17171C] rounded-[12px] border-[1px] border-[#FFFFFF21] p-6 w-full max-w-md mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-[#F1F1F1] text-lg font-medium">Delete safe?</h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="mb-6">
          <p className="text-[#CACACA] text-sm leading-relaxed">
            This action will delete this safe from our platform, but we may
            still have access to its data for analytics purposes. Please type
            'DELETE' below to confirm that you want to delete this safe.
          </p>
        </div>

        {/* Input */}
        <div className="mb-6">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="DELETE"
            className="w-full bg-[#17171C] text-white px-3 py-3 rounded-[8px] border-[1px] border-[#FFFFFF3D] focus:border-gray-600 focus:outline-none placeholder-gray-500"
          />
        </div>

        {/* Actions */}
        <div className="flex justify-between gap-3">
          <button
            onClick={handleClose}
            className="px-4 py-2 rounded-full bg-[#3F3F3F99] text-sm text-[#F1F1F1] hover:text-white transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={(e) => handleDelete(e)}
            disabled={!isDeleteEnabled || isLoading}
            className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${
              isDeleteEnabled
                ? "bg-[#A70000] text-[#FFFFFF] hover:bg-[#A70000]/50"
                : "bg-gray-700 text-gray-500 cursor-not-allowed"
            }`}
          >
            {isLoading ? <Loader2 /> : "Delete safe"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteSafeModal;
