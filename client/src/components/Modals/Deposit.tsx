import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { useEffect, useState } from "react";
import coinSafeAbi from "../../abi/coinsafe.json";
import { CoinSafeContract, tokens } from "@/lib/contract";
import { useAccount } from "wagmi";
import { LoaderCircle } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import Deposited from "./Deposited";
import { useDepositAsset } from "@/hooks/useDepositAsset";
import { readContract } from "@wagmi/core";
import { config } from "@/lib/config";
import { erc20Abi, formatUnits } from "viem";

export default function Deposit({
  isDepositModalOpen,
  setIsDepositModalOpen,
}: {
  isDepositModalOpen: boolean;
  setIsDepositModalOpen: (open: boolean) => void;
  onBack: () => void;
}) {
  const [isThirdModalOpen, setIsThirdModalOpen] = useState(false);
  const { address } = useAccount();

  const [amount, setAmount] = useState<number>();
  const [token, setToken] = useState("");
  const [selectedTokenBalance, setSelectedTokenBalance] = useState(0);

  const openThirdModal = () => {
    console.log("details", token, amount);

    setIsThirdModalOpen(true);
    setIsDepositModalOpen(false);
  };

  const handleTokenSelect = (value: string) => {
    setToken(value);
  };

  const { depositAsset, isLoading } = useDepositAsset({
    address: address as `0x${string}`,
    token: token as `0x${string}`,
    amount,
    coinSafeAddress: CoinSafeContract.address as `0x${string}`,
    coinSafeAbi: coinSafeAbi.abi,
    onSuccess: () => {
      openThirdModal();
    },
    onError: (error) => {
      toast({
        title: error.message,
        variant: "destructive",
      });
    },
    toast,
  });

  useEffect(() => {
    async function fetchTokenBalance() {
      try {
        const tokenBalance = await readContract(config, {
          abi: erc20Abi,
          address: token as `0x${string}`,
          functionName: "balanceOf",
          args: [address!],
        });

        console.log("tokenBalance:: ", tokenBalance);
        setSelectedTokenBalance(Number(formatUnits(tokenBalance, 18)));
      } catch (error) {
        throw new Error(error as any);
      }
    }

    if (address && token) {
      fetchTokenBalance();
    }
  }, [token, address]);

  return (
    <Dialog open={isDepositModalOpen} onOpenChange={setIsDepositModalOpen}>
      <DialogContent className="sm:max-w-[600px] border-0 text-white bg-[#17171C]">
        <DialogTitle className="text-white flex items-center space-x-3">
          <p>Deposit assets</p>
        </DialogTitle>
        <div className="p-8 text-gray-700">
          {/* Amount Section */}
          {/* <div className="flex items-center justify-between mb-6">
            <div className="flex-1">
              <label htmlFor="amount" className="text-sm text-gray-400">
                Amount
              </label>
              <div className="flex flex-col items-center justify-center">
                <input
                  type="number"
                  id="amount"
                  value={amount}
                  onChange={(e: any) => setAmount(e.target.value)}
                  placeholder="100"
                  required
                  min={0.01}
                  className={`bg-transparent text-base font-light text-gray-200 border-none focus:outline-none text-center w-full`}
                />
              </div>
            </div>
            <div className="ml-4">
              <Select onValueChange={handleTokenSelect} required>
                <SelectTrigger className="w-[140px] bg-gray-700 border-0 bg-[#1E1E1E99] text-white rounded-lg">
                  <div className="flex items-center">
                    <SelectValue placeholder="Select Token" />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={tokens.usdt}>
                    <div className="flex items-center space-x-2">
                      <p>USDT</p>
                    </div>
                  </SelectItem>
                  <SelectItem value={tokens.lsk}>LSK</SelectItem>
                  <SelectItem value={tokens.safu}>SAFU</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div> */}

          <div className="space-y-2">
            <label className="text-sm text-gray-400">Amount</label>
            <div className="p-6 bg-transparent border border-[#FFFFFF3D] rounded-xl relative">
              <div className="absolute top-3 right-3">
                <div className="ml-4">
                  <Select onValueChange={handleTokenSelect}>
                    <SelectTrigger className="w-[140px] border border-[#FFFFFF3D] bg-[#1E1E1E99] text-white rounded-lg">
                      <div className="flex items-center">
                        {/* <MemoRipple className="mr-2" /> */}
                        <SelectValue placeholder="Select Token" />
                      </div>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0xd26be7331edd458c7afa6d8b7fcb7a9e1bb68909">
                        <div className="flex items-center space-x-2">
                          <p>USDT</p>
                        </div>
                      </SelectItem>
                      <SelectItem value="0x8a21CF9Ba08Ae709D64Cb25AfAA951183EC9FF6D">
                        LSK
                      </SelectItem>
                      <SelectItem value="0xBb88E6126FdcD4ae6b9e3038a2255D66645AEA7a">
                        SAFU
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  {/* {validationErrors.token && (
                        <p className="text-red-500 text-sm mt-1">
                          {validationErrors.token}
                        </p>
                      )} */}
                </div>
              </div>
              <div className="flex flex-col items-center">
                <input
                  type="number"
                  value={amount}
                  onChange={(e: any) => setAmount(e.target.value)}
                  className="text-2xl font-medium bg-transparent text-white text-center w-full outline-none"
                  placeholder="0"
                />
                {/* <div className="text-sm text-gray-400 mt-1">≈ $400.56</div>*/}
              </div>
            </div>
            {/* <div className="flex justify-between text-sm">
                  <div className="flex items-center gap-1">
                    <div>
                      {amount > selectedTokenBalance && (
                        <p className="text-red-500 text-[13px] text-right">
                          Amount greater than wallet balance
                        </p>
                      )}
                    </div>
                    <div className="text-sm font-[300] text-gray-300">
                      Wallet balance:{" "}
                      <span className="text-gray-400">
                        {selectedTokenBalance}{" "}
                        {saveState.token == tokens.safu
                          ? "SAFU"
                          : saveState.token === tokens.lsk
                          ? "LSK"
                          : "USDT"}
                      </span>
                    </div>
                  </div>
                  <Button
                    onClick={() =>
                      setSaveState((prev) => ({
                        ...prev,
                        amount: selectedTokenBalance,
                      }))
                    }
                    variant="link"
                    className="h-auto p-0 text-[#4FFFB0] hover:text-[#4FFFB0]/90"
                  >
                    Save all
                  </Button>
                </div> */}
          </div>

          {/* Wallet Balance Section */}
          {token && (
            <>
              {amount && amount > selectedTokenBalance && (
                <p className="text-red-500 text-[13px] mt-3 text-right">
                  Amount greater than wallet balance
                </p>
              )}
              <div className="flex items-center justify-between mb-3">
                <div className="text-sm font-[300] text-gray-300">
                  Wallet balance:{" "}
                  <span className="text-gray-400">
                    {selectedTokenBalance}{" "}
                    {token == tokens.safu
                      ? "SAFU"
                      : token === tokens.lsk
                      ? "LSK"
                      : "USDT"}
                  </span>
                </div>
                <Button
                  className="text-sm border-none outline-none bg-transparent hover:bg-transparent text-green-400 cursor-pointer"
                  onClick={() => setAmount(selectedTokenBalance)}>
                  Max
                </Button>
              </div>
            </>
          )}
        </div>
        <DialogFooter>
          <Button
            onClick={() => setIsDepositModalOpen(false)}
            className="bg-[#1E1E1E99] px-8 rounded-[2rem] hover:bg-[#1E1E1E99]"
            type="submit">
            Cancel
          </Button>
          <div>
            <Button
              onClick={(e) => {
                depositAsset(e);
              }}
              className="text-black px-8 rounded-[2rem]"
              variant="outline"
              disabled={isLoading || (amount || 0) > selectedTokenBalance}>
              {isLoading ? (
                <LoaderCircle className="animate-spin" />
              ) : (
                "Deposit assets"
              )}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
      <Deposited
        amount={amount || 0}
        token={
          token == tokens.safu ? "SAFU" : token === tokens.lsk ? "LSK" : "USDT"
        }
        isOpen={isThirdModalOpen}
        onClose={() => setIsThirdModalOpen(false)}
      />
    </Dialog>
  );
}
