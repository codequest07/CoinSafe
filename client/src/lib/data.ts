import MemoDashboard from "@/icons/Dashboard";
import MemoPortfolio from "@/icons/Portfolio";
import MemoReward from "@/icons/Reward";
import MemoStaking from "@/icons/Staking";
import MemoVault from "@/icons/Vault";

export const NavLinks = [
  {
    to: "/",
    icon: MemoDashboard,
    label: "Dashboard",
  },
  {
    to: "/portfolio",
    icon: MemoPortfolio,
    label: "Portfolio",
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
