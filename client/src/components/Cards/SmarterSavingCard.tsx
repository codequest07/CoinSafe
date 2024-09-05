import { CardDescription, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SavingsOverviewData } from "@/lib/data";
import { main } from "../../apps/index.ts";
import { useAccount } from "wagmi";

export default function SmarterSavingCard() {
  const { address } = useAccount();

  main(`0x${address}`)
    .then((savingsPlan) => {
      if (savingsPlan) {
        console.log("Savings plan generated successfully:", savingsPlan);
      } else {
        console.log("No savings plan was generated.");
      }
    })
    .catch((error) => console.error("Error generating savings plan:", error));

  const handleButtonClick = async () => {
    if (!address) {
      console.log("No wallet address available.");
      return;
    }

    try {
      const savingsPlan = await main(`0x${address}`);
      if (savingsPlan) {
        console.log("Savings plan generated successfully:", savingsPlan);
      } else {
        console.log("No savings plan was generated.");
      }
    } catch (error) {
      console.error(
        "Error generating savings plan:",
        error instanceof Error ? error.message : error
      );
    } finally {
      // setLoading(false); // Optional: reset loading state
      console.log("hello");
    }
  };

  return (
    <div className="grid grid-cols-2 gap-3 pb-2">
      {SavingsOverviewData.map((items, index) => (
        <div
          key={index}
          className="flex border-0 items-center justify-between bg-[#092324] rounded-[12px] p-4 text-[#F1F1F1]"
        >
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
            <Button
              onClick={handleButtonClick}
              className="px-4 py-2 text-white bg-[#FFFFFF2B] text-sm text-nowrap rounded-[100px]"
            >
              {items.buttonText}
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}
