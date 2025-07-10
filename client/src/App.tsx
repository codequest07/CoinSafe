import { Navigate, Route, Routes } from "react-router-dom";
import Layout from "./Layout/Layout";
import Home from "./Pages/Home";
import Portfolio from "./Pages/Portfolio";
import Vault from "./Pages/Vault";
import Staking from "./Pages/Staking";
import Rewards from "./Pages/Rewards";
import LandingPage from "./Pages/LandingPage";
import Extension from "./Pages/Extension";
import SaveSense from "./Pages/SaveSense";
import { Toaster } from "./components/ui/toaster";
import Faucet from "./Pages/Faucet";
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
import ContactUs from "./Pages/Contact-Us";
import { SmartAccountTransactionProvider } from "./hooks/useSmartAccountTransactionInterceptor";

const App = () => {
  const [, setAvailableBalance] = useRecoilState(availableBalanceState);
  const [, setSavingsBalance] = useRecoilState(savingsBalanceState);
  const [, setTotalBalance] = useRecoilState(totalBalanceState);
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
          <Route path="/" element={<LandingPage />} />
          <Route path="/extension" element={<Extension />} />
          <Route path="/testnet" element={<Navigate to={"/dashboard"} />} />
          <Route path="/contact" element={<ContactUs />} />
          <Route path="/faucet" element={<Faucet />} />
          <Route path="/dashboard" element={<Layout />}>
            <Route path="/dashboard/" element={<Home />} />
            <Route path="/dashboard/wallet" element={<Portfolio />} />
            <Route path="/dashboard/vault" element={<Vault />} />
            <Route path="/dashboard/vault/:id" element={<SavingsDetail />} />
            <Route path="/dashboard/profile" element={<Profile />} />
            <Route
              path="/dashboard/vault/emergency-safe"
              element={<EmergencySafe />}
            />
            <Route path="/dashboard/vault/auto-safe" element={<AutoSave />} />
            <Route path="/dashboard/staking" element={<Staking />} />
            <Route path="/dashboard/rewards" element={<Rewards />} />
            <Route path="/dashboard/SaveSense" element={<SaveSense />} />
            {/* Test */}
            <Route path="/dashboard/save-assets" element={<SaveAssets />} />
            <Route path="/dashboard/deposit" element={<Deposit />} />
            <Route path="/dashboard/withdraw-assets" element={<Withdraw />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </SmartAccountTransactionProvider>
      <Toaster />
    </div>
  );
};

export default App;
