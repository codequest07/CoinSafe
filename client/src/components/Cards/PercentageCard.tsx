import { Card } from "../ui/card";
import { Link } from "react-router-dom";
import { PercentageCardData } from "@/lib/data";
import { Badge } from "../ui/badge";

const PercentageCard = () => {
  return (
    <div className="grid sm:grid-cols-3 grid-cols-1 gap-2">
      {" "}
      {/* Use gap instead of space-x */}
      {PercentageCardData.map((items, index) => (
        <Card
          key={index}
          className="flex border border-[#FFFFFF17] flex-col items-start gap-4 bg-[#13131340] text-white rounded-lg p-6 shadow-lg w-full">
          {" "}
          {/* Ensure full width */}
          <div className="flex justify-between items-center w-full">
            {" "}
            {/* Make sure content stays within the card */}
            <h3 className="text-base font-semibold">{items.title}</h3>
            {items.badge && (
              <Badge className="bg-[#79E7BA17] rounded-[2rem]">
                {items.badge}
              </Badge>
            )}
          </div>
          <div className="flex space-x-2">
            <p className="text-xl"> {items.amount}</p>
            <span className="text-xs mt-2">points</span>
          </div>
          <p>
            <Link
              to="/savings"
              className="text-[12px] text-[#79E7BA] items-center justify-center rounded-md">
              {items.link}
            </Link>{" "}
            <span className="text-xs">{items.text}</span>
          </p>
        </Card>
      ))}
    </div>
  );
};

export default PercentageCard;
