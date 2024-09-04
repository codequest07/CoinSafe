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
      <Route path="/" element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/wallet" element={<Portfolio />} />
          <Route path="/vault" element={<Vault />} />
          <Route path="/staking" element={<Staking />} />
          <Route path="/rewards" element={<Rewards />} />
        </Route>
      </Routes>
    </div>
  );
};

export default App;
