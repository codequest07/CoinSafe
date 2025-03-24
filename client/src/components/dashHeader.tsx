"use client";

import { useEffect, useState } from "react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import { Link, NavLink } from "react-router-dom";
import { NavLinks } from "@/lib/data";
import MemoLogo from "@/icons/Logo";
import SmileFace from "./Smile";
import ExtensionCard from "./Cards/ExtensionCard";
import ClaimBtn from "./ClaimBtn";

// Utility function to generate random non-human names
const generateRandomName = () => {
  const RandomName = [
    "VaultVanguard",
    "CryptoKeeper",
    "NovaGuard",
    "StellarShield",
    "SafeSparrow",
    "QuantumHaven",
    "FortressFlare",
    "PrismProtector",
    "EchoVault",
    "AtlasLock",
    "CelestialVault",
    "IronCipher",
    "OrbitGuardian",
    "BlazeSentinel",
    "FrostHaven",
    "AeroVault",
    "ShadowFort",
    "TitanSecure",
    "GlintSeeker",
    "EonSentinel",
  ];

  const names = RandomName[Math.floor(Math.random() * RandomName.length)];
  return `${names}`;
};

const getRandomMessage = () => {
  const messages = [
    "Why haven't you saved today? Don't miss out!",
    "Saving is the key to greatness! Start now.",
    "Don't let today pass without saving!",
    "Secure your future, one save at a time.",
    "What are you waiting for? Save something!",
    "Every little bit counts. Start saving today!",
    "Take a step toward your goals—save today!",
  ];
  return messages[Math.floor(Math.random() * messages.length)];
};

const DashHeader = () => {
  const [randomName, setRandomName] = useState("");
  const [randomMessage, setRandomMessage] = useState("");

  useEffect(() => {
    // Generate a new random name when the component mounts
    setRandomName(generateRandomName());
    setRandomMessage(getRandomMessage());
  }, []);

  return (
    <main>
      <header className="flex items-center h-14 shadow-xl border-b border-b-[#000000] lg:h-[70px] w-full bg-black text-white">
        {/* Mobile View */}
        <div className="w-full flex items-center justify-between md:hidden md:px-4">
          {/* Logo for mobile */}
          <Link to="/" className="flex items-center">
            <MemoLogo className="w-24 h-8" />
            <span className="text-xs bg-gray-700 text-gray-300 px-1.5 py-0.5 rounded ml-1">
              Beta
            </span>
          </Link>

          {/* Mobile Menu Button */}
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="text-white">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle navigation menu</span>
              </Button>
            </SheetTrigger>

            {/* Mobile Navigation Sidebar */}
            <SheetContent
              side="right"
              className="flex flex-col bg-[#13131373] border-r border-r-[#333333]">
              <nav className="grid gap-2 text-lg font-medium">
                <Link to="/" className="flex items-center gap-2 font-semibold">
                  <MemoLogo className="w-32 h-10" />
                </Link>

                {NavLinks.map((link) => (
                  <NavLink
                    key={link.label}
                    to={link.to}
                    className={({ isActive }) =>
                      isActive
                        ? "flex items-center gap-3 font-[400] rounded-lg px-3 py-2 my-3 text-[#FFFFFF] bg-[#FFFBF833] transition-all hover:text-primary"
                        : "flex items-center gap-3 font-[400] rounded-lg px-3 py-2 text-[#FFFFFF] transition-all hover:text-primary"
                    }>
                    <link.icon className="w-5 h-5" />
                    {link.label}
                  </NavLink>
                ))}
              </nav>
              <div className="mt-auto">
                <ExtensionCard />
              </div>
            </SheetContent>
          </Sheet>
        </div>

        {/* Desktop View */}
        <div className="w-full hidden md:block rounded-0 md:p-3 ">
          <div className="flex items-start justify-between text-white p-1">
            <div className="sm:flex flex-col space-y-2 hidden items-start">
              {/* Random Name and Badge */}
              <div className="flex space-x-2 items-center">
                <span className="text-sm text-gray-400">{randomName}</span>
                <span className="text-xs bg-[#F3B42324] text-[#F1F1F1] py-1 px-2 rounded-full">
                  1000 days 🔥
                </span>
              </div>
              {/* Message */}
              <div className="ml-0 text-sm">
                <span>{randomMessage}</span>
              </div>
            </div>
            <div className="flex items-center sm:space-x-3">
              <ClaimBtn />
              {/* Icons for connected wallets */}
              <SmileFace />
            </div>
          </div>
        </div>
      </header>
    </main>
  );
};

export default DashHeader;
