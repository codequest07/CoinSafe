import { tokens } from "@/lib/contract";
import { Button } from "./ui/button";
import MemoMmIcon from "@/icons/MmIcon";
import { useState } from "react";

const AddTokenToMetaMask = () => {
  // const [isAdding, setIsAdding] = useState(false);
  const [status, setStatus] = useState("");

  const handleAddToken = async () => {
    try {
      if (!window.ethereum) {
        throw new Error("MetaMask is not installed");
      }

      setStatus("adding");

      for (const token of tokens) {
        try {
          await window.ethereum.request({
            method: "wallet_watchAsset",
            params: {
              type: "ERC20",
              options: {
                address: token.address,
                symbol: token.symbol,
                decimals: token.decimals,
                image: token.image,
              },
            },
          });
          console.log(`${token.symbol} token added to MetaMask`);
        } catch (error) {
          console.error(`Failed to add ${token.symbol} token:`, error);
        }
      }

      setStatus("success");
      setTimeout(() => setStatus(""), 3000);
    } catch (error) {
      console.error("Failed to add tokens:", error);
      setStatus("error");
      setTimeout(() => setStatus(""), 3000);
    }
  };

  return (
    <div>
      <Button
        className="bg-[#3F3F3F99] hover:bg-[#3F3F3F99] rounded-[2rem] border-[#FFFFFF21] border flex gap-2 items-center"
        onClick={handleAddToken}
        disabled={status === "adding"}>
        <MemoMmIcon />
        {status === "adding"
          ? "Adding..."
          : status === "success"
          ? "Added!"
          : status === "error"
          ? "Failed"
          : "Add to MetaMask"}
      </Button>
    </div>
  );
};

export default AddTokenToMetaMask;
