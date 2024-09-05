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
import coinSafeAbi from '../../abi/coinsafe.json';
import ApproveDeposit from "./ApproveDeposit";
import { CoinSafeContract } from "@/lib/contract";
import { useAccount, useConnect, useWriteContract } from "wagmi";
import { injected } from "wagmi/connectors";
import { liskSepolia } from "viem/chains";
import { erc20Abi } from "viem";

export default function Deposit({
  isDepositModalOpen,
  setIsDepositModalOpen,
  onBack,
}: {
  isDepositModalOpen: boolean;
  setIsDepositModalOpen: (open: boolean) => void;
  onBack: () => void;
}) {

  const { writeContractAsync, isPending, isSuccess } = useWriteContract();
  const { connectAsync } = useConnect();
  const [isThirdModalOpen, setIsThirdModalOpen] = useState(false);
  const { address } = useAccount();

  const [amount, setAmount] = useState(0);
  const [ token, setToken ] = useState("");
  
  const openThirdModal = () => {
    console.log("details", token, amount);

    setIsThirdModalOpen(true);
    setIsDepositModalOpen(false);
  };

  const handleDepositAsset = async (e:any) => {
    e.preventDefault();

    try {
      if(!address) {
        await connectAsync({ chainId: liskSepolia.id, connector: injected() })
      }

      const response = await writeContractAsync({
        chainId: liskSepolia.id,
        address: token as `0x${string}`,
        functionName: "approve",
        abi: erc20Abi,
        args: [
          CoinSafeContract.address as `0x${string}`,
          BigInt(amount+10)
        ]
      })

      console.log(response)

      const data = await writeContractAsync({
        chainId: liskSepolia.id,
        address: CoinSafeContract.address as `0x${string}`,
        functionName: "depositToPool",
        abi: coinSafeAbi.abi,
        args: [
          amount,
          token
        ]
      })

      if(isSuccess) {
        openThirdModal();
      }

      console.log("DATA",data);
    } catch (error) {
      console.log(error)
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
  }


  


  const handleTokenSelect = (value: string) => {
    setToken(value);
  }


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
                  onChange={(e:any) => setAmount(e.target.value)}
                  defaultValue={0}
                  className="bg-transparent text-base font-light text-gray-200 border-none focus:outline-none text-center w-full"
                />
                {/* <div className="text-xs text-gray-400 text-center">
                  ≈ $400.56
                </div> */}
              </div>
            </div>
            <div className="ml-4">
              <Select onValueChange={handleTokenSelect}>
                <SelectTrigger className="w-[140px] bg-gray-700 border-0 bg-[#1E1E1E99] text-white rounded-lg">
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
                  <SelectItem value="0x8a21CF9Ba08Ae709D64Cb25AfAA951183EC9FF6D">LSK</SelectItem>
                  <SelectItem value="0xBb88E6126FdcD4ae6b9e3038a2255D66645AEA7a">SAFU</SelectItem>
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
              variant="outline" disabled={isPending}>
              Deposit assets
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
