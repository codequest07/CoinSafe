import { Button } from "./ui/button";
import MemoMmIcon from "@/icons/MmIcon";
import { useState } from "react";

export const tokens = [
  {
    address: "0xBb88E6126FdcD4ae6b9e3038a2255D66645AEA7a",
    symbol: "SAFU",
    decimals: 18,
    image: "https://coinsafe.network/assets/tokens/safu.png",
  },
  {
    address: "0x2728DD8B45B788e26d12B13Db5A244e5403e7eda",
    symbol: "USDT",
    decimals: 18,
    image: "https://coinsafe.network/assets/tokens/usdt.jpg",
  },
  {
    address: "0x8a21CF9Ba08Ae709D64Cb25AfAA951183EC9FF6D",
    symbol: "LSK",
    decimals: 18,
    image: "https://coinsafe.network/assets/tokens/lsk.jpg",
  },
  {
    address: "0x0E82fDDAd51cc3ac12b69761C45bBCB9A2Bf3C83",
    symbol: "USDC",
    decimals: 6,
    image: "https://coinsafe.network/assets/tokens/usdc.png",
  },
];
const AddTokenToMetaMask = () => {
  // const [isAdding, setIsAdding] = useState(false);
  const [status, setStatus] = useState("");

  const handleAddToken = async () => {
    try {
      if (!(window as any).ethereum) {
        throw new Error("MetaMask is not installed");
      }

      setStatus("adding");

      for (const token of tokens) {
        try {
          await (window as any).ethereum.request({
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
          // console.log(`${token.symbol} token added to MetaMask`);
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
