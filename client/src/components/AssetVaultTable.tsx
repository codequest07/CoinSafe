import { Button } from "@/components/ui/button";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { CardContent } from "./ui/card";
import MemoAvax from "@/icons/Avax";
import MemoCheckIcon from "@/icons/CheckIcon";
import MemoXmarkIcon from "@/icons/XmarkIcon";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { vaultAssets } from "@/lib/data";

export default function AssetVaultTable() {
  return (
    <div className="bg-[#010104] border-[1px] border-[#FFFFFF17] rounded-[12px] p-4 text-white w-full">
      <div className="sm:mx-auto">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-xl font-normal mb-4">Assets</h1>
          </div>
          <div>
            <div className="rounded-[100px] bg-[#1E1E1E99]">
              <Select>
                <SelectTrigger className="text-sm border-none bg-transparent focus:ring-0 focus:ring-offset-0">
                  <SelectValue placeholder="All Assets" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Assets</SelectItem>
                  <SelectItem value="usdt">USDT</SelectItem>
                  <SelectItem value="lsk">LSK</SelectItem>
                  <SelectItem value="safu">SAFU</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <Tabs defaultValue="all-assets" className="w-full ">
          <TabsContent value="all-assets">
            <AssetTableContent assets={vaultAssets} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

function AssetTableContent({ assets }: { assets: any[] }) {
  return (
    <div className="bg-[#010104] w-full rounded-lg">
      <CardContent>
        <Table>
          <TableHeader className="bg-[#1E1E1E99]  text-[#CACACA]">
            <TableRow>
              <TableHead>Ticker</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Maturity Date</TableHead>
              <TableHead className="hidden md:table-cell">Autosaved</TableHead>
              <TableHead>Claimable Amount</TableHead>
              <TableHead>
                <span className="sr-only">Actions</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="text-[#F1F1F1]">
            {assets.map((asset, index) => (
              <TableRow key={index}>
                <TableCell className="font-medium">
                  <div className="flex items-center space-x-4">
                    <MemoAvax className="w-6 h-6" />
                    <div>
                      <p className="font-[400] text-base">{asset.symbol}</p>
                      <span className="font-[400] text-xs">{asset.name}</span>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex flex-col">
                    <p>{asset.amount}</p>
                    <span className="text-xs">{asset.value}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex flex-col">
                    <p>{asset.maturityDate}</p>
                  </div>
                </TableCell>
                <TableCell className="hidden md:table-cell">
                  <div className="flex items-center">
                    <span className="mr-2">
                      {asset.autosaved ? "Yes" : "No"}
                    </span>
                    {asset.autosaved ? (
                      <MemoCheckIcon className="text-green-500 w-5 h-5" />
                    ) : (
                      <MemoXmarkIcon className="text-red-500 w-5 h-5" />
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex flex-col">
                    <p>{asset.claimableAmount}</p>
                  </div>
                </TableCell>
                <TableCell className="flex">
                  <Button variant="link" className="text-[#79E7BA]">
                    View
                  </Button>
                  <Button variant="link" className="text-[#79E7BA] ">
                    Unlock
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </div>
  );
}
