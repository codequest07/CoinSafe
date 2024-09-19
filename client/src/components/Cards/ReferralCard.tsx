import MemoCopyIcon from "@/icons/CopyIcon";
import { useState } from "react";

const ReferralCard = () => {
  const [isCopied, setIsCopied] = useState(false);
  const referralLink = "Odinson4367.jhuhuhssdguikjew.RIOR";

  const handleCopy = () => {
    navigator.clipboard.writeText(referralLink);
    setIsCopied(true);
    setTimeout(() => {
      setIsCopied(false);
    }, 2000);
  };

  return (
    <main className="px-4">
      <div className="max-w-sm bg-[#13131340] p-4 rounded-lg text-white shadow-lg">
        {/* Label */}
        <p className="text-gray-400 text-sm mb-2">Your referral link</p>

        {/* Referral link and copy button */}
        <div className="flex items-center justify-between">
          {/* Referral Link */}
          <div className="text-sm text-white truncate">{referralLink}</div>

          {/* Copy Button */}
          <button
            onClick={handleCopy}
            className="ml-4 px-4 p-1 text-sm rounded-[2rem] bg-[#79E7BA29] hover:bg-[#79E7BA29] text-white flex items-center">
            <MemoCopyIcon className="w-4 h-4 mr-2" />
            {isCopied ? "Copied" : "Copy"}
          </button>
        </div>
      </div>
    </main>
  );
};

export default ReferralCard;
