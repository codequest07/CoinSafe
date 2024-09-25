import { Route, Routes } from "react-router-dom";
import Home from "./pages/Home";
import AllSet from "./pages/All-set";
import SetupPermissions from "./pages/SetupPermissions";
import Approve from "./pages/Approve";

const App = () => {
  return (
    <div>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/shield" element={<AllSet />} />
        <Route path="/setup" element={<SetupPermissions />} />
        <Route path="/approve" element={<Approve />} />
      </Routes>
    </div>
  );
};

export default App;
