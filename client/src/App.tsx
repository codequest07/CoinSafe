import { Navigate, Route, Routes } from "react-router-dom";
import Layout from "./Layout/Layout";
import Home from "./Pages/Home";
import Portfolio from "./Pages/Portfolio";
import Vault from "./Pages/Vault";
import Staking from "./Pages/Staking";
import Rewards from "./Pages/Rewards";
import MyRewards from "./Pages/MyRewards";
import LandingPage from "./Pages/LandingPage";
import Extension from "./Pages/Extension";
import SaveSense from "./Pages/SaveSense";
import { Toaster } from "./components/ui/toaster";
import Faucet from "./Pages/Faucet";
import SavingsDetail from "./components/SavingsDetail";
// import { useRecoilState } from "recoil";
// import { availableBalanceState, savingsBalanceState, totalBalanceState } from "./store/atoms/save";
// import { useContractEvents } from "./hooks/useWatchEvents";

const App = () => {
  // const [, setAvailableBalance] = useRecoilState(availableBalanceState);
  // const [, setSavingsBalance] = useRecoilState(savingsBalanceState);
  // const [, setTotalBalance] = useRecoilState(totalBalanceState);

  // useContractEvents({
  //   onDeposit: (amountInUsd) => {
  //     setAvailableBalance((prev) => prev + amountInUsd);
  //     setTotalBalance((prev) => prev + amountInUsd);
  //   },
  //   onWithdraw: (amountInUsd) => {
  //     setAvailableBalance((prev) => prev - amountInUsd);
  //     setTotalBalance((prev) => prev - amountInUsd);
  //   },
  //   onSave: (amountInUsd) => {
  //     setAvailableBalance((prev) => prev - amountInUsd);
  //     setSavingsBalance((prev) => prev + amountInUsd);
  //   },
  // });

  return (
    <div className="bg-[#010104]">
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/extension" element={<Extension />} />
        <Route path="/testnet" element={<Navigate to={"/dashboard"} />} />
        <Route path="/contact" element={<Navigate to={"/"} />} />
        <Route path="/faucet" element={<Faucet />} />
        <Route path="/dashboard" element={<Layout />}>
          <Route path="/dashboard/" element={<Home />} />
          <Route path="/dashboard/wallet" element={<Portfolio />} />
          <Route path="/dashboard/vault" element={<Vault />} />
          <Route path="/dashboard/vault/:id" element={<SavingsDetail />} />
          <Route path="/dashboard/staking" element={<Staking />} />
          <Route path="/dashboard/rewards" element={<Rewards />} />
          <Route path="/dashboard/rewards/my-rewards" element={<MyRewards />} />
          <Route path="/dashboard/SaveSense" element={<SaveSense />} />
        </Route>
      </Routes>
      <Toaster />
    </div>
  );
};

export default App;
