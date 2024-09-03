import MemoDashboard from "@/icons/Dashboard";
import MemoPortfolio from "@/icons/Portfolio";
import MemoReward from "@/icons/Reward";
import MemoStaking from "@/icons/Staking";
import MemoVault from "@/icons/Vault";
import MemoMagicPen from "@/icons/MagicPen";
import MemoChrome from "@/icons/Chrome";

export type Asset = {
  symbol: string;
  name: string;
  amount: string;
  value: string;
  autosaved: boolean;
};

interface SavingsCardData {
  id?: string;
  title: string;
  description: string;
  buttonText: string;
  icon: any;
}

export const NavLinks = [
  {
    to: "/",
    icon: MemoDashboard,
    label: "Dashboard",
  },
  {
    to: "/wallet",
    icon: MemoPortfolio,
    label: "Wallet",
  },
  {
    to: "/vault",
    icon: MemoVault,
    label: "Vault",
  },

  {
    to: "/staking",
    icon: MemoStaking,
    label: "Staking",
  },
  {
    to: "/rewards",
    icon: MemoReward,
    label: "Rewards",
  },
];

export const savings = [
  {
    date: "23rd Sept, 2024",
    items: [
      {
        symbol: "USDC",
        name: "USD Coin",
        amount: "5.9483",
        value: "$5.00",
      },
      {
        symbol: "USDC",
        name: "USD Coin",
        amount: "5.9483",
        value: "$5.00",
      },
    ],
  },
  {
    date: "23rd Sept, 2024",
    items: [
      {
        symbol: "USDC",
        name: "USD Coin",
        amount: "5.9483",
        value: "$5.00",
      },
      {
        symbol: "USDC",
        name: "USD Coin",
        amount: "5.9483",
        value: "$5.00",
      },
    ],
  },
];

export const allAssets = [
  {
    symbol: "AVAX",
    name: "Avalanche",
    amount: "0.00234 AVAX",
    value: "≈ $ 5.00",
    autosaved: true,
    staked: false,
    liquid: false,
    saved: true,
  },
  {
    symbol: "AVAX",
    name: "Avalanche",
    amount: "0.00234 AVAX",
    value: "≈ $ 5.00",
    autosaved: false,
    staked: true,
    liquid: true,
    saved: false,
  },
  {
    symbol: "AVAX",
    name: "Avalanche",
    amount: "0.00234 AVAX",
    value: "≈ $ 5.00",
    autosaved: true,
    staked: true,
    liquid: false,
    saved: false,
  },
  {
    symbol: "AVAX",
    name: "Avalanche",
    amount: "0.00234 AVAX",
    value: "≈ $ 5.00",
    autosaved: true,
    staked: false,
    liquid: true,
    saved: false,
  },
  {
    symbol: "AVAX",
    name: "Avalanche",
    amount: "0.00234 AVAX",
    value: "≈ $ 5.00",
    autosaved: true,
    staked: true,
    liquid: false,
    saved: false,
  },
  {
    symbol: "AVAX",
    name: "Avalanche",
    amount: "0.00234 AVAX",
    value: "≈ $ 5.00",
    autosaved: false,
    staked: false,
    liquid: false,
    saved: true,
  },
];

export const SavingsOverviewData: SavingsCardData[] = [
  {
    title: "Saving just got smarter",
    description:
      "Our AI analyzes your spending to create a custom savings plan.",
    buttonText: "Get started",
    icon: MemoMagicPen,
  },
  {
    title: "Even more seamless",
    description: "Get our extension for more seamless saving while you spend",
    buttonText: "Download",
    icon: MemoChrome,
  },
];
