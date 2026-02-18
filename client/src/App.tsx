import { Route, Routes } from "react-router-dom";
import Layout from "./Layout/Layout";
import Home from "./Pages/Home";
import Portfolio from "./Pages/Portfolio";
import Vault from "./Pages/Vault";
import Staking from "./Pages/Staking";
import Rewards from "./Pages/Rewards";
import SaveSense from "./Pages/SaveSense";
import { Toaster } from "sonner";
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
import { useEffect, useState } from "react";
import Profile from "./Pages/Profile";
import { SmartAccountTransactionProvider } from "./hooks/useSmartAccountTransactionInterceptor";
import { OnlineStatusIndicator } from "./components/pwa/online-status-indicator";
import { PWAInstallPrompt } from "./components/pwa/install-prompt";
import { PushNotificationPopup } from "./components/pwa/push-notification-popup";
import Swap from "./Pages/Swap";
import SmarterSaving from "./components/SmarterSaving";
import ConnectModal from "./components/Modals/ConnectModal";
// import { useFCMNotifications } from "./hooks/useFCMNotifications";
// import { Button } from "./components/ui/button";

import { useGlobalReactivity } from "./hooks/useGlobalReactivity";

const App = () => {
  const [openConnectModal, setOpenConnectModal] = useState(false);

  // const { sendTestNotification } = useFCMNotifications({
  //     vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY,
  //     onTokenReceived: () => console.log("Token"),
  //   });

  const account = useActiveAccount();

  // Initialize global event listeners and query invalidation
  useGlobalReactivity();

  const balances = useBalances(account?.address as string);

  useEffect(() => {
    if (account?.address) {
      console.log("Balances updated:", balances);
    }
  }, [account?.address, balances]);

  console.log("App Component rerendered");

  const handleTokenReceived = async (token: string) => {
    console.log("Token received:", token);
  };

  return (
    <div className="bg-[#010104]">
      <SmartAccountTransactionProvider>
        <SmarterSaving setIsConnectModalOpen={setOpenConnectModal} />
        {/* Always-visible components */}
        <PWAInstallPrompt
          appName="Coinsafe"
          description="Install for offline access and push notifications"
          onInstall={() => console.log("PWA Installed!")}
        />
        <OnlineStatusIndicator showWhenOnline position="top" />
        {/* <Button onClick={sendTestNotification}>Send Test Notification</Button> */}
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
            <Route path="/swap" element={<Swap />} />
            <Route path="/SaveSense" element={<SaveSense />} />
            {/* Test */}
            <Route path="/save-assets" element={<SaveAssets />} />
            <Route path="/deposit" element={<Deposit />} />
            <Route path="/withdraw-assets" element={<Withdraw />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
        <PushNotificationPopup
          vapidKey={import.meta.env.VITE_FIREBASE_VAPID_KEY}
          onTokenReceived={handleTokenReceived}
          autoShowDelay={5000} // Show after 5 seconds
          position="bottom-right"
        />
      </SmartAccountTransactionProvider>
      <Toaster richColors closeButton />

      {openConnectModal && (
        <ConnectModal
          isConnectModalOpen={openConnectModal}
          setIsConnectModalOpen={setOpenConnectModal}
        />
      )}
    </div>
  );
};

export default App;
