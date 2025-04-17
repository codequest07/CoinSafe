import { Card } from "../ui/card";
import { Link } from "react-router-dom";
import { PercentageCardData } from "@/lib/data";
import { Badge } from "../ui/badge";

const PercentageCard = () => {
  return (
    <div className="grid sm:grid-cols-3 grid-cols-1 gap-2">
      {PercentageCardData.map((items, index) => (
        <Card
          key={index}
          className="flex border border-[#FFFFFF17] flex-col items-start gap-4 bg-[#13131340] text-white rounded-lg py-6 px-2 shadow-lg w-full">
          <div className="flex justify-between items-center w-full">
            <h3 className="text-base font-semibold">{items.title}</h3>
            {items.badge && (
              <Badge className="bg-[#79E7BA33] hover:bg-[#79E7BA33] text-[#F1F1F1] rounded-[2rem] py-1">
                {items.badge}
              </Badge>
            )}
          </div>
          <div className="flex space-x-2">
            <p className="text-xl text-[#7F7F7F]"> {items.amount}</p>
            <span className="text-xs mt-2 text-[#7F7F7F]">points</span>
          </div>
          <p>
            <Link
              to="/savings"
              className="text-[12px] text-[#79E7BA] items-center justify-center rounded-md">
              {items.link}
            </Link>{" "}
            <span className="text-xs text-[#7F7F7F]">{items.text}</span>
          </p>
        </Card>
      ))}
    </div>
  );
};

export default PercentageCard;
