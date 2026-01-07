import { Route, Routes } from "react-router-dom";
import LandingPage from "./Pages/LandingPage";

import NotFound from "./components/not-found";
import ContactUs from "./Pages/Contact-Us";

const App = () => {
  return (
    <div className="bg-[#010104]">
      <Routes>
        <Route path="/" element={<LandingPage />} />

        <Route path="/contact-us" element={<ContactUs />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </div>
  );
};

export default App;
