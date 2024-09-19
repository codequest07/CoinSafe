import { Card } from "../ui/card";
import { rewards } from "@/lib/data";
import { Badge } from "../ui/badge";

const BadgeCard = () => {
  return (
    <div className="grid sm:grid-cols-3 grid-cols-1 gap-2">
      {rewards.map((items, index) => (
        <Card
          key={index}
          className="flex flex-col border border-[#131313B2] items-center bg-[#13131340]  text-white rounded-lg p-6 shadow-[#131313B2 ] shadow-2xl">
          <div className="flex flex-col items-center">
            <img src={items.icon} alt="" className="w-16 h-16" />{" "}
            <h3 className="text-base font-[300]">{items.title}</h3>
            <Badge className="bg-[#79E7BA17] my-3 p-2 rounded-[2rem]">
              {items.amount}
            </Badge>
          </div>
          <p className="text-sm"> {items.status}</p>
        </Card>
      ))}
    </div>
  );
};

export default BadgeCard;
