import MemoDashboard from "@/icons/Dashboard";
import MemoPortfolio from "@/icons/Portfolio";
import MemoReward from "@/icons/Reward";
// import MemoStaking from "@/icons/Staking";
import MemoVault from "@/icons/Vault";
import MemoMagicPen from "@/icons/MagicPen";
import MemoChrome from "@/icons/Chrome";
import MemoAvax from "@/icons/Avax";
import MemoChromeMagic from "@/icons/ChromeMagic";

import MemoSolana from "@/icons/Solana";
import MemoTxnUp from "@/icons/TxnUp";
import MemoBnb from "@/icons/Bnb";

import b1 from "@/icons/badges/b1.svg";
import b2 from "@/icons/badges/b2.svg";
import b3 from "@/icons/badges/b3.svg";
import b4 from "@/icons/badges/b4.svg";
import b5 from "@/icons/badges/b5.svg";
import b6 from "@/icons/badges/b6.svg";
import b7 from "@/icons/badges/b7.svg";
import b8 from "@/icons/badges/b8.svg";
import b9 from "@/icons/badges/b9.svg";
import b10 from "@/icons/badges/b10.svg";
import MemoPortfolioActive from "@/icons/PortfolioActive";
import MemoDashboardActive from "@/icons/DashboardActive";
import MemoVaultActive from "@/icons/VaultActive";
// import MemoStakingActive from "@/icons/StakingActive";
import MemoRewardActive from "@/icons/RewardActive";

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
    to: "/dashboard",
    icon: MemoDashboard,
    activeIcon: MemoDashboardActive,
    label: "Dashboard",
  },
  {
    to: "/dashboard/wallet",
    icon: MemoPortfolio,
    activeIcon: MemoPortfolioActive,
    label: "Wallet",
  },
  {
    to: "/dashboard/vault",
    icon: MemoVault,
    activeIcon: MemoVaultActive,
    label: "Vault",
  },
  {
    to: "/dashboard/rewards",
    icon: MemoReward,
    activeIcon: MemoRewardActive,
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

export const vaultAssets = [
  {
    symbol: "AVAX",
    name: "Avalanche",
    amount: "0.00234 AVAX",
    maturityDate: "25 Sept, 2024",
    value: "≈ $ 5.00",
    claimableAmount: "0.00234 AVAX",
    autosaved: true,
    // staked: false,
    // liquid: false,
    // saved: true,
  },
  {
    symbol: "AVAX",
    name: "Avalanche",
    amount: "0.00234 AVAX",
    maturityDate: "25 Sept, 2024",
    value: "≈ $ 5.00",
    claimableAmount: "0.00234 AVAX",
    autosaved: true,
    // staked: false,
    // liquid: false,
    // saved: true,
  },
  {
    symbol: "AVAX",
    name: "Avalanche",
    amount: "0.00234 AVAX",
    maturityDate: "25 Sept, 2024",
    value: "≈ $ 5.00",
    claimableAmount: "0.00234 AVAX",
    autosaved: true,
    // staked: false,
    // liquid: false,
    // saved: true,
  },
  {
    symbol: "AVAX",
    name: "Avalanche",
    amount: "0.00234 AVAX",
    maturityDate: "25 Sept, 2024",
    value: "≈ $ 5.00",
    claimableAmount: "0.00234 AVAX",
    autosaved: true,
    // staked: false,
    // liquid: false,
    // saved: true,
  },
  {
    symbol: "AVAX",
    name: "Avalanche",
    amount: "0.00234 AVAX",
    maturityDate: "25 Sept, 2024",
    value: "≈ $ 5.00",
    claimableAmount: "0.00234 AVAX",
    autosaved: true,
    // staked: false,
    // liquid: false,
    // saved: true,
  },
];

export const savingsHistoryAssets = [
  {
    symbol: "AVAX",
    name: "Avalanche",
    amount: "0.00234 AVAX",
    action: "Unlock",
    value: "≈ $ 5.00",
    tokenTypeShort: "0.00234 AVAX",
    tokenTypeFull: "Ethereum",
    status: "upcoming",
  },
  {
    symbol: "AVAX",
    name: "Avalanche",
    amount: "0.00234 AVAX",
    action: "Autosave",
    value: "≈ $ 5.00",
    tokenTypeShort: "ERC20",
    tokenTypeFull: "Ethereum",
    status: "cancelled",
  },
  {
    symbol: "SOL",
    name: "Avalanche",
    amount: "0.00234 AVAX",
    action: "Claim",
    value: "≈ $ 5.00",
    tokenTypeShort: "SPL Token",
    tokenTypeFull: "Solana",
    status: "completed",
  },
  {
    symbol: "AVAX",
    name: "Avalanche",
    amount: "0.00234 AVAX",
    action: "One-time save",
    value: "≈ $ 5.00",
    tokenTypeShort: "0.00234 AVAX",
    tokenTypeFull: "Ethereum",
    status: "processing",
  },
  {
    symbol: "AVAX",
    name: "Avalanche",
    amount: "0.00234 AVAX",
    action: "Unlock",
    value: "≈ $ 5.00",
    tokenTypeShort: "0.00234 AVAX",
    tokenTypeFull: "Ethereum",
    status: "failed",
  },
];

export const SavingsOverviewData: SavingsCardData[] = [
  {
    title: "Saving just got smarter",
    description:
      "Our AI analyzes your spending to create a custom savings plan",
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

export const TransactionHistoryData = [
  {
    type: "Deposit",
    amount: "0.00234 AVAX",
    percentage: "≈ $ 5.00",
    icons: MemoAvax,
    hash: "0x78f....68fc",
    token: "ERC 20",
    network: "Ethereum",
    date: "25 Sept, 2024",
    time: "17:00",
    status: "Completed",
    txnIcon: MemoTxnUp,
  },
  {
    type: "Staked",
    amount: "450.002 SOL",
    percentage: "≈ $ 4,506.00",
    icons: MemoSolana,
    hash: "0x78f....68fc",
    token: "TRX 20",
    network: "Tron",
    date: "26 Sept, 2024",
    time: "17:00",
    status: "Processing",
    txnIcon: MemoTxnUp,
  },
  {
    type: "Staked",
    amount: "450.002 SOL",
    percentage: "≈ $ 4,506.00",
    icons: MemoSolana,
    hash: "0x78f....68fc",
    token: "TRX 20",
    network: "Tron",
    date: "25 Sept, 2024",
    time: "17:00",
    status: "Processing",
    txnIcon: MemoTxnUp,
  },
  {
    type: "Staked",
    amount: "450.002 SOL",
    percentage: "≈ $ 4,506.00",
    icons: MemoSolana,
    hash: "0x78f....68fc",
    token: "TRX 20",
    network: "Tron",
    date: "25 Sept, 2024",
    time: "17:00",
    status: "Failed",
    txnIcon: MemoTxnUp,
  },
  {
    type: "Deposit",
    amount: "0.00234 AVAX",
    percentage: "≈ $ 5.00",
    icons: MemoAvax,
    hash: "0x78f....68fc",
    token: "ERC 20",
    network: "Ethereum",
    date: "26 Sept, 2024",
    time: "17:00",
    status: "Completed",
    txnIcon: MemoTxnUp,
  },
  {
    type: "Deposit",
    amount: "0.00234 AVAX",
    percentage: "≈ $ 5.00",
    icons: MemoAvax,
    hash: "0x78f....68fc",
    token: "ERC 20",
    network: "Ethereum",
    date: "26 Sept, 2024",
    time: "17:00",
    status: "Completed",
    txnIcon: MemoTxnUp,
  },
  {
    type: "Deposit",
    amount: "0.00234 BNB",
    percentage: "≈ $ 5.00",
    icons: MemoBnb,
    hash: "0x78f....68fc",
    token: "BNB",
    network: "Binance",
    date: "26 Sept, 2024",
    time: "17:00",
    status: "Completed",
    txnIcon: MemoTxnUp,
  },
];

export const rewards = [
  {
    title: "Original sage",
    amount: "$2 gas coverage",
    status: "Claimed",
    icon: b1,
  },
  {
    title: "Original sage",
    amount: "$2 gas coverage",
    status: "Claimed",
    icon: b2,
  },
  {
    title: "Original sage",
    amount: "$2 gas coverage",
    status: "Claim",
    icon: b3,
  },
  {
    title: "Original sage",
    amount: "$2 gas coverage",
    status: "17,000 - 180,000 points",
    icon: b4,
  },
  {
    title: "Original sage",
    amount: "$2 gas coverage",
    status: "17,000 - 180,000 points",
    icon: b5,
  },
  {
    title: "Original sage",
    amount: "$2 gas coverage",
    status: "17,000 - 180,000 points",
    icon: b6,
  },
  {
    title: "Original sage",
    amount: "$2 gas coverage",
    status: "Claimed",
    icon: b7,
  },
  {
    title: "Original sage",
    amount: "$2 gas coverage",
    status: "17,000 - 180,000 points",
    icon: b8,
  },
];

export const myReward = [
  {
    title: "Original sage",
    amount: "$2 gas coverage",
    status: "Exhausted",
    icon: b9,
  },
  {
    title: "Original sage",
    amount: "$2 gas coverage",
    status: "Active",
    icon: b10,
  },
];

export const PercentageCardData = [
  {
    title: "Savings points",
    amount: "5,827,034.00",
    link: "find out ",
    text: "how points will be used",
  },
  {
    title: "Referral points",
    amount: "5,827,034.00",
    link: "refer",
    text: "more people to get more points",
    badge: "1100",
  },
  {
    title: "Points multiplier",
    amount: "1.2 x",
    link: "find out ",
    text: "how points will be used",
  },
];

export const ClaimAssetsData = [
  {
    amount: "0.00234 AVAX",
    percentage: "≈ $ 5.00",
    icons: MemoAvax,
    token: "AVAX",
    network: "Avalanche",
    status: "Claim",
  },
  {
    amount: "0.00234 AVAX",
    percentage: "≈ $ 5.00",
    icons: MemoAvax,
    token: "AVAX",
    network: "Avalanche",
    status: "Claim",
  },
  {
    amount: "0.00234 AVAX",
    percentage: "≈ $ 5.00",
    icons: MemoAvax,
    token: "AVAX",
    network: "Avalanche",
    status: "Claim",
  },
  {
    amount: "0.00234 AVAX",
    percentage: "≈ $ 5.00",
    icons: MemoAvax,
    token: "AVAX",
    network: "Avalanche",
    status: "Claim",
  },
  {
    amount: "0.00234 AVAX",
    percentage: "≈ $ 5.00",
    icons: MemoAvax,
    token: "AVAX",
    network: "Avalanche",
    status: "Claim",
  },
];

export const extensionCardData = [
  {
    title: "Even more seamless",
    desc: "Get our extension for more seamless saving while you spend",
    btnTitle: "Download",
    icon: MemoChrome,
  },
  {
    title: "Saving just got smarter",
    desc: "Our AI analyzes your past transactions to tailor the perfect savings plan just for you",
    btnTitle: "Get started",
    icon: MemoChromeMagic,
  },
];

export const FaucetData = [
  {
    title: "LSK Faucet",
    due: "Claim 1 LSK every 7 day(s)",
    link: "https://sepolia-faucet.lisk.com/",
    btnTitle: "Claim faucet",
  },
  {
    title: "Sepolia Faucet",
    due: "Claim 0.05 Sepolia every 1 day",
    link: "https://cloud.google.com/application/web3/faucet/ethereum/sepolia",
    btnTitle: "Claim faucet",
  },
  {
    title: "ETH Lisk Sepolia Faucet",
    due: "Claim 0.01 ETH/day.",
    link: "https://thirdweb.com/lisk-sepolia-testnet",
    btnTitle: "Claim faucet",
  },
  {
    title: "Sepolia-lisk bridge",
    due: "Sepolia - Lisk Sepolia",
    link: "https://sepolia-bridge.lisk.com/bridge/lisk-sepolia-testnet",
    btnTitle: "Bridge faucet",
  },
];
