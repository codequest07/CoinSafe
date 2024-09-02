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
import { CheckIcon } from "lucide-react";

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
          <Table>
            <TableHeader className="bg-[#131313B2] border-b-0 shadow-md my-2">
              <TableRow>
                <TableHead className="text-white">TICKER</TableHead>
                <TableHead className="text-white">AMOUNT</TableHead>
                <TableHead className="text-white">AUTOSAVED</TableHead>
                <TableHead className="text-white">ACTIONS</TableHead>{" "}
                {/* Correct placement for ACTIONS header */}
              </TableRow>
            </TableHeader>
            <TableBody>
              {Array(6)
                .fill(0)
                .map((_, index) => (
                  <TableRow key={index}>
                    {/* TICKER */}
                    <TableCell className="flex items-center space-x-2">
                      <MemoAvax className="w-6 h-6" />
                      <div>
                        <div>AVAX</div>
                        <div className="text-muted-foreground">Avalanche</div>
                      </div>
                    </TableCell>
                    {/* AMOUNT */}
                    <TableCell>
                      <div>0.00234 AVAX</div>
                      <div className="text-muted-foreground">≈ $5.00</div>
                    </TableCell>
                    {/* AUTOSAVED */}
                    <TableCell className="flex items-center space-x-2">
                      <span className="mr-2">Yes</span>
                      <CheckIcon className="text-green-500" />
                    </TableCell>
                    {/* ACTIONS */}
                    <TableCell className="flex items-center space-x-2">
                      {" "}
                      {/* Ensure this is in the correct order */}
                      <Button
                        variant="link"
                        className="text-blue-500 whitespace-nowrap">
                        Deposit
                      </Button>
                      <Button
                        variant="link"
                        className="text-blue-500 whitespace-nowrap">
                        Stake
                      </Button>
                      <Button
                        variant="link"
                        className="text-blue-500 whitespace-nowrap">
                        Save
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
