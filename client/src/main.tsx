import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { BrowserRouter } from "react-router-dom";
import { RecoilRoot } from "recoil";

import { ApprovalProvider } from "./contexts/ApprovalContext.tsx";
import { ThirdwebProvider } from "thirdweb/react";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
            <RecoilRoot>
              <ApprovalProvider>
                <ThirdwebProvider>
                  <App />
                </ThirdwebProvider>
              </ApprovalProvider>
            </RecoilRoot>
    </BrowserRouter>
  </StrictMode>
);
