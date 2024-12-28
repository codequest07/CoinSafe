import React, { useEffect, useState } from "react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "./ui/button";
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
      <header className="flex justify-end h-14 items-center shadow-xl gap-4 border-b border-b-[#000000] lg:h-[70px]">
        <Sheet>
          <SheetContent side="left" className="flex flex-col bg-[#13131373]">
            <nav className="grid gap-2 text-lg font-medium">
              <Link to="/" className="flex items-center gap-2 font-semibold">
                <MemoLogo className="w-32 h-32" />
              </Link>

              {NavLinks.map((link) => (
                <NavLink
                  key={link.label}
                  to={link.to}
                  className={({ isActive }) =>
                    isActive
                      ? "flex items-center gap-3 font-[400] rounded-lg px-3 py-2 my-3  text-[#FFFFFF] bg-[#FFFBF833]   transition-all hover:text-primary"
                      : "flex items-center gap-3 font-[400] rounded-lg  px-3 py-2  text-[#FFFFFF]  transition-all hover:text-primary"
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
          <SheetTrigger asChild className="mx-3">
            <Button
              variant="outline"
              size="icon"
              className="shrink-0   md:hidden">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle navigation menu</span>
            </Button>
          </SheetTrigger>
          <div className="w-full rounded-0 p-3 ">
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
        </Sheet>
      </header>
    </main>
  );
};

export default DashHeader;
