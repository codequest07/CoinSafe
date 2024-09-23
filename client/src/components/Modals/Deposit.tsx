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
import { useState } from "react";
import MemoBackIcon from "@/icons/BackIcon";
import coinSafeAbi from "../../abi/coinsafe.json";
import ApproveDeposit from "./ApproveDeposit";
import { CoinSafeContract, tokens } from "@/lib/contract";
import { useAccount, useConnect, useWriteContract } from "wagmi";
import { injected } from "wagmi/connectors";
import { liskSepolia } from "viem/chains";
import { erc20Abi } from "viem";
import { waitForTransactionReceipt } from "@wagmi/core";
import { config } from "@/lib/config";
import { LoaderCircle } from "lucide-react";
import { toast } from "@/hooks/use-toast";

export default function Deposit({
  isDepositModalOpen,
  setIsDepositModalOpen,
  onBack,
}: {
  isDepositModalOpen: boolean;
  setIsDepositModalOpen: (open: boolean) => void;
  onBack: () => void;
}) {
  const { writeContractAsync } = useWriteContract();

  const { connectAsync } = useConnect();
  const [isThirdModalOpen, setIsThirdModalOpen] = useState(false);
  const { address } = useAccount();
  const [isLoading, setIsLoading] = useState(false);

  const [amount, setAmount] = useState(0);
  const [token, setToken] = useState("");

  const openThirdModal = () => {
    console.log("details", token, amount);

    setIsThirdModalOpen(true);
    setIsDepositModalOpen(false);
  };

  const handleDepositAsset = async (e: any) => {
    e.preventDefault();

    try {
      setIsLoading(true);
      if (!address) {
        await connectAsync({ chainId: liskSepolia.id, connector: injected() });
      }

      if (!amount) {
        toast({
          title: "Please input a value for amount to deposit",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      if (!token) {
        toast({
          title: "Please select token to deposit",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      const approveResponse = await writeContractAsync({
        chainId: liskSepolia.id,
        address: token as `0x${string}`,
        functionName: "approve",
        abi: erc20Abi,
        // based on any update to more token to be added we'll update this amount being passed to this function
        args: [CoinSafeContract.address as `0x${string}`, BigInt(token === tokens.usdt ? amount*10**6 : amount*10**18)],
      });

      // Check if the approve transaction was successful
      if (approveResponse) {
        console.log(`Approve transaction successful: ${approveResponse}`);

        // Step 2: Wait until the transaction is mined
        const approveTransactionReceipt = await waitForTransactionReceipt(
          config,
          {
            hash: approveResponse,
          }
        );

        console.log(approveTransactionReceipt);

        if (approveTransactionReceipt.transactionIndex === 1) {
          console.log(
            "Approve transaction confirmed, proceeding with deposit..."
          );

          // Step 3: Call depositToPool function after approval
          const depositResponse = await writeContractAsync({
            chainId: liskSepolia.id,
            address: CoinSafeContract.address as `0x${string}`,
            functionName: "depositToPool",
            abi: coinSafeAbi.abi,
            // based on any update to more token to be added we'll update this amount being passed to this function
            args: [token === tokens.usdt ? amount*10**6 : amount*10**18, token],
          });

          console.log(depositResponse);

          const depositTransactionReceipt = await waitForTransactionReceipt(
            config,
            {
              hash: depositResponse,
            }
          );

          if (depositTransactionReceipt.transactionIndex === 1) {
            openThirdModal();
          }

          console.log("DATA", depositTransactionReceipt.status);
          setIsLoading(false);
        } else {
          console.error("Deposit transaction failed or was reverted");
          setIsLoading(false);
        }
      } else {
        console.error("Approve transaction failed");
        setIsLoading(false);
      }

      // const data = await writeContractAsync({
      //   chainId: liskSepolia.id,
      //   address: CoinSafeContract.address as `0x${string}`,
      //   functionName: "depositToPool",
      //   abi: coinSafeAbi.abi,
      //   args: [amount, token],
      // });
    } catch (error) {
      console.log(error);
      setIsLoading(false);
    }
    // const formData = new FormData(e.target as HTMLFormElement)
    // const tokenId = formData.get('tokenId') as string
    // console.log("Loggin first")
    // writeContract({
    //   address: `0x${CoinSafeContract.address}`,
    //   abi:coinSafeAbi.abi,
    //   functionName: 'depositToPool',
    //   args: [amount, BigInt(token)],
    // });

    // console.log("Logging after")
  };

  const handleTokenSelect = (value: string) => {
    setToken(value);
  };

  return (
    <Dialog open={isDepositModalOpen} onOpenChange={setIsDepositModalOpen}>
      <DialogContent className="sm:max-w-[600px] border-0 text-white bg-[#010104]">
        <DialogTitle className="text-white flex items-center space-x-3">
          <MemoBackIcon onClick={onBack} className="w-6 h-6 cursor-pointer" />
          <p>Deposit assets</p>
        </DialogTitle>
        <div className="p-8 text-gray-700">
          {/* Amount Section */}
          <div className="flex items-center justify-between mb-6">
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
                  min={0.05}
                  className="bg-transparent text-base font-light text-gray-200 border-none focus:outline-none text-center w-full"
                />
                {/* <div className="text-xs text-gray-400 text-center">
                  ≈ $400.56
                </div> */}
              </div>
            </div>
            <div className="ml-4">
              <Select onValueChange={handleTokenSelect} required>
                <SelectTrigger className="w-[140px] bg-gray-700 border-0 bg-[#1E1E1E99] text-white rounded-lg">
                  <div className="flex items-center">
                    {/* <MemoRipple className="mr-2" /> */}
                    <SelectValue placeholder="Select Token" />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={tokens.usdt}>
                    <div className="flex items-center space-x-2">
                      <p>USDT</p>
                    </div>
                  </SelectItem>
                  <SelectItem value={tokens.lsk}>
                    LSK
                  </SelectItem>
                  <SelectItem value={tokens.safu}>
                    SAFU
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Wallet Balance Section */}
          <div className="flex items-center justify-between mb-3">
            <div className="text-sm font-[300] text-gray-300">
              Deposit assets: <span className="text-gray-400">3000 XRP</span>
            </div>
            <div className="text-sm text-green-400 cursor-pointer">Max</div>
          </div>
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
                handleDepositAsset(e);

                // if(isSuccess) {
                //   openThirdModal();
                // }
              }}
              className="text-black px-8 rounded-[2rem]"
              variant="outline"
              disabled={isLoading}>
              {isLoading ? (
                <LoaderCircle className="animate-spin" />
              ) : (
                "Deposit assets"
              )}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
      <ApproveDeposit
        isOpen={isThirdModalOpen}
        onClose={() => setIsThirdModalOpen(false)}
      />
    </Dialog>
  );
}
