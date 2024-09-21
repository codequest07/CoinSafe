import { config } from "@/lib/config";
import { watchAsset } from "@wagmi/core";
import { useState } from "react";
import { Button } from "./ui/button";

const AddTokenToMetaMask = () => {
  const [isAdding, setIsAdding] = useState(false);

  const handleAddToken = async () => {
    setIsAdding(true); // Indicate that the process has started
    try {
      const wasAdded = await watchAsset(config, {
        type: "ERC20",
        options: {
          address: "0x6245DF66b74b56D803730d48BF1bF16EEBBBD881",
          symbol: "Safu",
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
        className="bg-white rounded-[2rem] text-[#010104] hover:bg-[#ececee]"
        onClick={handleAddToken}
        disabled={isAdding}>
        {isAdding ? "Adding..." : "Add Token to MetaMask"}
      </Button>
    </div>
  );
};

export default AddTokenToMetaMask;
