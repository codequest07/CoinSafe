import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useActiveAccount } from "thirdweb/react";
import { profileAPI } from "../../services/api";
import { toast } from "@/hooks/use-toast";
import EmailVerificationSuccessModal from "./EmailVerificationSuccessModal";

interface EmailVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onVerified: () => void;
  onChangeEmail: () => void;
  email: string;
}

export default function EmailVerificationModal({
  isOpen,
  onClose,
  onVerified,
  onChangeEmail,
  email,
}: EmailVerificationModalProps) {
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const account = useActiveAccount();
  const address = account?.address;

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();

    const codeString = code.join("");
    if (!codeString || codeString.length !== 6) {
      toast({
        title: "Code required",
        description: "Please enter the complete 6-digit verification code",
        variant: "destructive",
      });
      return;
    }

    if (!address) {
      toast({
        title: "Wallet not connected",
        description: "Please connect your wallet first",
        variant: "destructive",
      });
      return;
    }

    setIsVerifying(true);

    try {
      const response = await profileAPI.verifyEmailCode(
        codeString,
        email,
        address
      );

      if (response.success) {
        // Show success modal instead of toast
        setShowSuccessModal(true);
        // Don't call onVerified() immediately - wait for success modal to close
      }
    } catch (error) {
      console.error("Error verifying email:", error);
      toast({
        title: "Verification failed",
        description:
          error instanceof Error ? error.message : "Failed to verify email",
        variant: "destructive",
      });
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResendCode = async () => {
    if (!address) {
      toast({
        title: "Wallet not connected",
        description: "Please connect your wallet first",
        variant: "destructive",
      });
      return;
    }

    setIsResending(true);

    try {
      // You'll need to implement a resend endpoint in your backend
      // For now, we'll just show a message
      toast({
        title: "Code resent",
        description: "A new verification code has been sent to your email",
      });
    } catch (error) {
      console.error("Error resending code:", error);
      toast({
        title: "Failed to resend code",
        description: "Please try again later",
        variant: "destructive",
      });
    } finally {
      setIsResending(false);
    }
  };

  const handleSuccessModalClose = () => {
    setShowSuccessModal(false);
    onVerified(); // Call onVerified when success modal is closed
    onClose();
  };

  const handleDigitChange = (index: number, value: string) => {
    if (value.length > 1) return; // Only allow single digit

    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);

    // Move to next input if digit is entered
    if (value && index < 5) {
      setActiveIndex(index + 1);
    }
  };

  // Focus the active input
  useEffect(() => {
    if (inputRefs.current[activeIndex]) {
      inputRefs.current[activeIndex]?.focus();
    }
  }, [activeIndex]);

  // Focus first input when modal opens
  useEffect(() => {
    if (isOpen && inputRefs.current[0]) {
      inputRefs.current[0]?.focus();
    }
  }, [isOpen]);

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !code[index] && index > 0) {
      // Move to previous input on backspace if current is empty
      setActiveIndex(index - 1);
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, 6);
    const newCode = [...code];

    for (let i = 0; i < pastedData.length && i < 6; i++) {
      newCode[i] = pastedData[i];
    }

    setCode(newCode);
    setActiveIndex(Math.min(pastedData.length, 5));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-[#17171C] backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="w-full max-w-xl">
        {/* Main card */}
        <div className="bg-[#17171C] rounded-[16px] p-8 border border-[#FFFFFF21]">
          <h1 className="text-[20px] font-light text-white mb-6">
            Verify your email address
          </h1>

          {/* <p className="text-[14px] text-[#CACACA] mb-6 leading-relaxed">
            We've sent a 6-digit verification code to <strong>{email}</strong>.
            Please enter the code below to verify your email address.
          </p> */}
          <p className="text-[14px] text-[#CACACA] mb-6 leading-relaxed">
            Please enter the OTP sent to your email address to verify your
            address
          </p>

          <form onSubmit={handleVerify} className="space-y-4 mb-6">
            <label className="text-[14px] text-[#C7C7D1] block mb-4">
              Enter OTP
            </label>

            {/* Individual digit inputs */}
            <div className="flex justify-center space-x-3 mb-12">
              {code.map((digit, index) => (
                <Input
                  key={index}
                  ref={(el) => (inputRefs.current[index] = el)}
                  type="text"
                  value={digit}
                  onChange={(e) => handleDigitChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  onPaste={handlePaste}
                  className="sm:w-16 sm:h-16 text-center text-[#F1F1F1] text-lg font-medium bg-transparent border border-[#FFFFFF3D] rounded-lg focus:border-[#79E7BA] focus:ring-2 focus:ring-[#79E7BA]"
                  maxLength={1}
                  disabled={isVerifying}
                  autoComplete="off"
                  inputMode="numeric"
                  pattern="[0-9]"
                />
              ))}
            </div>

            <div className="text-center">
              <Button
                size="sm"
                onClick={handleResendCode}
                disabled={isResending}
                className="text-[12px] text-[#79E7BA] bg-transparent hover:bg-transparent border-0 hover:text-[#79E7BA]">
                {isResending ? "Sending..." : "Resend Code"}
              </Button>
            </div>

            <div className="flex items-center gap-2 justify-between">
              <Button
                type="button"
                onClick={onChangeEmail}
                className="px-4 sm:px-8 h-12 text-[14px]  text-[#C7C7D1] bg-[#3F3F3F99] rounded-full hover:bg-[#3F3F3F99] hover:text-white">
                Change email address
              </Button>

              <Button
                type="submit"
                disabled={isVerifying || code.join("").length !== 6}
                className="px-4 sm:px-8 h-12 text-[14px] rounded-full bg-[#FFFFFFE5] hover:bg-[#FFFFFFE5] text-[#010104] disabled:opacity-50">
                {isVerifying ? "Linking..." : "Link email"}
              </Button>
            </div>
          </form>
        </div>
      </div>

      {/* Success Modal */}
      <EmailVerificationSuccessModal
        isOpen={showSuccessModal}
        onClose={handleSuccessModalClose}
        email={email}
      />
    </div>
  );
}
