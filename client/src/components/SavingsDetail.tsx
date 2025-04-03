import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useBalances } from "@/hooks/useBalances";
import { useActiveAccount } from "thirdweb/react";
import ClaimCard from "./Cards/ClaimCard";
import { AssetTabs } from "./Asset-tabs";
import { Badge } from "./ui/badge";
import SavingsCard from "./Cards/SavingsCard";

export default function SavingsDetail() {
  const navigate = useNavigate();
  const { id } = useParams();

  const account = useActiveAccount();
  const isConnected = !!account?.address;
  const address = account?.address;
  const { savingsBalance } = useBalances(address as string);

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <div className="max-w-5xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center gap-4 ">
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full"
              onClick={() => navigate(-1)}>
              <ArrowLeft className="h-6 w-6" />
            </Button>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl">{id} savings</h1>
              <Badge className="bg-[#79E7BA33] inline-block px-2 py-2 rounded-[2rem] text-xs">
                Unlocks every 30 days
              </Badge>
            </div>
          </div>
          <p className="text-base my-1 ml-[3.3rem] text-gray-300">
            Next unlock date: 25th December, 2025
          </p>
        </div>

        <div className="flex gap-2 pr-4 pb-2">
          <SavingsCard
            title="Savings balance"
            value={isConnected ? Number(savingsBalance.toFixed(2)) ?? 0.0 : 0.0}
            unit="USD"
            text={<>sum of all balances</>}
          />
          <ClaimCard
            title="Claimable balance"
            value={0.0}
            unit="USD"
            text="sum of all your claimable assets"
          />
        </div>

        <div className="py-2">
          <AssetTabs />
        </div>
      </div>
    </div>
  );
}
