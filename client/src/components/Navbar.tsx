import { useState } from "react";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { Link } from "react-router-dom";
import AppLogo from "@/icons/AppLogo";
import MemoHandburggerIcon from "@/icons/handburggerIcon";

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  return (
    <>
      <nav className="bg-black w-full py-4 px-6 flex justify-between items-center">
        <Link to="/" className="flex items-center space-x-2">
          <AppLogo className="" />
          {/* MemoNavX */}
        </Link>
        <Button
          className="bg-transparent hover:bg-transparent"
          onClick={toggleMenu}>
          <MemoHandburggerIcon className="w-9 h-9" />
          <span className="sr-only">Menu</span>
        </Button>
      </nav>

      {isMenuOpen && (
        <div className="fixed inset-0 bg-black z-50 flex flex-col">
          <div className="flex justify-between items-center p-6">
            <Link to="/" className="flex items-center space-x-2">
              <AppLogo className="" />
            </Link>
            <Button
              className="bg-transparent hover:bg-transparent"
              onClick={toggleMenu}>
              <X className="h-9 w-9" />
              <span className="sr-only">Close menu</span>
            </Button>
          </div>
          <div className="flex flex-col justify-center items-start p-6 space-y-8 text-white text-5xl font-bold">
            <Link
              to="/testnet"
              className="hover:text-[#79E7BA] transition-colors">
              APP
            </Link>
            <Link
              to="/faucet"
              className="hover:text-[#79E7BA] transition-colors">
              FAUCET
            </Link>
            <Link
              to="/contact"
              className="hover:text-[#79E7BA] transition-colors">
              CONTACT US
            </Link>
          </div>
        </div>
      )}
    </>
  );
}
