import { Dialog, DialogContent } from "@/components/ui/dialog";

interface PermissionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApprove: () => void;
  onReject: () => void;
}

export function PermissionModal({
  isOpen,
  onClose,
  onApprove,
  onReject,
}: PermissionModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] border-1 border-[#FFFFFF21] text-white bg-[#17171C] p-0">
        <div className="p-6">
          <h2 className="text-xl font-[400] mb-8">Approve access</h2>

          <div className="flex justify-center mb-8">
            <img src="/assets/coinsafe-logo.png" alt="Coinsafe" />
          </div>

          <h3 className="text-xl text-center font-semibold mb-4">
            We need your permission!
          </h3>

          <p className="text-[#B5B5B5] text-sm mb-8">
            You&apos;ll need to review and agree to our Terms and Conditions in
            a Smart contract. This will allow our AI, SaveSense access to your
            wallet activity, and provide a personalized savings plan, just for
            you!
          </p>

          <div className="flex gap-4 justify-center">
            <button
              onClick={onReject}
              className="px-6 py-2 rounded-full bg-[#2C2C2C] hover:bg-[#3C3C3C] transition-colors">
              Reject
            </button>
            <button
              onClick={onApprove}
              className="px-6 py-2 rounded-full bg-white text-black hover:bg-gray-100 transition-colors">
              Approve
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
