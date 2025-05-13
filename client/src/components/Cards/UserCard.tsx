import MemoDetailsIccon from "@/icons/DetailsIccon";
import MemoDiscord from "@/icons/Discord";
import MemoX from "@/icons/X";
import { Link } from "react-router-dom";
import { useActiveAccount } from "thirdweb/react";

const UserCard = () => {
  const account = useActiveAccount();
  const address = account?.address || "";

  // Format the address to show first 6 and last 4 characters
  const formatAddress = (address: string) => {
    if (!address) return "Not connected";
    return `${address.substring(0, 20)}...${address.substring(
      address.length - 4
    )}`;
  };

  return (
    <div className=" max-w-sm p-5 flex flex-col space-y-2 shadow-lg rounded-lg">
      <div className="p-1 text-white  flex items-center justify-between space-x-4">
        {/* User Info */}
        <div className="flex items-center space-x-2">
          <div>
            <p className="text-sm text-gray-400">{formatAddress(address)}</p>
            <div className="flex items-center space-x-2">
              <MemoX />
              <MemoDiscord />
            </div>
          </div>
        </div>
        <MemoDetailsIccon className="w-16 h-16" />
      </div>
      <div className="h-[1px] w-full " />
      <div className="max-w-sm flex  flex-col space-y-4  p-2  text-white">
        <div className="flex items-center justify-between">
          <p className="text-gray-300 text-sm">Original sage</p>
          <p className="text-white font-[400] text-sm">
            0 / 10,000{" "}
            <span className="text-gray-400 font-[300] text-xs">points</span>
          </p>
        </div>
        {/* Progress Bar */}
        <div className="w-full bg-gray-600 h-2 mt-2 rounded-full">
          <div
            className="bg-gradient-to-r from-[#926080] via-[#4C88AB] to-[#A2B3E5] h-full rounded-full"
            style={{ width: "0%" }}></div>
        </div>
        <Link to="" className="text-sm underline text-gray-400 mt-2">
          Tier info
        </Link>
      </div>
    </div>
  );
};

const UserDetailsCard = () => {
  return (
    <div className="px-4 max-w-[23rem] mx-auto bg-[#13131340] rounded-lg">
      <UserCard />
    </div>
  );
};

export default UserDetailsCard;
