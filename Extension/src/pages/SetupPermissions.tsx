import { useState } from "react";
import { Button } from "@/components/ui/button";
import MemoWalletIcon from "@/icons/WalletIcon";
import MemoLogo from "@/icons/Logo";
import { Switch } from "@/components/ui/switch";
import MemoShieldSmall from "@/icons/ShieldSmall";
import { useNavigate } from "react-router-dom";

export default function SetupPermissions() {
  const navigate = useNavigate();
  const [viewBalance, setViewBalance] = useState(true);
  const [enablePopup, setEnablePopup] = useState(true);

  return (
    <div className="min-h-screen w-full flex flex-col justify-between space-y-28 items-center bg-gradient-to-br from-teal-900 via-gray-900 to-black text-white p-6">
      {/* Logo and Title */}
      <div className="flex flex-col items-center space-y-4">
        <div className="flex items-center justify-center space-x-3">
          <MemoLogo className="w-28 h-6" />
          <div className="w-[2px] h-6 bg-[#FFFFFF17]" />
          <p className="text-xl font-semibold tracking-wide">Whisper</p>
        </div>

        {/* Address Box */}
        <div className="w-full max-w-md bg-[#13131340] rounded-lg flex items-center justify-between p-3 mb-4">
          <p className="text-sm font-mono truncate">0xz1...xYZml</p>
          <MemoWalletIcon className="w-6 h-6 text-orange-500" />
        </div>
      </div>

      {/* Permissions Section */}
      <div className="flex items-center flex-col justify-center space-y-2">
        <div className="w-full max-w-md bg-[#13131340] rounded-lg p-4">
          {/* Section Title */}
          <div className="flex items-center mb-4 space-x-2">
            <MemoShieldSmall className="w-5 h-5 text-white" />
            <p className="text-sm font-semibold">Set up permissions</p>
          </div>

          {/* Permission Toggles */}
          <div className="space-y-4">
            {/* View Wallet Balance */}
            <div className="flex items-center justify-between">
              <label htmlFor="view-balance" className="text-xs">
                View wallet balance and activity
              </label>
              <Switch
                id="view-balance"
                checked={viewBalance}
                onCheckedChange={setViewBalance}
                className="bg-teal-500"
              />
            </div>

            {/* Enable Popup */}
            <div className="flex items-center justify-between">
              <label htmlFor="enable-popup" className="text-xs">
                Enable pop up
              </label>
              <Switch
                id="enable-popup"
                checked={enablePopup}
                onCheckedChange={setEnablePopup}
                className="bg-teal-500"
              />
            </div>
          </div>
        </div>

        {/* Description */}
        <p className="text-[10px] text-gray-400 text-center w-full max-w-[30rem] mt-6 mb-6">
          Enabling these will trigger something to happen. We do not take your
          data, nor use it for any malicious intents. Some things are subject to
          change.
        </p>
      </div>

      {/* Complete Setup Button */}
      <div className="w-full max-w-md">
        <Button
          onClick={() => navigate("/shield")}
          className="w-full bg-white text-black font-semibold rounded-full py-3 hover:bg-gray-200">
          Complete set up
        </Button>
      </div>
    </div>
  );
}
