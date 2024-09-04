import React from "react";
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import { Card } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import MemoDropdownIcon from "@/icons/DropdownIcon";
import { TransactionHistoryData } from "@/lib/data";
import { Transaction } from "@/types";
import { Badge } from "./ui/badge";
import MemoCalender from "@/icons/Calender";

const getColorClass = (status: any) => {
  switch (status.toLowerCase()) {
    case "completed":
      return "text-[#48FF91]";
    case "processing":
      return "text-[#FFA448]";
    case "failed":
      return "text-[#FF484B]";
    default:
      return "text-gray-500";
  }
};

const TransactionHistory = () => {
  const [date, setDate] = React.useState<Date | undefined>(new Date());
  const [showCalendar, setShowCalendar] = React.useState(false); // State to toggle calendar visibility

  const handleCalendarToggle = () => {
    setShowCalendar(!showCalendar);
  };

  const groupedTransactions = TransactionHistoryData.reduce<
    Record<string, Transaction[]>
  >((acc, transaction) => {
    if (!acc[transaction.date]) {
      acc[transaction.date] = [];
    }
    acc[transaction.date].push(transaction);
    return acc;
  }, {});

  return (
    <div>
      <Card className="bg-[#13131373] border-0 text-white p-5">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Transaction History</h2>
          <div className="flex space-x-4 items-center">
            <DropdownMenu>
              <DropdownMenuTrigger className="text-sm flex space-x-2 items-center outline-none">
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
            </DropdownMenu>
            {/* Button to toggle the calendar */}
            <div className="relative">
              <button
                onClick={handleCalendarToggle}
                className="text-sm px-4 py-2  flex items-center space-x-2 rounded-lg">
                <p>This month</p>
                <MemoCalender />
              </button>

              {/* Conditional rendering of the calendar */}
              <div className="absolute z-10 right-4">
                {showCalendar && (
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    className="rounded-md bg-black   mb-4"
                  />
                )}
              </div>
            </div>
          </div>
        </div>

        <Table>
          <TableBody>
            {Object.entries(groupedTransactions).map(([date, transactions]) => (
              <React.Fragment key={date}>
                <TableRow>
                  <TableCell colSpan={6} className="text-sm font-[300] py-2">
                    {date}
                  </TableCell>
                </TableRow>
                {transactions.map((transaction: Transaction, index) => (
                  <TableRow key={`${date}-${index}`}>
                    <TableCell className="hidden sm:table-cell">
                      {transaction.type}
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2 items-center">
                        <p>{transaction.amount}</p>
                        {transaction.icons && (
                          <transaction.icons className="w-5 h-5 text-[#20FFAF]" />
                        )}
                      </div>
                      <div className="text-xs">{transaction.percentage}</div>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      <div className="flex cursor-pointer items-center space-x-3">
                        {transaction.hash}
                        {transaction.txnIcon && (
                          <transaction.txnIcon className="w-4 h-4 ml-1" />
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <div className="flex flex-col">
                        <p className="text-sm font-[500]">
                          {transaction.token}
                        </p>
                        <p className="text-xs">{transaction.network}</p>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center space-x-2">
                        <p> {transaction.date}</p>
                        <p> {transaction.time}</p>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <Badge className="rounded-[2rem]">
                        <p
                          className={`text-sm font-[400] ${getColorClass(
                            transaction.status
                          )}`}>
                          {transaction.status}
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
