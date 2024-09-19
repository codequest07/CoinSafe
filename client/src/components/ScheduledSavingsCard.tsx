import MemoUsdc from "@/icons/Usdc";
import { savings } from "@/lib/data";

export default function ScheduledSavings() {
  return (
    <div className="bg-[#13131340] text-white p-4 rounded-lg max-w-lg mx-auto sm:max-w-full">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-base font-[500] sm:text-lg">Scheduled savings</h2>
        <a href="#" className="text-sm font-[400] text-green-400 sm:text-base">
          View all
        </a>
      </div>
      {savings.map((saving, index) => (
        <div key={index} className="mb-6">
          <div className="text-sm mb-4 sm:text-base">{saving.date}</div>
          {saving.items.map((item, itemIndex) => (
            <div
              key={itemIndex}
              className="flex justify-between items-center mb-4">
              <div className="flex space-x-4 items-center">
                <MemoUsdc className="w-6 h-6 sm:w-8 sm:h-8" />
                <div>
                  <div className="font-[400] text-sm sm:text-base">
                    {item.symbol}
                  </div>
                  <div className="text-sm text-gray-400 sm:text-base">
                    {item.name}
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="font-[400] text-sm sm:text-base">
                  {item.amount} {item.symbol}
                </div>
                <div className="text-sm text-gray-400 sm:text-base">
                  ≈ {item.value}
                </div>
              </div>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
