import { config } from "@/lib/config";
import { watchAsset } from "@wagmi/core";
import { useState } from "react";
import { Button } from "./ui/button";
import MemoMmIcon from "@/icons/MmIcon";
import { tokens } from "@/lib/contract";

const AddTokenToMetaMask = () => {
  const [isAdding, setIsAdding] = useState(false);

  const handleAddToken = async () => {
    setIsAdding(true); // Indicate that the process has started
    try {
      const wasAdded = await watchAsset(config, {
        type: "ERC20",
        options: {
          address: tokens.safu,
          symbol: "SAFU",
          decimals: 18,
        },
      });
      if (wasAdded) {
        console.log("Token was added to MetaMask");
      } else {
        console.log("Token addition rejected by user");
      }
    } catch (error) {
      console.error("Error adding token:", error);
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <div>
      <Button
        className="bg-[#1E1E1E99] flex space-x-2 rounded-[2rem] text-[#F1F1F1] hover:bg-[#1E1E1E99]"
        onClick={handleAddToken}
        disabled={isAdding}>
        <MemoMmIcon />
        <span> {isAdding ? "Adding..." : "Add to Metamask"}</span>
      </Button>
    </div>
  );
};

export default AddTokenToMetaMask;
