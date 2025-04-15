import { Link } from "react-router-dom";
import { Badge } from "./ui/badge";

export default function StatsCards() {
  return (
    <div className="flex flex-col md:flex-row w-full gap-3">
      {/* First Card */}
      <div className="relative w-full bg-[#13131340] border border-[#FFFFFF21] rounded-lg p-4">
        <div className="flex justify-between items-start mb-3">
          <span className="text-sm text-[#CACACA] font-medium">Rewards</span>
          <Badge className="text-white bg-[#79E7BA33] rounded-xl hover:bg-[#79E7BA33]">
            0.0x
          </Badge>
        </div>
        <p className="text-xl md:text-base flex items-center gap-2 text-[#F1F1F1] font-[400]">
          0.00
          <span className="text-sm font-[300] text-[#CACACA]">points</span>
        </p>
        <p className="text-[#7F7F7F] text-sm mt-2">
          <Link to="#" className="text-[#79E7BA]">
            find out
          </Link>{" "}
          how points will be used
        </p>
      </div>

      {/* Second Card */}
      <div className="relative w-full bg-[#13131340] border border-[#FFFFFF21] rounded-lg p-4">
        <div className="flex justify-between items-start mb-3">
          <span className="text-sm text-[#CACACA] font-medium">
            Savings streak
          </span>
        </div>
        <p className="text-xl md:text-base flex items-center gap-2 text-[#F1F1F1] font-[400]">
          0<span className="text-sm font-[300] text-[#CACACA]">days</span>
        </p>
        <p className="text-[#7F7F7F] text-sm mt-2">
          <Link to="#" className="text-[#79E7BA]">
            maintain
          </Link>{" "}
          your streak for points multipliers
        </p>
      </div>

      {/* Third Card */}

      <div className="relative w-full bg-[#13131340] border border-[#FFFFFF21] rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex justify-between items-start mb-3">
              <div className="flex items-center gap-2">
                <span className="text-sm text-[#CACACA] font-medium">
                  Gas coverage
                </span>
                <Badge className="text-[#FCFCFC] bg-[#79E7BA33] rounded-xl hover:bg-[#79E7BA33]">
                  Coming soon
                </Badge>
              </div>
            </div>
            <p className="text-xl md:text-base flex items-center gap-2 text-[#F1F1F1] font-[400]">
              $ 0.00 / $ 0.00
              <span className="text-sm font-[300] text-[#CACACA]">--</span>
            </p>
            <p className="text-[#7F7F7F] text-sm mt-2">
              <Link to="#" className="text-[#79E7BA]">
                save more
              </Link>{" "}
              to earn higher gas coverage
            </p>
          </div>
          <img src="/assets/gas.svg" alt="Shell icon" className="h-16 w-16" />
        </div>
      </div>
    </div>
  );
}
