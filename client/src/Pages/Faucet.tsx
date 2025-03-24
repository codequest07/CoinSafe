import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { FaucetData } from "@/lib/data";
import AddTokenToMetaMask from "@/components/AddTokenToMetaMask";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import ThirdwebConnectButton from "@/components/ThirdwebConnectButton";
import { useActiveAccount } from "thirdweb/react";
import { useState } from "react";

export default function Faucet() {
  const account = useActiveAccount();
  const isConnected = !!account?.address;
  const navigate = useNavigate();
  const [message, setMessage] = useState({ text: "", type: "" });
  const [isLoading, setIsLoading] = useState(false);

  const handleClaim = async () => {
    try {
      setIsLoading(true); // Set loading state before request

      const response = await fetch(
        "https://coinsafe-0q0m.onrender.com/faucet/claim",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ address: account?.address || "" }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        // Handle specific error cases
        if (data.error?.includes("Claim too soon")) {
          const match = data.error.match(/\w{3} \w{3} \d{2} \d{4} .* GMT.*/);
          if (match) {
            const nextClaimTime = new Date(match[0]);
            const formattedTime = nextClaimTime.toLocaleString();
            throw new Error(`⏳ You can claim again at: ${formattedTime}`);
          }
        }
        throw new Error(data.error || "Faucet claim failed");
      }

      // Show success message in UI
      setMessage({
        type: "success",
        text: `✅ Success! You received ${data.amount} SAFU!`,
      });
    } catch (error: any) {
      setMessage({ type: "error", text: `❌ Error: ${error.message}` });
    } finally {
      setIsLoading(false); // Reset loading state
    }
  };

  const handleGoBack = () => {
    navigate(-1);
  };
  return (
    <main>
      <Navbar />
      <div className="sm:min-h-fit  bg-[#13131373] text-white p-8 mt-20">
        <Card className="w-full sm:max-w-xl border-[#FFFFFF17] sm:mx-auto bg-[#13131373] text-white">
          <CardHeader>
            <button
              onClick={handleGoBack}
              className="inline-flex items-center text-sm text-white hover:text-white mb-3">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to app
            </button>
            <CardTitle className="text-2xl font-[400]">Claim faucet</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-center mb-5">
              Connect your EVM wallet to claim SAFU testnet tokens
            </p>
            <div className="space-y-6">
              <div>
                {/* <label htmlFor="evmAddress" className="text-sm font-medium">
                  EVM address
                </label> */}
                {message.text && (
                  <main className="flex justify-center">
                    <div
                      className={`p-3 rounded-[2rem] my-3 text-center w-fit ${
                        message.type === "error"
                          ? "bg-[#FF484B24] text-[#FF484B]"
                          : "bg-[#48FF9124] text-[#48FF91]"
                      }`}>
                      <p className="text-xs break-words">{message.text}</p>
                    </div>
                  </main>
                )}
              </div>
              <div className="flex space-x-2 sm:space-x-4 justify-center w-full">
                <div className="">
                  <AddTokenToMetaMask />
                </div>
                {!isConnected ? (
                  <ThirdwebConnectButton />
                ) : (
                  <Button
                    className="bg-white rounded-[2rem] text-[#010104] hover:bg-[#ececee]"
                    onClick={handleClaim}
                    disabled={isLoading}>
                    {isLoading ? "Processing..." : "Claim faucet"}
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
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
    </main>
  );
}
