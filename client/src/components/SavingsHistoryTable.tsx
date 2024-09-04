import {
  Table,
  TableRow,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { CardContent } from "./ui/card";
import MemoAvax from "@/icons/Avax";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
  } from "@/components/ui/dropdown-menu";
import { savingsHistoryAssets } from "@/lib/data";
import { MdArrowDropDown } from "react-icons/md";

const SavingsHistoryTable = () => {
  return (
    <div className="border-[1px] border-[#FFFFFF17] rounded-[12px] p-4 text-white w-full">
        <div className="sm:mx-auto">
        <div className="flex justify-between items-center">
            <div>
                <h1 className="text-xl font-normal mb-4">Savings History</h1>
            </div>
            <div className="flex gap-2">
                <div className="rounded-[100px] px-3 py-[6px] bg-[#1E1E1E99]">
                    <DropdownMenu>
                    <DropdownMenuTrigger className="text-sm flex items-center outline-none">
                        <div>All Transactions</div>
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

                <div className="rounded-[100px] px-3 py-[6px] bg-[#1E1E1E99]">
                    <DropdownMenu>
                    <DropdownMenuTrigger className="text-sm flex items-center outline-none">
                        <div>This Month</div>
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

          <TabsContent value="all-assets">
            <AssetTableContent assets={savingsHistoryAssets} />
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
          {/* <TableHeader className="bg-[#1E1E1E99]  text-[#CACACA]"> */}
            <TableRow>
                <div className="py-2 pt-2">23rd Sept, 2024</div>
              {/* <TableHead>Ticker</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Maturity Date</TableHead>
              <TableHead className="hidden md:table-cell">Autosaved</TableHead>
              <TableHead>Claimable Amount</TableHead>
              <TableHead>
                <span className="sr-only">Actions</span>
              </TableHead> */}
            </TableRow>
          {/* </TableHeader> */}
          <TableBody className="text-[#F1F1F1]">
            {assets.map((asset, index) => (
              <TableRow key={index}>
                <TableCell className="font-medium">
                  <div className="flex items-center space-x-4">
                    <div>
                      <p className="font-[400] text-base">{asset.action}</p>
                      {/* <span className="font-[400] text-xs">{asset.name}</span> */}
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                    <div className="flex">
                        <div className="flex flex-col">
                            <p>{asset.amount}</p>
                            <span className="text-xs">{asset.value}</span>
                        </div>
                        <MemoAvax className="w-3 h-5" />
                    </div>
                </TableCell>
                <TableCell>
                  <div className="flex flex-col">
                    <p>{asset.tokenTypeShort}</p>
                    <span className="text-xs">{asset.tokenTypeFull}</span>
                  </div>
                </TableCell>
                {/* <TableCell className="hidden md:table-cell">
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
                </TableCell> */}
                <TableCell>
                    <div className="flex flex-col">
                    <div className={`
                        px-2 py-1 rounded-[10px] text-xs w-fit 
                        ${asset.status == "upcoming" && 'text-[#00F2FE] bg-[#00F2FE1A]'}
                        ${asset.status == "processing" && 'text-[#FFA448] bg-[#FFA3481A]'}
                        ${asset.status == "completed" && 'text-[#48FF91] bg-[#48FF911A]'}
                        ${asset.status == "cancelled" && 'text-[#FFFFFF] bg-[#FFFFFF1A]'}
                        ${asset.status == "failed" && 'text-[#FF484B] bg-[#FF484B1A]'}
                    `}>
                        {asset.status}
                    </div>
                    
                  </div>
                </TableCell>
                
              </TableRow>
            ))}
          </TableBody>

          <TableRow>
            <div className="py-2 pt-2">23rd Sept, 2024</div>
            
            </TableRow>

            <TableBody className="text-[#F1F1F1]">
            {assets.map((asset, index) => (
              <TableRow key={index}>
                <TableCell className="font-medium">
                  <div className="flex items-center space-x-4">
                    <div>
                      <p className="font-[400] text-base">{asset.action}</p>
                      {/* <span className="font-[400] text-xs">{asset.name}</span> */}
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                    <div className="flex">
                        <div className="flex flex-col">
                            <p>{asset.amount}</p>
                            <span className="text-xs">{asset.value}</span>
                        </div>
                        <MemoAvax className="w-3 h-5" />
                    </div>
                </TableCell>
                <TableCell>
                  <div className="flex flex-col">
                    <p>{asset.tokenTypeShort}</p>
                    <span className="text-xs">{asset.tokenTypeFull}</span>
                  </div>
                </TableCell>
                {/* <TableCell className="hidden md:table-cell">
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
                </TableCell> */}
                <TableCell>
                  <div className="flex flex-col">
                    <div className={`
                        px-2 py-1 rounded-[10px] text-xs w-fit 
                        ${asset.status == "upcoming" && 'text-[#00F2FE] bg-[#00F2FE1A]'}
                        ${asset.status == "processing" && 'text-[#FFA448] bg-[#FFA3481A]'}
                        ${asset.status == "completed" && 'text-[#48FF91] bg-[#48FF911A]'}
                        ${asset.status == "cancelled" && 'text-[#FFFFFF] bg-[#FFFFFF1A]'}
                        ${asset.status == "failed" && 'text-[#FF484B] bg-[#FF484B1A]'}
                    `}>
                        {asset.status}
                    </div>
                    {/* <p></p> */}
                    {/* <span className="text-xs">{asset.value}</span> */}
                  </div>
                </TableCell>
                {/* <TableCell className="flex">
                  <Button variant="link" className="text-[#79E7BA]">
                    View
                  </Button>
                  <Button variant="link" className="text-[#79E7BA] ">
                    Unlock
                  </Button>
                </TableCell> */}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </div>
  )
}

export default SavingsHistoryTable