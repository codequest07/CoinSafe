import { Button } from "./ui/button";
import MemoTarget from "@/icons/Target";
import { Link } from "react-router-dom";
import chooseIcon from "@/icons/choose.svg";
import trackIcon from "@/icons/track.svg";
const SavingsTools = () => {
  return (
    <section className="sm:mx-auto sm:max-w-[86rem] text-center py-12">
      {/* Cards */}
      <div className="mt-8 grid grid-cols-1 lg:grid-cols-1  px-4 md:px-12 lg:px-24">
        {/* Choose how you save */}
        <div className="flex flex-col items-center space-y-6 text-white border border-[#FFFFFF21] pt-20 pb-20 p-8 rounded-lg lg:col-span-2">
          <div className="flex justify-center mb-0">
            <img
              src={chooseIcon}
              className="w-12 h-12"
              alt="Choose savings option"
            />
          </div>
          <h3 className="text-xl font-[500]">Choose how you save</h3>
          <p className="mt-4 text-[#B5B5B5] font-[400] text-sm max-w-[20rem]">
            Automate your savings so they happen in the background, or deposit
            manually when it suits you.
          </p>
          <Link to="https://app.coinsafe.network/">
            <Button className="bg-[#3F3F3F99] rounded-[2rem] text-white hover:text-white border-gray-700 hover:bg-[#3F3F3F99]">
              Start saving
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2  px-4 md:px-12 lg:px-24">
        {/* Targeted Savings Plans */}
        <div className=" border border-[#FFFFFF21] flex flex-col items-center space-y-6 pt-16 pb-16 text-white p-8 rounded-lg">
          <div className="flex justify-center mb-0">
            <MemoTarget className="w-12 h-12" />
          </div>
          <h3 className="text-xl font-[500]">Get smart recommendations</h3>
          <p className="mt-4 text-[#B5B5B5] max-w-[28rem] text-sm  mx-auto mb-4">
            Our AI looks at your past transactions and suggests personalized
            strategies that fit your habits, income, and spending patterns.
          </p>
          <Link to="https://app.coinsafe.network/">
            <Button className="bg-[#3F3F3F99] rounded-[2rem] text-white hover:text-white border-gray-700 hover:bg-[#3F3F3F99]">
              Start saving
            </Button>
          </Link>
        </div>

        {/* Stay on track Options */}
        <div className=" border border-[#FFFFFF21] flex flex-col items-center space-y-6 pt-16 pb-16 text-white p-8 rounded-lg">
          <div className="flex justify-center mb-0">
            <img
              src={trackIcon}
              className="w-12 h-12"
              alt="Choose savings option"
            />
          </div>
          <h3 className="text-xl font-[500]">Stay on track</h3>
          <p className="mt-4 text-[#B5B5B5] font-[400] max-w-[28rem] text-sm  mx-auto mb-4">
            Set goals, track progress, and adjust whenever life changes. Your
            savings, your pace.
          </p>
          <Link to="https://app.coinsafe.network/">
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
