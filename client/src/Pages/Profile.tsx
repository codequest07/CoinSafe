"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { useActiveAccount } from "thirdweb/react";

export default function ProfilePage() {
  const account = useActiveAccount();
  const address = account?.address || "";
  return (
    <div className="min-h bg-transparent flex items-center justify-center p-4">
      <Card className="w-full max-w-xl bg-transparent border-[#FFFFFF21] rounded-3xl p-8 space-y-6">
        {/* Header */}
        <div className="">
          <h1 className="text-[15px]font-medium text-[#F1F1F1]">My profile</h1>
        </div>
        <div className="border-b border-[#FFFFFF21] -mx-8 mb-8"></div>

        {/* Connected Wallet Section */}
        <div className="space-y-4">
          <h2 className="text-[14px] font-[400] text-[#CACACA]">
            Connected wallet
          </h2>
          <p className="text-white font-mono text-[14px]">{address}</p>
        </div>

        {/* Email Address Section */}
        <div className="space-y-4">
          <div className="space-y-2">
            <h3 className="text-[14px] font-[400] text-[#CACACA] uppercase ">
              EMAIL ADDRESS
            </h3>
            <p className="text-gray-400 text-[13px]">
              Link an active email address to get notified of your savings
              activities
            </p>
          </div>
          <div className="relative">
            <Input
              className="flex-1 bg-transparent border-[#FFFFFF21] text-white placeholder:text-gray-500 rounded-xl h-12 pr-24"
              placeholder="Enter your email address"
            />
            <Button className="absolute right-2 top-1/2 -translate-y-1/2 bg-[#3F3F3F99] hover:bg-[#3F3F3F99] text-[#F1F1F1] rounded-lg px-4 h-8 text-sm">
              Connect
            </Button>
          </div>
        </div>

        {/* Divider after email section */}
        <div className=""></div>

        {/* Socials Section */}
        <div className="space-y-4 pt-2">
          <h2 className="text-[14px] font-[400] text-[#CACACA] uppercase ">
            SOCIALS
          </h2>

          {/* Twitter */}
          <div className="space-y-3">
            <h3 className="text-[14px] font-[400] text-[#CACACA]">Twitter</h3>
            <Button className="bg-[#3F3F3F99] hover:bg-[#3F3F3F99] text-[#F1F1F1] rounded-full px-6 py-2 h-auto">
              Connect twitter
            </Button>
          </div>

          {/* Discord */}
          <div className="space-y-3">
            <h3 className="text-[14px] font-[400] text-[#CACACA]">Discord</h3>
            <Button className="bg-[#3F3F3F99] hover:bg-[#3F3F3F99] text-[#F1F1F1] rounded-full px-6 py-2 h-auto">
              Connect discord
            </Button>
          </div>
        </div>

        <div className="border-t border-[#FFFFFF21] -mx-8 ">
          {/* Save Changes Button */}
          <div className="flex justify-end mx-4  pt-6">
            <Button className="bg-[#FFFFFFE5] hover:bg-gray-100 text-black rounded-full px-8 py-3 font-medium">
              Save changes
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
