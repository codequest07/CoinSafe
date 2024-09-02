import MemoUsdc from "@/icons/Usdc";
import { savings } from "@/lib/data";

export default function ScheduledSavings() {
  return (
    <div className="bg-[#131313] text-white p-4 rounded-lg ">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-base font-[500]">Scheduled savings</h2>
        <a href="#" className="text-sm font-[400] text-green-400">
          View all
        </a>
      </div>
      {savings.map((saving, index) => (
        <div key={index} className="mb-6">
          <div className="text-sm mb-4">{saving.date}</div>
          {saving.items.map((item, itemIndex) => (
            <div
              key={itemIndex}
              className="flex justify-between items-center mb-4">
              <div className="flex space-x-4  items-center">
                <MemoUsdc className="w-6 h-6" />
                <div>
                  <div className="font-[400]">{item.symbol}</div>
                  <div className="text-sm text-gray-400">{item.name}</div>
                </div>
              </div>
              <div className="text-right">
                <div className="font-[400]">
                  {item.amount} {item.symbol}
                </div>
                <div className="text-sm text-gray-400">≈ {item.value}</div>
              </div>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
