import MemoAvax from "@/icons/Avax";
import MemoBitcoin from "@/icons/Bitcoin";
import MemoBnb from "@/icons/Bnb";
import MemoCardano from "@/icons/Cardano";
import MemoInj from "@/icons/Inj";
import MemoQnt from "@/icons/Qnt";
import MemoSolana from "@/icons/Solana";
import MemoUsdc from "@/icons/Usdc";

export default function CurrencyBreakdown() {
  return (
    <div className="bg-black text-white p-6">
      <p className="mb-2">Currency breakdown</p>

      {/* Progress Bar */}
      <div className="flex h-2 mb-4">
        <div
          className="bg-[#0C310B] h-full rounded-tl-sm rounded-bl-sm"
          style={{ width: "25%" }}></div>
        <div className="bg-[#6E450C] h-full" style={{ width: "35%" }}></div>
        <div className="bg-[#59568B] h-full" style={{ width: "30%" }}></div>
        <div
          className="bg-[#666667] h-full rounded-tr-sm rounded-br-sm"
          style={{ width: "10%" }}></div>
      </div>

      {/* Legend */}
      <div className="flex flex-col sm:flex-row flex-wrap gap-4 items-center">
        <div className="flex items-center space-x-1">
          <div className="h-[0.8rem] w-1 rounded-xl bg-[#0B3009]"></div>
          <span>Bitcoin</span>
          <span className="ml-1">
            <MemoBitcoin />
          </span>
        </div>
        <div className="flex items-center space-x-1">
          <div className="h-[0.8rem] rounded-xl w-1 bg-[#6E440B]"></div>
          <span>Solana</span>
          <span className="ml-1">
            <MemoSolana />
          </span>
        </div>
        <div className="flex items-center space-x-1">
          <div className="w-1 h-[0.8rem] bg-red-700 rounded-xl"></div>
          <span>Avalanche</span>
          <span className="ml-1">
            <MemoAvax />
          </span>
        </div>
        <div className="flex items-center space-x-1">
          <div className="w-1 h-[0.8rem] bg-[#666667]"></div>
          <span>Others</span>
          <span className="ml-2 flex space-x-2">
            <MemoInj />
            <MemoUsdc />
            <MemoCardano />
            <MemoBnb />
            <MemoQnt />
          </span>
        </div>
      </div>
    </div>
  );
}
