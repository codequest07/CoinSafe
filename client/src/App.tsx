import { Route, Routes } from "react-router-dom";
import Layout from "./Layout/Layout";
import Home from "./Pages/Home";
import Portfolio from "./Pages/Portfolio";
import Vault from "./Pages/Vault";
import Staking from "./Pages/Staking";
import Rewards from "./Pages/Rewards";
import MyRewards from "./Pages/MyRewards";
import LandingPage from "./Pages/LandingPage";
import Extension from "./Pages/Extension";

const App = () => {
  return (
    <div className="bg-[#010104]">
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/extension" element={<Extension />} /> extension
        <Route path="/dashboard" element={<Layout />}>
          <Route path="/dashboard/" element={<Home />} />
          <Route path="/dashboard/wallet" element={<Portfolio />} />
          <Route path="/dashboard/vault" element={<Vault />} />
          <Route path="/dashboard/staking" element={<Staking />} />
          <Route path="/dashboard/rewards" element={<Rewards />} />
          <Route path="/dashboard/rewards/my-rewards" element={<MyRewards />} />
        </Route>
      </Routes>
    </div>
  );
};

export default App;
