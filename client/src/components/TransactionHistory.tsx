"use client";

import { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableRow,
  TableHead,
  TableHeader,
} from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  type Transaction,
  useTransactionHistory,
} from "@/hooks/useTransactionHistory";
import { formatEther } from "viem";
import { capitalize } from "@/utils/capitalize";
import { Button } from "./ui/button";
import MemoStory from "@/icons/Story";
import SavingOption from "./Modals/SavingOption";

import ThirdwebConnectButton from "./ThirdwebConnectButton";
import { useActiveAccount } from "thirdweb/react";
// import { ChevronDown, ExternalLink } from "lucide-react";
import { convertTokenAmountToUsd, tokenData } from "@/lib/utils";
import Deposit from "@/components/Depositt";

enum TxStatus {
  Completed = 0,
  Pending = 1,
  Failed = 2,
}

const TxStatusArray = ["Completed", "Processing", "Failed"];

const getColorClass = (status: any) => {
  switch (status) {
    case TxStatus.Completed:
      return "text-[#48FF91] bg-[#48FF911A]";
    case TxStatus.Pending:
      return "text-[#FFA448] bg-[#FFA3481A]";
    case TxStatus.Failed:
      return "text-[#FF484B] bg-[#FF484B1A]";
    default:
      return "text-gray-500";
  }
};

function getStatusText(status: number) {
  return TxStatusArray[status];
}

const formatDate = (timestamp: number) => {
  const date = new Date(timestamp * 1000);
  const day = date.getDate();
  const month = date.toLocaleString("default", { month: "short" });
  const year = date.getFullYear();

  // Add ordinal suffix to day
  const suffix =
    day === 1 || day === 21 || day === 31
      ? "st"
      : day === 2 || day === 22
      ? "nd"
      : day === 3 || day === 23
      ? "rd"
      : "th";

  return `${day}${suffix} ${month}, ${year}`;
};

const formatTime = (timestamp: number) => {
  const date = new Date(timestamp * 1000);
  return date.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
};

// const shortenAddress = (address: string) => {
//   if (!address) return "";
//   return `${address.slice(0, 6)}...${address.slice(-4)}`;
// };

interface TransactionHistoryProps {
  safeId?: string;
}

const TransactionHistory = ({ safeId }: TransactionHistoryProps) => {
  const [isDepositModalOpen, setIsDepositModalOpen] = useState(false);
  const [isFirstModalOpen, setIsFirstModalOpen] = useState(false);
  const [isSecondModalOpen, setIsSecondModalOpen] = useState(false);
  const account = useActiveAccount();
  const isConnected = !!account?.address;

  const openFirstModal = () => setIsFirstModalOpen(true);
  const openDepositModal = () => {
    setIsDepositModalOpen(true);
  };

  const { transactions } = useTransactionHistory({
    safeId: safeId ? Number(safeId) : undefined,
  });

  // Group transactions by date (using the date part only)
  const groupTransactionsByDate = (transactions: Transaction[]) => {
    if (!transactions || transactions.length === 0) return {};

    const grouped: Record<string, Transaction[]> = {};

    transactions.forEach((transaction) => {
      const date = new Date(Number(transaction.timestamp) * 1000);
      const dateKey = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;

      if (!grouped[dateKey]) {
        grouped[dateKey] = [];
      }

      grouped[dateKey].push(transaction);
    });

    return grouped;
  };

  const groupedTransactions = groupTransactionsByDate(transactions || []);

  const [usdValues, setUsdValues] = useState<number[]>([]);

  useEffect(() => {
    const fetchUsdValues = async () => {
      if (!transactions) return;
      const values = await Promise.all(
        transactions.map((transaction) =>
          convertTokenAmountToUsd(transaction.token, transaction.amount)
        )
      );
      setUsdValues(values);
    };

    fetchUsdValues();
  }, [transactions]);

  if (!transactions || transactions.length === 0) {
    return (
      <Card className="bg-[#1D1D1D73]/40 border border-white/10 text-white p-4 lg:p-5 rounded-lg">
        <div className="flex sm:flex-row flex-col sm:space-y-0 space-y-3 justify-between sm:items-center mb-4">
          <h2 className="text-lg font-semibold">Transaction History</h2>
        </div>
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="rounded-full p-6">
            <MemoStory className="w-20 h-20" />
          </div>
          <p className="text-base max-w-[24rem] my-8">
            {isConnected
              ? `This space is yours to litter with transaction histories, however
            you wish. Deposits, savings, withdrawals, we strongly advise you
            start with saving`
              : "No wallet connected, connect your wallet to get the best of coinsafe"}
          </p>
          {isConnected ? (
            <div className="flex gap-4">
              <Button
                onClick={openDepositModal}
                className="bg-[#1E1E1E99] rounded-[2rem] hover:bg-[#2a2a2a]">
                Deposit
              </Button>
              <Button
                onClick={openFirstModal}
                variant="outline"
                className="bg-white text-black rounded-[2rem] hover:bg-gray-100">
                Save
              </Button>
            </div>
          ) : (
            <ThirdwebConnectButton />
          )}
        </div>
        <Deposit
          isDepositModalOpen={isDepositModalOpen}
          setIsDepositModalOpen={setIsDepositModalOpen}
          onBack={() => {}}
        />
        <SavingOption
          isFirstModalOpen={isFirstModalOpen}
          setIsFirstModalOpen={setIsFirstModalOpen}
          isSecondModalOpen={isSecondModalOpen}
          setIsSecondModalOpen={setIsSecondModalOpen}
        />
      </Card>
    );
  }

  return (
    <div>
      <Card className="bg-[#13131373] border-0 text-white p-5">
        <div className="flex sm:flex-row flex-col sm:space-y-0 space-y-3 justify-between sm:items-center mb-4">
          <h2 className="text-lg font-semibold">Transaction history</h2>
          {/* <div className="flex space-x-4 items-center">
            <Button
              variant="outline"
              className="text-sm bg-[#1E1E1E99] p-3 rounded-[2rem] flex space-x-2 items-center border-none text-white hover:bg-[#2a2a2a] hover:text-white"
            >
              <span>This month</span>
              <ChevronDown className="h-4 w-4" />
            </Button>
          </div> */}
        </div>

        <div className="space-y-4">
          {Object.entries(groupedTransactions).map(([dateKey, txs]) => {
            // Get the first transaction to extract the date for display
            const firstTx = txs[0];
            const dateDisplay = formatDate(Number(firstTx.timestamp));

            return (
              <div key={dateKey} className="space-y-2">
                <div className="text-sm font-light py-2 px-1">
                  {dateDisplay}
                </div>

                <div className="w-full overflow-x-auto">
                  <CardContent className="p-0">
                    <Table className="w-full border-collapse min-w-[600px]">
                      <TableHeader className="bg-[#1D1D1D73]/40">
                        <TableRow className="border-b border-[#1D1D1D]">
                          <TableHead className="text-[#CACACA] font-normal text-sm py-4 px-4">
                            TRANSACTION
                          </TableHead>
                          <TableHead className="text-[#CACACA] font-normal text-sm py-4 px-4">
                            AMOUNT
                          </TableHead>
                          <TableHead className="text-[#CACACA] font-normal text-sm py-4 px-4">
                            DATE
                          </TableHead>
                          <TableHead className="text-[#CACACA] font-normal text-sm py-4 px-4">
                            STATUS
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody className="text-white">
                        {txs.map((transaction, index) => (
                          <TableRow
                            className="border-b border-[#1D1D1D]"
                            key={index}>
                            <TableCell className="py-4 px-4">
                              <span className="font-medium text-white">
                                {capitalize(transaction.typeOfTransaction)}
                              </span>
                            </TableCell>

                            <TableCell className="py-4 px-4">
                              <div className="flex flex-col">
                                <span className="flex items-center gap-2 text-sm text-gray-400">
                                  <span>
                                    {formatEther(transaction.amount)}{" "}
                                    {tokenData[transaction.token]?.symbol}
                                  </span>
                                  <img
                                    src={tokenData[transaction.token]?.image}
                                    width={12}
                                    height={12}
                                    className="w-[14px] h-[14px] rounded-full"
                                  />
                                </span>
                                <div className="text-sm text-gray-400 mt-1">
                                  ≈{" "}
                                  {usdValues[index] !== undefined
                                    ? `$${usdValues[index]?.toFixed(2)}`
                                    : "Loading..."}
                                </div>
                              </div>
                            </TableCell>

                            <TableCell className="py-4 px-4">
                              <span className="text-sm text-gray-400">
                                {formatDate(Number(transaction.timestamp))}
                                {"  -  "}
                                {formatTime(Number(transaction.timestamp))}
                              </span>
                            </TableCell>

                            <TableCell className="py-4 px-4">
                              <Badge
                                className={`border-0 ${getColorClass(
                                  0
                                )} px-3 py-1 rounded-full`}>
                                {getStatusText(0)}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </div>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
};

export default TransactionHistory;
