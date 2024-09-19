import CoinSafeLogo from "@/icons/AppLogo";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="border-t border-[#FFFFFF17]">
      <div className="flex flex-col md:flex-row justify-between items-center max-w-[1240px] mx-auto px-4 py-6 md:py-8">
        <div className="mb-4 md:mb-0">
          <Link to={"/"}>
            <CoinSafeLogo />
          </Link>
        </div>
        <div className="flex gap-4">
          <div className="border-x border-[#FFFFFF17] py-3 px-4 md:py-4 md:px-6">
            <Link to={"#"}>
              <img
                src="/assets/discord.svg"
                alt="Discord"
                className="w-6 h-6 md:w-8 md:h-8"
              />
            </Link>
          </div>
          <div className="border-x border-[#FFFFFF17] py-3 px-4 md:py-4 md:px-6">
            <Link to={"#"}>
              <img
                src="/assets/x.svg"
                alt="X"
                className="w-6 h-6 md:w-8 md:h-8"
              />
            </Link>
          </div>
          <div className="border-x border-[#FFFFFF17] py-3 px-4 md:py-4 md:px-6">
            <Link to={"#"}>
              <img
                src="/assets/telegram.svg"
                alt="Telegram"
                className="w-6 h-6 md:w-8 md:h-8"
              />
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
