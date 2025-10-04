import { useEffect } from "react";

interface EmailVerificationSuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  email: string;
}

export default function EmailVerificationSuccessModal({
  isOpen,
  onClose,
  email: _email,
}: EmailVerificationSuccessModalProps) {
  // Auto-close modal after 3 seconds
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        onClose();
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="w-full max-w-md">
        {/* Success Modal */}
        <div className="bg-[#17171C] rounded-[16px] p-8 border border-[#FFFFFF21] text-center">
          {/* Success Message */}
          <h1 className="text-[20px] font-medium text-white mb-3">
            Email address linked!
          </h1>
          {/* Success Icon */}
          <div className="flex justify-center mb-6">
            <div className="relative">
              <div className="w-24 h-24 ">
                <img src="/assets/verify.svg" alt="check-circle" />
              </div>
            </div>
          </div>

          <p className="text-[14px] text-[#CACACA] mb-6 leading-relaxed">
            You will now receive notifications on activities in your safe
          </p>
        </div>
      </div>
    </div>
  );
}
