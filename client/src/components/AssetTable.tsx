import React from "react";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function AssetTable() {
  return (
    <div className="bg-[#13131373] border border-[#13131373] p-4 rounded-[2rem] text-white ">
      <div className="mx-auto">
        <h1 className="text-xl font-semibold mb-4">Assets</h1>

        {/* Tabs Component */}
        <Tabs defaultValue="all-assets" className="  w-full">
          <TabsList className="flex space-x-4 bg-[#1E1E1E99] rounded-[2rem] p-2 mb-4">
            <TabsTrigger
              value="all-assets"
              className=" text-white px-4 py-2 rounded-full">
              All assets
            </TabsTrigger>
            <TabsTrigger
              value="liquid-assets"
              className=" text-white px-4 py-2 rounded-full">
              Liquid assets
            </TabsTrigger>
            <TabsTrigger
              value="staked-assets"
              className=" text-white px-4 py-2 rounded-full">
              Staked assets
            </TabsTrigger>
            <TabsTrigger
              value="saved-assets"
              className=" text-white px-4 py-2 rounded-full">
              Saved assets
            </TabsTrigger>
          </TabsList>

          {/* Tab Content for All Assets */}
          <TabsContent value="all-assets">
            <AssetTableContent />
          </TabsContent>

          {/* Tab Content for Liquid Assets */}
          <TabsContent value="liquid-assets">
            <AssetTableContent />
          </TabsContent>

          {/* Tab Content for Staked Assets */}
          <TabsContent value="staked-assets">
            <AssetTableContent />
          </TabsContent>

          {/* Tab Content for Saved Assets */}
          <TabsContent value="saved-assets">
            <AssetTableContent />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

function AssetTableContent() {
  return (
    <div className="bg-[#010104] p-4 rounded-lg">
      <CardContent>
        <Table>
          <TableHeader className="text-[#CACACA]">
            <TableRow>
              <TableHead>Ticker</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead className="hidden md:table-cell">Autosaved</TableHead>
              <TableHead className="sr-only">Total Sales</TableHead>
              <TableHead className="sr-only">Created at</TableHead>
              <TableHead>
                <span className="sr-only">Actions</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="text-[#F1F1F1]">
            {Array(5)
              .fill(0)
              .map((_, index) => (
                <TableRow key={index}>
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
              ))}
          </TableBody>
        </Table>
      </CardContent>
    </div>
  );
}
