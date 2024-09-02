import { Button } from "@/components/ui/button";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import MemoAvax from "@/icons/Avax";
import { CardContent } from "./ui/card";
import MemoCheckIcon from "@/icons/CheckIcon";
import MemoXmarkIcon from "@/icons/XmarkIcon";

export default function AssetTable() {
  return (
    <div className="bg-[#13131373] border border-[#13131373] p-4 rounded-[2rem] text-white min-h-screen">
      <div className="mx-auto">
        <h1 className="text-xl font-semibold mb-4">Assets</h1>
        <div className="flex space-x-4 bg-[#1E1E1E99] rounded-[2rem] p-2 mb-4">
          <Button
            variant="default"
            className="bg-[#79E7BA1F] text-white px-4 py-2 rounded-full">
            All assets
          </Button>
          <Button
            variant="default"
            className="bg-[#79E7BA1F] text-white px-4 py-2 rounded-full">
            Liquid assets
          </Button>
          <Button
            variant="default"
            className="bg-[#79E7BA1F] text-white px-4 py-2 rounded-full">
            Staked assets
          </Button>
          <Button
            variant="default"
            className="bg-[#79E7BA1F] text-white px-4 py-2 rounded-full">
            Saved assets
          </Button>
        </div>
        <div className="bg-[#010104] p-4 rounded-lg">
          <CardContent>
            <Table>
              <TableHeader className="text-[#CACACA]">
                <TableRow>
                  <TableHead>Ticker</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead className="hidden md:table-cell">
                    Autosaved
                  </TableHead>
                  <TableHead className="sr-only">Total Sales</TableHead>
                  <TableHead className="sr-only">Created at</TableHead>
                  <TableHead>
                    <span className="sr-only">Actions</span>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="text-[#F1F1F1]">
                <TableRow>
                  <TableCell className="font-medium">
                    <div className="flex items-center space-x-4">
                      <MemoAvax className="w-6 h-6" />
                      <div>
                        <p className="font-[400] text-base">AVAX</p>
                        <span className="font-[400] text-xs">Avalanche</span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <p>0.00234 AVAX</p>
                      <span className="text-xs">≈ $ 5.00</span>
                    </div>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    <div className="flex items-center">
                      <span className="mr-2">Yes</span>
                      <MemoCheckIcon className="text-green-500 w-5 h-5" />
                    </div>
                  </TableCell>
                  <TableCell className="flex">
                    <Button variant="link" className="text-[#79E7BA]">
                      Deposit
                    </Button>
                    <Button variant="link" className="text-[#79E7BA] ">
                      Stake
                    </Button>
                    <Button variant="link" className="text-[#79E7BA] ">
                      Save
                    </Button>
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">
                    <div className="flex items-center space-x-4">
                      <MemoAvax className="w-6 h-6" />
                      <div>
                        <p className="font-[400] text-base">AVAX</p>
                        <span className="font-[400] text-xs">Avalanche</span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <p>0.00234 AVAX</p>
                      <span className="text-xs">≈ $ 5.00</span>
                    </div>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    <div className="flex items-center">
                      <span className="mr-2">No</span>
                      <MemoXmarkIcon className="text-green-500 w-5 h-5" />
                    </div>
                  </TableCell>
                  <TableCell className="flex">
                    <Button variant="link" className="text-[#79E7BA]">
                      Deposit
                    </Button>
                    <Button variant="link" className="text-[#79E7BA] ">
                      Stake
                    </Button>
                    <Button variant="link" className="text-[#79E7BA] ">
                      Save
                    </Button>
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">
                    <div className="flex items-center space-x-4">
                      <MemoAvax className="w-6 h-6" />
                      <div>
                        <p className="font-[400] text-base">AVAX</p>
                        <span className="font-[400] text-xs">Avalanche</span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <p>0.00234 AVAX</p>
                      <span className="text-xs">≈ $ 5.00</span>
                    </div>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    <div className="flex items-center">
                      <span className="mr-2">Yes</span>
                      <MemoCheckIcon className="text-green-500 w-5 h-5" />
                    </div>
                  </TableCell>
                  <TableCell className="flex">
                    <Button variant="link" className="text-[#79E7BA]">
                      Deposit
                    </Button>
                    <Button variant="link" className="text-[#79E7BA] ">
                      Stake
                    </Button>
                    <Button variant="link" className="text-[#79E7BA] ">
                      Save
                    </Button>
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">
                    <div className="flex items-center space-x-4">
                      <MemoAvax className="w-6 h-6" />
                      <div>
                        <p className="font-[400] text-base">AVAX</p>
                        <span className="font-[400] text-xs">Avalanche</span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <p>0.00234 AVAX</p>
                      <span className="text-xs">≈ $ 5.00</span>
                    </div>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    <div className="flex items-center">
                      <span className="mr-2">Yes</span>
                      <MemoCheckIcon className="text-green-500 w-5 h-5" />
                    </div>
                  </TableCell>
                  <TableCell className="flex">
                    <Button variant="link" className="text-[#79E7BA]">
                      Deposit
                    </Button>
                    <Button variant="link" className="text-[#79E7BA] ">
                      Stake
                    </Button>
                    <Button variant="link" className="text-[#79E7BA] ">
                      Save
                    </Button>
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">
                    <div className="flex items-center space-x-4">
                      <MemoAvax className="w-6 h-6" />
                      <div>
                        <p className="font-[400] text-base">AVAX</p>
                        <span className="font-[400] text-xs">Avalanche</span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <p>0.00234 AVAX</p>
                      <span className="text-xs">≈ $ 5.00</span>
                    </div>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    <div className="flex items-center">
                      <span className="mr-2">No</span>
                      <MemoXmarkIcon className="text-green-500 w-5 h-5" />
                    </div>
                  </TableCell>
                  <TableCell className="flex">
                    <Button variant="link" className="text-[#79E7BA]">
                      Deposit
                    </Button>
                    <Button variant="link" className="text-[#79E7BA] ">
                      Stake
                    </Button>
                    <Button variant="link" className="text-[#79E7BA] ">
                      Save
                    </Button>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </div>
      </div>
    </div>
  );
}
