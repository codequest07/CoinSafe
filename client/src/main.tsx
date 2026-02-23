import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@/lib/react-query.ts";
import App from "./App.tsx";
import "./index.css";
import { BrowserRouter } from "react-router-dom";
import { RecoilRoot } from "recoil";

import { ApprovalProvider } from "./contexts/ApprovalContext.tsx";
import { ThirdwebProvider } from "thirdweb/react";

import { registerServiceWorker } from "@/lib/service-worker-registration.ts";

// Register service worker
if (import.meta.env.PROD) {
  registerServiceWorker("/service-worker.js", {
    onSuccess: (registration) => {
      console.log("Service Worker registered successfully:", registration);
    },
    onUpdate: (registration) => {
      console.log("New content available, please refresh.");

      // Optionally show update notification
      if (registration.waiting) {
        registration.waiting.postMessage({ type: "SKIP_WAITING" });
      }
    },
    onError: (error) => {
      console.error("Service Worker registration failed:", error);
    },
  });
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <RecoilRoot>
          <ApprovalProvider>
            <ThirdwebProvider>
              <App />
            </ThirdwebProvider>
          </ApprovalProvider>
        </RecoilRoot>
      </BrowserRouter>
    </QueryClientProvider>
  </StrictMode>,
);