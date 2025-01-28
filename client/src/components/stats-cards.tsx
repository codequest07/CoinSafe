import { Link } from "react-router-dom";
import { Badge } from "./ui/badge";

export default function StatsCards() {
  return (
    <div className="flex w-full gap-2">
      {/* First Card */}
      <div className="relative w-full bg-[#13131340] border border-[#FFFFFF21] rounded-lg p-4  ">
        <div className="flex justify-between items-start mb-3">
          <span className="text-sm text-[#CACACA] font-medium">Rewards</span>
          <Badge className="text-white bg-[#79E7BA33] rounded-xl hover:bg-[#79E7BA33] ">
            1.2x
          </Badge>
        </div>
        <p className="text-base flex items-center  gap-2 text-[#F1F1F1]  font-[400]">
          5,827,034.00
          <span className="text-sm font-[300] text-[#CACACA]">points</span>
        </p>
        <p className=" text-[#7F7F7F] text-sm mt-2">
          <Link to="#" className="text-[#79E7BA]">
            find out
          </Link>{" "}
          how points will be used
        </p>
      </div>

      {/* Second Card */}
      <div className="relative w-full bg-[#13131340] border border-[#FFFFFF21] rounded-lg p-4  ">
        <div className="flex justify-between items-start mb-3">
          <span className="text-sm text-[#CACACA] font-medium">
            Savings streak
          </span>
        </div>
        <p className="text-base flex items-center  gap-2 text-[#F1F1F1]  font-[400]">
          1,000
          <span className="text-sm font-[300] text-[#CACACA]">days</span>
        </p>
        <p className=" text-[#7F7F7F] text-sm mt-2">
          <Link to="#" className="text-[#79E7BA]">
            maintain
          </Link>{" "}
          your streak for points multipliers
        </p>
      </div>

      {/* Third Card */}
      <div className="relative w-full bg-[#13131340] border border-[#FFFFFF21] rounded-lg p-4  ">
        <div className="flex justify-between items-start mb-3">
          <span className="text-sm text-[#CACACA] font-medium">
            Gas coverage
          </span>

          <img
            src="../../public/assets/gas.svg"
            alt="Shell icon"
            className="absolute right-3 top-2"
          />
        </div>
        <p className="text-base flex items-center gap-2 text-[#F1F1F1]  font-[400]">
          $ 0.0005 / $ 2
          <span className="text-sm font-[300] text-[#CACACA]">Sage</span>
        </p>
        <p className=" text-[#7F7F7F] text-sm mt-2">
          <Link to="#" className="text-[#79E7BA]">
            save more
          </Link>{" "}
          to earn higher gas coverage
        </p>
      </div>
    </div>
  );
}
