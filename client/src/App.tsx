import { Route, Routes } from "react-router-dom";
import LandingPage from "./Pages/LandingPage";

import NotFound from "./components/not-found";

const App = () => {
  return (
    <div className="bg-[#010104]">
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </div>
  );
};

export default App;
