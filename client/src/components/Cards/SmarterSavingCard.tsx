import { CardDescription, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SavingsOverviewData } from "@/lib/data";

export default function SmarterSavingCard() {
  return (
    <div className="grid grid-cols-2 gap-3 pb-2">
      {SavingsOverviewData.map((items, index) => (
        <div
          key={index}
          className="flex border-0 items-center justify-between bg-[#092324] rounded-[12px] p-4 text-[#F1F1F1]">
          <div>
            <items.icon className="w-12 h-12 text-[#20FFAF]" />
          </div>
          <div>
            <CardTitle className="text-sm"> {items.title}</CardTitle>
            {/* AI analyzes your spending to create a custom savings plan. */}
            <CardDescription className="text-xs">
              {items.description}
            </CardDescription>
          </div>
          <div>
            <Button className="px-4 py-2 text-white bg-[#FFFFFF2B] text-sm text-nowrap rounded-[100px]">
              {items.buttonText}
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}
