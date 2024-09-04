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
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
  } from "@/components/ui/dropdown-menu";
import { vaultAssets } from "@/lib/data";
import { MdArrowDropDown } from "react-icons/md";

export default function AssetVaultTable() {
//   const liquidAssets = allAssets.filter((asset) => asset.liquid);
//   const stakedAssets = allAssets.filter((asset) => asset.staked);
//   const savedAssets = allAssets.filter((asset) => asset.saved);

  return (
    <div className="bg-[#010104] border-[1px] border-[#FFFFFF17] rounded-[12px] p-4 text-white w-full">
      <div className="sm:mx-auto">
        <div className="flex justify-between items-center">
            <div>
                <h1 className="text-xl font-normal mb-4">Assets</h1>
            </div>
            <div>
                <div className="rounded-[100px] px-3 py-[6px] bg-[#1E1E1E99]">
                    <DropdownMenu>
                    <DropdownMenuTrigger className="text-sm flex items-center outline-none">
                        <div>All Assets</div>
                        <div>
                        <MdArrowDropDown />
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
                </div>
            </div>
        </div>

        {/* Tabs Component */}
        <Tabs defaultValue="all-assets" className="w-full ">
          {/* <TabsList className="sm:flex space-x-4 hidden bg-[#1E1E1E99] rounded-[2rem] p-2 mb-4">
            <TabsTrigger
              value="all-assets"
              className="text-white px-4 py-2 rounded-full">
              All assets
            </TabsTrigger>
            <TabsTrigger
              value="liquid-assets"
              className="text-white px-4 py-2 rounded-full">
              Liquid assets
            </TabsTrigger>
            <TabsTrigger
              value="staked-assets"
              className="text-white px-4 py-2 rounded-full">
              Staked assets
            </TabsTrigger>
            <TabsTrigger
              value="saved-assets"
              className="text-white px-4 py-2 rounded-full">
              Saved assets
            </TabsTrigger>
          </TabsList> */}

          <TabsContent value="all-assets">
            <AssetTableContent assets={vaultAssets} />
          </TabsContent>

          {/* <TabsContent value="liquid-assets">
            <AssetTableContent assets={liquidAssets} />
          </TabsContent>

          <TabsContent value="staked-assets">
            <AssetTableContent assets={stakedAssets} />
          </TabsContent>

          <TabsContent value="saved-assets">
            <AssetTableContent assets={savedAssets} />
          </TabsContent> */}
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
              {/* <TableHead className="sr-only">Ticker</TableHead>
              <TableHead className="sr-only">Ticker</TableHead>
              <TableHead className="sr-only">Ticker</TableHead>
              <TableHead className="sr-only">Ticker</TableHead>
              <TableHead className="sr-only">Ticker</TableHead> */}
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
                    {/* <span className="text-xs">{asset.value}</span> */}
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
                    {/* <span className="text-xs">{asset.value}</span> */}
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
