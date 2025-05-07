"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { FaucetData } from "@/lib/data";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import AddTokenToMetaMask from "@/components/AddTokenToMetaMask";
import MemoClipboard from "@/icons/Clipboard";

export default function Faucet() {
  const navigate = useNavigate();
  const [message, setMessage] = useState({ text: "", type: "" });
  const [isLoading, setIsLoading] = useState(false);
  const [walletAddress, setWalletAddress] = useState("");

  const handleClaim = async () => {
    // Use manually entered address
    const addressToUse = walletAddress.trim();

    if (!addressToUse) {
      setMessage({
        type: "error",
        text: "❌ Error: Please enter a wallet address",
      });
      return;
    }

    try {
      setIsLoading(true);

      const response = await fetch(
        "https://coinsafe-0q0m.onrender.com/api/faucet/claim",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userAddress: addressToUse }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        // Handle specific error cases
        if (data.error === "Claim too soon" && data.nextClaimTime) {
          const nextClaimTime = new Date(data.nextClaimTime);
          const formattedTime = nextClaimTime.toLocaleString();
          throw new Error(`⏳ You can claim again at: ${formattedTime}`);
        }
        throw new Error(data.error || "Faucet claim failed");
      }

      // Show success message with transaction hash
      setMessage({
        type: "success",
        text: `✅ Success! Transaction hash: ${data.txHash}`,
      });
    } catch (error: any) {
      setMessage({ type: "error", text: `❌ Error: ${error.message}` });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoBack = () => {
    navigate(-1);
  };

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      setWalletAddress(text);
    } catch (err) {
      console.error("Failed to paste:", err);
    }
  };

  return (
    <div>
      <Navbar />
      <div className="sm:min-h-fit  bg-[#13131373] text-white p-8 mt-20">
        {/* Main Faucet Card */}
        <Card className="w-full max-w-xl mx-auto border border-[#1E1E24] bg-[#0D0D0F] text-white">
          <CardHeader className="pb-2">
            <button
              onClick={handleGoBack}
              className="inline-flex items-center text-sm text-[#CACACA] hover:text-white mb-3">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to app
            </button>
            <CardTitle className="text-2xl font-normal text-[#CACACA]">
              Claim faucet
            </CardTitle>
            <p className="text-sm text-[#CACACA] mt-1">
              Enter your EVM wallet address to claim SAFU testnet tokens
            </p>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {message.text && (
                <div
                  className={`p-3 rounded-[2rem] my-3 text-center ${
                    message.type === "error"
                      ? "bg-[#FF484B24] text-[#FF484B]"
                      : "bg-[#48FF9124] text-[#48FF91]"
                  }`}>
                  <p className="text-xs break-words">{message.text}</p>
                </div>
              )}
              <div>
                <label
                  htmlFor="evmAddress"
                  className="text-sm font-medium text-[#CACACA]">
                  EVM address
                </label>
                <div className="relative mt-1">
                  <Input
                    id="evmAddress"
                    value={walletAddress}
                    onChange={(e) => setWalletAddress(e.target.value)}
                    // placeholder="Enter your wallet address"
                    className="w-full  border-[#FFFFFF3D] rounded-md text-white pr-10 mb-5"
                  />
                  <button
                    className="absolute bg-[#3F3F3F99] p-1 rounded-[4px] flex items-center gap-1 right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white text-xs"
                    onClick={handlePaste}>
                    <MemoClipboard className="w-4 h-4" />
                    Paste
                  </button>
                </div>
              </div>
              <div className="flex space-x-2  sm:space-x-4 justify-end w-full">
                <div className="">
                  <AddTokenToMetaMask />
                </div>
                <Button
                  className="bg-white rounded-[2rem] text-[#010104] hover:bg-[#ececee]"
                  onClick={handleClaim}
                  disabled={isLoading}>
                  {isLoading ? "Processing..." : "Claim faucet"}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Other Test Tokens Section */}
        <div className="mt-6 ">
          <h2 className="text-base font-[400] mb-3 sm:ml-[443px]">
            Claim other test tokens
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-xl sm:h-56 mx-auto">
            {FaucetData.map((items, index) => (
              <Card
                key={index}
                className="bg-[#13131373] border-[#FFFFFF17] text-white w-full">
                <CardHeader className="p-3 pb-0">
                  <CardTitle className="text-sm mt-3">{items.title}</CardTitle>
                </CardHeader>
                <CardContent className="p-3 pt-1">
                  <p className="text-[10px] text-zinc-400 mb-2">{items.due}</p>
                  <Link
                    to={items.link}
                    target="_blank"
                    className="block w-full mt-4 text-xs text-[#79E7BA] hover:underline">
                    {items.btnTitle}
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
