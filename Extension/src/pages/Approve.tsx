import { Button } from "@/components/ui/button";
import MemoLogo from "@/icons/Logo";
import MemoWalletIcon from "@/icons/WalletIcon";

export default function Approve() {
  return (
    <div className="min-h-screen w-full flex flex-col justify-between space-y-28 items-center bg-gradient-to-br from-teal-900 via-gray-900 to-black text-white p-6">
      {/* Logo and Title */}
      <div className="flex flex-col items-center space-y-6">
        <div className="flex items-center justify-center space-x-3">
          <MemoLogo className="w-28 h-6" />
          <div className="w-[2px] h-6 bg-[#FFFFFF17]" />
          <p className="text-xl font-semibold tracking-wide">Whisper</p>
        </div>

        {/* Address Box */}
        <div className="w-full max-w-md bg-[#13131340] rounded-lg flex items-center justify-between p-3 mb-4">
          <p className="text-sm font-mono truncate">0xz1...xYZml</p>
          <MemoWalletIcon className="w-6 h-6 text-orange-500" />
        </div>
      </div>

      {/* Transaction Information */}
      <div className="w-full max-w-md bg-[#13131340] rounded-lg p-4 mb-6">
        <p className="text-sm leading-relaxed">
          You're about to spend{" "}
          <span className="font-semibold">0.00234 AVAX</span>. Since you've set
          up a <span className="font-semibold">20% save</span> on each
          transaction with CoinSafe, our smart contract will automatically lock
          an additional <span className="font-semibold">0.00234 AVAX</span> for
          7 days.
        </p>
      </div>

      {/* Action Buttons */}
      <div className="w-full max-w-md flex justify-between space-x-4 mt-6">
        <Button className="w-full bg-black text-white font-semibold rounded-full py-3 hover:bg-gray-800">
          Reject
        </Button>
        <Button className="w-full bg-white text-black font-semibold rounded-full py-3 hover:bg-gray-200">
          Sign transaction
        </Button>
      </div>
    </div>
  );
}
