import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import MemoClipboard from "@/icons/Clipboard";
import { FaucetData } from "@/lib/data";
import { FaucetContract } from "@/lib/contract";
import {  useWriteContract } from "wagmi";
import { waitForTransactionReceipt } from "@wagmi/core";
import { config } from "@/lib/config";
import AddTokenToMetaMask from "@/components/AddTokenToMetaMask";

export default function Faucet() {
  const [evmAddress, setEvmAddress] = useState("");
  const [isFaucetAdded, setIsFaucetAdded] = useState(false);

  //Read contract data
  // const faucetBalance = useReadContract({
  //   abi: FaucetContract.abi.abi,
  //   address: FaucetContract.address as `0x${string}`,
  //   functionName: "getContractBalance",
  // });

  // Write to contract
  const {
    data: hash,
    error,
    isError,
    isPending,
    isSuccess,
    writeContractAsync,
  } = useWriteContract();

  async function handleClaim() {
    if (evmAddress) {
      const claimTnx = await writeContractAsync({
        address: FaucetContract.address as `0x${string}`,
        abi: FaucetContract.abi.abi,
        functionName: "claim",
      });
      // console.log(claimTnx);

      if (claimTnx) {
        const transactionReceipt = await waitForTransactionReceipt(config, {
          hash: claimTnx,
        });

        console.log(transactionReceipt);
        setIsFaucetAdded(true);
      }
    }
  }

  const getShortErrorMessage = (message: string) => {
    const maxLength = 50;
    return message.length > maxLength
      ? `${message.substring(0, maxLength)}...`
      : message;
  };

  return (
    <main>
      <Navbar />
      <div className="min-h-fit  bg-[#13131373] text-white p-8">
        <Card className="w-full sm:max-w-xl border-[#FFFFFF17] sm:mx-auto bg-[#13131373] text-white">
          <CardHeader>
            <CardTitle className="text-2xl font-[400] text-center">
              Claim faucet
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-center mb-5">
              Enter your EVM wallet address to claim SAFU testnet tokens
            </p>
            <div className="space-y-6">
              <div>
                <label htmlFor="evmAddress" className="text-sm font-medium">
                  EVM address
                </label>
                <div className="mt-1 relative">
                  <Input
                    id="evmAddress"
                    type="text"
                    value={evmAddress}
                    onChange={(e) => setEvmAddress(e.target.value)}
                    className="w-full py-5 bg-[#13131373] text-white border-zinc-700"
                  />
                  <Button
                    className="absolute bg-transparent hidden  hover:bg-transparent  sm:flex space-x-[2px] right-2 top-1/2 transform -translate-y-1/2 text-zinc-400"
                    onClick={() =>
                      navigator.clipboard.readText().then(setEvmAddress)
                    }>
                    <MemoClipboard className="w-5 h-5" />
                    <p>Paste</p>
                  </Button>
                </div>
              </div>
              <div className="sm:flex justify-between items-center mt-4">
                {/* Conditionally render the AddTokenToMetaMask component */}
                {isFaucetAdded && (
                  <div className="">
                    <AddTokenToMetaMask />
                  </div>
                )}
                <div className="sm:flex sm:justify-end w-full">
                  <Button
                    className="bg-white rounded-[2rem] text-[#010104] hover:bg-[#ececee]"
                    onClick={() => handleClaim()}
                    disabled={isPending}>
                    {isPending ? "Pending" : "Claim faucet"}
                  </Button>
                </div>
              </div>

              <div className="sm:max-w-xl">
                {isError && (
                  <p className="text-red-500">
                    Error:{" "}
                    {getShortErrorMessage(error?.message || "Unknown error")}
                  </p>
                )}
                {isSuccess && (
                  <div className=" text-green-800 p-3 rounded-lg">
                    <p className="text-green-500 break-words">
                      Txn Hash: {hash}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
        <div className="mt-6">
          <h2 className="text-base font-[400] mb-3 sm:ml-96">
            Claim other test tokens
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-w-xl h-56 mx-auto">
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
