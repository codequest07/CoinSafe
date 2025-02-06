import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import VaultCard from "./VaultCard";
import { useAccount } from "wagmi";
import { useBalances } from "@/hooks/useBalances";
import AssetTable from "./AssetTable";

export default function SavingsDetail() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { isConnected, address } = useAccount();
  const { savingsBalance } = useBalances(address as string);

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="h-6 w-6" />
          </Button>
          <h1 className="text-xl">{id} savings</h1>
        </div>

        <VaultCard
          title="Vault balance"
          value={isConnected ? Number(savingsBalance.toFixed(2)) ?? 0.0 : 0.0}
          unit="USD"
          text=""
          // text="+18% (compared to your previous savings)"
        />

        <div className="py-2">
          <AssetTable />
        </div>
      </div>
    </div>
  );
}
