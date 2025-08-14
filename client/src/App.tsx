import { Route, Routes } from "react-router-dom";
import Layout from "./Layout/Layout";
import Home from "./Pages/Home";
import Portfolio from "./Pages/Portfolio";
import Vault from "./Pages/Vault";
import Staking from "./Pages/Staking";
import Rewards from "./Pages/Rewards";
import SaveSense from "./Pages/SaveSense";
import { Toaster } from "./components/ui/toaster";
// import Faucet from "./Pages/Faucet";
import SavingsDetail from "./components/SavingsDetail";
import SaveAssets from "./Pages/SaveAssets";
import Deposit from "./Pages/Deposit";
import Withdraw from "./Pages/Withdraw";
import NotFound from "./components/not-found";
import { useBalances } from "./hooks/useBalances";
import { useActiveAccount } from "thirdweb/react";
import EmergencySafe from "./Pages/EmergencySafe";
import AutoSave from "./Pages/AutoSave";
import { useEffect } from "react";
import { useRecoilState } from "recoil";
import {
  availableBalanceState,
  savingsBalanceState,
  totalBalanceState,
} from "./store/atoms/balance";
import { useWatchEvents } from "./hooks/useWatchEvents";
import Profile from "./Pages/Profile";
import { SmartAccountTransactionProvider } from "./hooks/useSmartAccountTransactionInterceptor";
import {
  userCurrentStreakState,
  userLongestStreakState,
} from "./store/atoms/streak";

const App = () => {
  const [, setAvailableBalance] = useRecoilState(availableBalanceState);
  const [, setSavingsBalance] = useRecoilState(savingsBalanceState);
  const [, setTotalBalance] = useRecoilState(totalBalanceState);
  const [, setUserCurrentStreak] = useRecoilState(userCurrentStreakState);
  const [, setUserLongestStreak] = useRecoilState(userLongestStreakState);

  const account = useActiveAccount();

  useWatchEvents({
    address: account?.address as string,
    onDeposit: (amountInUsd) => {
      setAvailableBalance((prev) => prev + amountInUsd);
      setTotalBalance((prev) => prev + amountInUsd);
    },
    onWithdraw: (amountInUsd) => {
      setAvailableBalance((prev) => prev - amountInUsd);
      setTotalBalance((prev) => prev - amountInUsd);
    },
    onSave: (amountInUsd) => {
      setAvailableBalance((prev) => prev - amountInUsd);
      setSavingsBalance((prev) => prev + amountInUsd);
    },
    onClaim: (amountInUsd) => {
      setSavingsBalance((prev) => prev - amountInUsd);
      setAvailableBalance((prev) => prev + amountInUsd);
    },
    onSavingsWithdrawn: (amountInUsdToDeduct, amountInUsdToAdd) => {
      setSavingsBalance((prev) => prev - amountInUsdToDeduct);
      setAvailableBalance((prev) => prev + amountInUsdToAdd);
    },
    onStreakUpdate: (streak) => {
      setUserCurrentStreak((prev) => prev + BigInt(streak));
      setUserLongestStreak((prev) => prev + BigInt(streak));
    },
  });

  const balances = useBalances(account?.address as string);

  useEffect(() => {
    if (account?.address) {
      console.log("Balances updated:", balances);
    }
  }, [account?.address, balances]);

  console.log("App Component rerendered");

  return (
    <div className="bg-[#010104]">
      <SmartAccountTransactionProvider>
        <Routes>
          {/* <Route path="/" element={<LandingPage />} /> */}
          {/* <Route path="/" element={<Navigate to={"/dashboard"} />} /> */}
          {/* <Route path="/extension" element={<Extension />} /> */}
          {/* <Route path="/contact" element={<ContactUs />} /> */}
          {/* <Route path="/faucet" element={<Faucet />} /> */}
          <Route path="/" element={<Layout />}>
            <Route path="/" element={<Home />} />
            <Route path="/wallet" element={<Portfolio />} />
            <Route path="/vault" element={<Vault />} />
            <Route path="/vault/:id" element={<SavingsDetail />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/vault/emergency-safe" element={<EmergencySafe />} />
            <Route path="/vault/auto-safe" element={<AutoSave />} />
            <Route path="/staking" element={<Staking />} />
            <Route path="/rewards" element={<Rewards />} />
            <Route path="/SaveSense" element={<SaveSense />} />
            {/* Test */}
            <Route path="/save-assets" element={<SaveAssets />} />
            <Route path="/deposit" element={<Deposit />} />
            <Route path="/withdraw-assets" element={<Withdraw />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </SmartAccountTransactionProvider>
      <Toaster />
    </div>
  );
};

export default App;
