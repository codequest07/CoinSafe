import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useActiveAccount } from "thirdweb/react";
import { useProfile } from "../../hooks/useProfile";
import { toast } from "sonner";
import EmailVerificationModal from "./EmailVerificationModal";

interface EmailSetupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onEmailAdded?: () => void;
}

export default function EmailSetupModal({
  isOpen,
  onClose,
  onEmailAdded,
}: EmailSetupModalProps) {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const account = useActiveAccount();
  const address = account?.address;
  const { profile, updateEmail, refetch } = useProfile(address);

  // Pre-fill email if user already has one
  useEffect(() => {
    if (profile?.email) {
      setEmail(profile.email);
    }
  }, [profile?.email]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email.trim()) {
      toast.error("Email required", {
        description: "Please enter your email address",
      });
      return;
    }

    if (!address) {
      toast.error("Wallet not connected", {
        description: "Please connect your wallet first",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      await updateEmail(email.trim());
      toast.success("Email added successfully", {
        description: "Please check your email for a verification code",
      });
      setShowVerificationModal(true);
    } catch (error) {
      console.error("Error updating email:", error);
      toast.error("Error", {
        description:
          error instanceof Error ? error.message : "Failed to update email",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSkip = () => {
    onClose();
  };

  const handleVerified = async () => {
    await refetch();
    onEmailAdded?.();
    onClose();
  };

  const handleCloseVerification = () => {
    setShowVerificationModal(false);
    onClose();
  };

  const handleChangeEmail = () => {
    setShowVerificationModal(false);
    // Reset the email input to allow user to change it
    setEmail("");
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="w-full max-w-xl">
        {/* Main card */}
        <div className="bg-[#17171C] rounded-[16px] p-12 border border-[#FFFFFF21]">
          <h1 className="text-[20px] font-light text-white mb-6">
            Link your email address
          </h1>

          <p className="text-[14px] text-[#CACACA] mb-5 leading-relaxed">
            Enter your email address to get notified of activities on your safe.
            We recommend doing this to stay up to date
          </p>

          <form onSubmit={handleSubmit} className="space-y-4 mb-8">
            <label htmlFor="email" className="text-[14px] text-[#C7C7D1] block">
              Email address
            </label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-12 text-[14px] bg-transparent border-[#FFFFFF3D] text-[#F1F1F1] rounded-[12px] px-6"
              placeholder="Enter your email address"
              disabled={isSubmitting}
              required
            />
          </form>

          <div className="flex items-center gap-2 justify-between">
            <Button
              variant="ghost"
              size="lg"
              onClick={handleSkip}
              disabled={isSubmitting}
              className="text-[14px] sm:px-8 py-3 h-auto rounded-full bg-[#3F3F3F99] hover:bg-[#3F3F3F99] text-[#F1F1F1] hover:text-[#F1F1F1]"
            >
              Skip for now
            </Button>
            <Button
              size="lg"
              onClick={handleSubmit}
              disabled={isSubmitting || !email.trim()}
              className="text-[14px] sm:px-8 py-3 h-auto rounded-full bg-[#FFFFFFE5] hover:bg-[#FFFFFFE5] text-[#010104]"
            >
              {isSubmitting ? "Adding..." : "Continue"}
            </Button>
          </div>
        </div>
      </div>

      {/* Email Verification Modal */}
      <EmailVerificationModal
        isOpen={showVerificationModal}
        onClose={handleCloseVerification}
        onVerified={handleVerified}
        onChangeEmail={handleChangeEmail}
        email={email}
      />
    </div>
  );
}
