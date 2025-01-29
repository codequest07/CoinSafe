import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import VaultCard from "./VaultCard";
import { useAccount } from "wagmi";
import { useBalances } from "@/hooks/useBalances";
import AssetTable from "./AssetTable";

interface Asset {
  ticker: string;
  name: string;
  amount: string;
  value: string;
  maturityDate: string;
  autosaved: boolean;
  claimableAmount?: string;
}

export default function SavingsDetail() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { isConnected, address } = useAccount();
  const { savingsBalance } = useBalances(address as string);
  const assets: Asset[] = [
    {
      ticker: "AVAX",
      name: "Avalanche",
      amount: "0.00234 AVAX",
      value: "≈ $ 5.00",
      maturityDate: "25 Sept, 2024 • 17:00",
      autosaved: true,
    },
    {
      ticker: "AVAX",
      name: "Avalanche",
      amount: "0.00234 AVAX",
      value: "≈ $ 5.00",
      maturityDate: "25 Sept, 2024 • 17:00",
      autosaved: false,
    },
    {
      ticker: "AVAX",
      name: "Avalanche",
      amount: "0.00234 AVAX",
      value: "≈ $ 5.00",
      maturityDate: "25 Sept, 2024 • 17:00",
      autosaved: true,
    },
    {
      ticker: "AVAX",
      name: "Avalanche",
      amount: "0.00234 AVAX",
      value: "≈ $ 5.00",
      maturityDate: "25 Sept, 2024 • 17:00",
      autosaved: true,
      claimableAmount: "0.00234 AVAX\n≈ $ 5.00",
    },
    {
      ticker: "AVAX",
      name: "Avalanche",
      amount: "0.00234 AVAX",
      value: "≈ $ 5.00",
      maturityDate: "25 Sept, 2024 • 17:00",
      autosaved: false,
    },
  ];

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full"
            onClick={() => navigate(-1)}>
            <ArrowLeft className="h-6 w-6" />
          </Button>
          <h1 className="text-xl">Emergency savings</h1>
        </div>

        {/* <div className="rounded-lg border border-gray-800 bg-gray-900/50 p-6 mb-6">
          <div className="text-sm text-gray-400 mb-2">Vault balance</div>
          <div className="flex items-baseline gap-1">
            <span className="text-3xl">$</span>
            <span className="text-5xl font-semibold">6,000.00</span>
            <span className="text-gray-400">USD</span>
          </div>
          <div className="text-sm text-cyan-400 mt-2">+18% (compared to your previous savings)</div>
        </div> */}
        <VaultCard
          title="Vault balance"
          value={isConnected ? Number(savingsBalance.toFixed(2)) ?? 0.0 : 0.0}
          unit="USD"
          text=""
          // text="+18% (compared to your previous savings)"
        />

        <div className="py-2">
          {/* <AssetVaultTable /> */}
          <AssetTable />
        </div>
      </div>
    </div>
  );
}
