import MemoChrome from "@/icons/Chrome";
import { Button } from "./ui/button";
import MemoTarget from "@/icons/Target";
import MemoInvestement from "@/icons/Investement";
import { Link } from "react-router-dom";

const SavingsTools = () => {
  return (
    <section className="sm:mx-auto sm:max-w-[86rem] text-center py-12">
      {/* Section Heading */}
      <div className="max-w-[30rem] mx-auto">
        <h2
          style={{
            background: "linear-gradient(to right, #F1F1F1, #8B8B8B)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
          className=" sm:text-3xl text-[35px] font-bold">
          All the tools you need to save and earn in{" "}
          <span className="text-green-500">one place</span>
        </h2>
      </div>

      {/* Cards */}
      <div className="mt-8 grid grid-cols-1 lg:grid-cols-3  px-4 md:px-12 lg:px-24">
        {/* Spend and Save with Whisper */}
        <div className="flex flex-col items-center space-y-6 text-white border border-[#FFFFFF21] p-8 rounded-lg lg:col-span-2">
          <div className="flex justify-center mb-4">
            <MemoChrome className="w-12 h-12" />
          </div>
          <h3 className="text-xl font-semibold">Spend and save with Whisper</h3>
          <p className="mt-4 text-[#B5B5B5] max-w-[28rem]">
            Our easy-to-use browser extension, Whisper automatically locks in
            savings every time you make a transaction.
          </p>
          <Link to="/dashboard">
            <Button className="bg-[#3F3F3F99] rounded-[2rem] text-white hover:text-white border-gray-700 hover:bg-[#3F3F3F99]">
              Start saving
            </Button>
          </Link>
        </div>

        {/* Whisper Permissions */}
        <div className="bg-black border border-[#FFFFFF21] text-white p-8 rounded-lg">
          <img
            src="/assets/whisper-device.svg"
            alt="Whisper UI"
            className="w-full h-[40vh]"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2  px-4 md:px-12 lg:px-24">
        {/* Targeted Savings Plans */}
        <div className=" border border-[#FFFFFF21] text-white p-8 rounded-lg">
          <div className="flex justify-center mb-4">
            <MemoTarget className="w-16 h-16" />
          </div>
          <h3 className="text-xl font-semibold">Targeted savings plans</h3>
          <p className="mt-4 text-[#B5B5B5] max-w-[28rem] mx-auto mb-4">
            Whether it’s a dream vacation, a new gadget, or long-term wealth,
            Coinsafe helps you create personalized plans and stay on track to
            achieve them.
          </p>
          <Link to="/dashboard">
            <Button className="bg-[#3F3F3F99] rounded-[2rem] text-white hover:text-white border-gray-700 hover:bg-[#3F3F3F99]">
              Start saving
            </Button>
          </Link>
        </div>

        {/* Investment Options */}
        <div className=" border border-[#FFFFFF21] text-white p-8 rounded-lg">
          <div className="flex justify-center mb-4">
            <MemoInvestement className="w-16 h-16" />
          </div>
          <h3 className="text-xl font-semibold">Investment options</h3>
          <p className="mt-4 text-[#B5B5B5] max-w-[28rem] mx-auto mb-4">
            Choose from high-yield savings vaults and staking opportunities
            tailored to your risk level and goals.
          </p>
          <Link to="/dashboard">
            <Button className="bg-[#3F3F3F99] rounded-[2rem] text-white hover:text-white border-gray-700 hover:bg-[#3F3F3F99]">
              Start saving
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default SavingsTools;
