import React, { useEffect, useState } from "react";
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import { Card } from "@/components/ui/card";
// import { Calendar } from "@/components/ui/calendar";
// import {
//   DropdownMenu,
//   DropdownMenuContent,
//   DropdownMenuItem,
//   DropdownMenuLabel,
//   DropdownMenuSeparator,
//   DropdownMenuTrigger,
// } from "@/components/ui/dropdown-menu";
// import MemoDropdownIcon from "@/icons/DropdownIcon";
// import { TransactionHistoryData } from "@/lib/data";
// import { Transaction } from "@/types";
import { Badge } from "./ui/badge";
// import MemoCalender from "@/icons/Calender";
import {
  Transaction,
  useTransactionHistory,
} from "@/hooks/useTransactionHistory";
import { formatTimestamp } from "@/utils/formatTimestamp";
import { formatEther } from "viem";
import { tokenSymbol } from "@/utils/displayTokenSymbol";
import { capitalize } from "@/utils/capitalize";
import { Button } from "./ui/button";
import MemoStory from "@/icons/Story";
import SavingOption from "./Modals/SavingOption";
import Deposit from "./Modals/Deposit";
import ThirdwebConnectButton from "./ThirdwebConnectButton";
import { useActiveAccount } from "thirdweb/react";
enum TxStatus {
  Completed = 0,
  Pending = 1,
  Failed = 2,
}

// const TxStatusMap = {
//   0: 'Completed',
//   1: 'Pending',
//   2: 'Failed'
// } as const;

const TxStatusArray = ["Completed", "Pending", "Failed"];

// function getStatusStyle(status: number): { color: string } {
//   switch (status) {
//     case TxStatus.Completed:
//       return { color: "text-[#48FF91] bg-[#48FF911A]" };
//     case TxStatus.Pending:
//       return { color: "text-[#FFA448] bg-[#FFA3481A]" };
//     case TxStatus.Failed:
//       return { color: "text-[#FF484B] bg-[#FF484B1A]" };
//     default:
//       return { color: "text-gray-500" };
//   }
// }

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
  return TxStatusArray[status]; // or TxStatusMap[status]
}

const TransactionHistory = () => {
  const [isDepositModalOpen, setIsDepositModalOpen] = useState(false);
  const [isFirstModalOpen, setIsFirstModalOpen] = useState(false);
  const [isSecondModalOpen, setIsSecondModalOpen] = useState(false);
  const account = useActiveAccount();
  const isConnected = !!account?.address;

  const openFirstModal = () => setIsFirstModalOpen(true);
  const openDepositModal = () => {
    setIsDepositModalOpen(true);
  };
  // const [date, setDate] = React.useState<Date | undefined>(new Date());
  // const [showCalendar, setShowCalendar] = React.useState(false); // State to toggle calendar visibility

  // const handleCalendarToggle = () => {
  //   setShowCalendar(!showCalendar);
  // };

  // const groupedTransactions = TransactionHistoryData.reduce<
  //   Record<string, Transaction[]>
  // >((acc, transaction) => {
  //   if (!acc[transaction.date]) {
  //     acc[transaction.date] = [];
  //   }
  //   acc[transaction.date].push(transaction);
  //   return acc;
  // }, {});

  const {
    transactions,
    isLoading,
    isError,
    error,
    // refetch,
    // fetchNextPage,
    // fetchPreviousPage,
    // hasMore,
    // hasPrevious
  } = useTransactionHistory({});

  useEffect(() => {
    console.log("====================================");
    console.log();
    console.log("====================================");
    console.log("loading", isLoading);
    console.log("error?", isError);
    console.log("error text", error);
    console.log("transactions", transactions);
    // refetch();
  }, [transactions]);

  const groupedTransactions = transactions?.reduce<
    Record<string, Transaction[]>
  >((acc, transaction) => {
    if (!acc[Number(transaction.timestamp)]) {
      acc[Number(transaction.timestamp)] = [];
    }
    acc[Number(transaction.timestamp)].push(transaction);
    return acc;
  }, {});

  //   struct Transaction {
  //     uint256 id;
  //     address user;
  //     address token;
  //     string typeOfTransaction;
  //     uint256 amount;
  //     uint256 timestamp;
  //     TxStatus status;
  // }

  if (!transactions || transactions.length === 0) {
    return (
      <Card className="bg-[#1D1D1D73]/40 border border-white/10 text-white p-4 lg:p-5 rounded-lg">
        <div className="flex sm:flex-row flex-col sm:space-y-0 space-y-3 justify-between sm:items-center mb-4">
          <h2 className="text-lg font-semibold">Transaction History</h2>
        </div>
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="rounded-full  p-6">
            <MemoStory className="w-20 h-20" />
          </div>
          <p className=" text-base max-w-[24rem] my-8">
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
                className="bg-[#1E1E1E99] rounded-[2rem] hover:bg-[#2a2a2a]"
              >
                Deposit
              </Button>
              <Button
                onClick={openFirstModal}
                variant="outline"
                className="bg-white text-black rounded-[2rem]  hover:bg-gray-100"
              >
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
          <h2 className="text-lg font-semibold">Transaction History</h2>
          <div className="flex space-x-4 items-center">
            {/* <DropdownMenu>
              <DropdownMenuTrigger className="text-sm bg-[#1E1E1E99] p-3 rounded-[2rem] flex space-x-2 items-center outline-none">
                <div>All Networks</div>
                <div>
                  <MemoDropdownIcon />
                </div>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>Profile</DropdownMenuItem>
                <DropdownMenuItem>Billing</DropdownMenuItem>
                <DropdownMenuItem>Team</DropdownMenuItem>
                <DropdownMenuItem>Subscription</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu> */}
            {/* Button to toggle the calendar */}
            <div className="relative">
              {/* <button
                onClick={handleCalendarToggle}
                className="text-sm px-4 py-3 bg-[#1E1E1E99] flex items-center space-x-2 rounded-[2rem]">
                <p>This month</p>
                <MemoCalender />
              </button> */}

              {/* Conditional rendering of the calendar */}
              {/* <div className="absolute z-10 right-4">
                {showCalendar && (
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    className="rounded-md bg-black mb-4"
                  />
                )}
              </div> */}
            </div>
          </div>
        </div>

        <Table>
          <TableBody>
            {Object.entries(groupedTransactions).map(([date, transactions]) => (
              <React.Fragment key={date}>
                {/* <TableRow>
                  <TableCell colSpan={6} className="text-sm font-[300] py-2">
                    {formatTimestamp(parseInt(date))}
                  </TableCell>
                </TableRow> */}
                {transactions
                  // .sort((a, b) => Number(a.timestamp) - Number(b.timestamp))
                  .map((transaction: Transaction, index) => (
                    <TableRow
                      key={`${date}-${index}`}
                      className="block sm:table-row"
                    >
                      {/* Transaction type is hidden on smaller screens */}
                      <TableCell className="hidden sm:table-cell">
                        {capitalize(transaction.typeOfTransaction)}
                      </TableCell>
                      {/* Amount and percentage */}
                      <TableCell>
                        <div className="flex flex-col sm:flex-row sm:space-x-2 items-start sm:items-center">
                          <p>{formatEther(transaction.amount)}</p>
                          {/* {transaction.icons && (
                          <transaction.icons className="w-5 h-5 text-[#20FFAF]" />
                        )} */}
                        </div>
                        {/* <div className="text-xs">{transaction.percentage}</div> */}
                      </TableCell>
                      {/* Hash, only visible on larger screens */}
                      <TableCell className="hidden sm:table-cell">
                        {/* <div className="flex cursor-pointer items-center space-x-3">
                        {transaction.hash}
                        {transaction.txnIcon && (
                          <transaction.txnIcon className="w-4 h-4 ml-1" />
                        )}
                      </div> */}
                      </TableCell>
                      {/* Token and network information */}
                      <TableCell className="block sm:table-cell">
                        <div className="flex flex-col">
                          <p className="text-sm font-[500]">
                            {tokenSymbol[transaction.token]}
                          </p>
                          {/* <p className="text-xs">{transaction.network}</p> */}
                        </div>
                      </TableCell>
                      {/* Date and time */}
                      <TableCell className="text-right ">
                        <div className="flex flex-col justify-center text-center sm:flex-row items-start sm:items-center sm:space-x-2">
                          <p>
                            {formatTimestamp(Number(transaction.timestamp))}
                          </p>
                          {/* <p>{transaction.time}</p> */}
                        </div>
                      </TableCell>
                      {/* Transaction status */}
                      <TableCell className="text-right flex justify-center">
                        <Badge className="bg-transparent text-center rounded-[2rem]">
                          <p
                            className={`text-sm p-2 px-3 w-[6rem] rounded-[2rem] font-[400] ${getColorClass(
                              transaction.status
                            )}`}
                          >
                            {getStatusText(transaction.status)}
                          </p>
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
              </React.Fragment>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
};

export default TransactionHistory;
{
  /* <div>
      <Card className="bg-[#13131373] border-0 text-white p-5">
        <div className="flex sm:flex-row flex-col sm:space-y-0 space-y-3 justify-between sm:items-center mb-4">
          <h2 className="text-lg font-semibold">Transaction History</h2>
          <div className="flex space-x-4 items-center">
            
            <div className="relative">
              
            </div>
          </div>
        </div>

        <Table>
          <TableBody>
            {Object.entries(groupedTransactions).map(([date, transactions]) => (
              <React.Fragment key={date}>
                <TableRow>
                  <TableCell colSpan={6} className="text-sm font-[300] py-2">
                    {formatTimestamp(parseInt(date))}
                  </TableCell>
                </TableRow>
                {transactions.map((transaction: Transaction, index) => (
                  <TableRow
                    key={`${date}-${index}`}
                    className="block sm:table-row">
                    
                    <TableCell className="hidden sm:table-cell">
                      {transaction.typeOfTransaction}
                    </TableCell>
                    
                    <TableCell>
                      <div className="flex flex-col sm:flex-row sm:space-x-2 items-start sm:items-center">
                        <p>{Number(transaction.amount)}</p>
                        
                      </div>
                      
                    </TableCell>
                    
                    <TableCell className="hidden sm:table-cell">
                      
                    </TableCell>
                    
                    <TableCell className="block sm:table-cell">
                      <div className="flex flex-col">
                        <p className="text-sm font-[500]">
                          {transaction.token}
                        </p>
                      </div>
                    </TableCell>
                    
                    <TableCell className="text-right">
                      <div className="flex flex-col sm:flex-row items-start sm:items-center sm:space-x-2">
                        
                      </div>
                    </TableCell>
                    
                    <TableCell className="text-right">
                      <Badge className="bg-transparent text-center rounded-[2rem]">
                        
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </React.Fragment>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div> */
}
