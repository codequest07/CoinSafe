import { Button } from "@/components/ui/button";
import MemoLogo from "@/icons/Logo";
import MemoShieldIcon from "@/icons/ShieldIcon";
import { useNavigate } from "react-router-dom";

const AllSet = () => {
  const navigate = useNavigate();
  return (
    <div>
      <div className="min-h-screen w-full flex flex-col justify-between items-center bg-gradient-to-br from-teal-900 via-gray-900 to-black text-white">
        {/* Logo and Title */}
        <div className="flex items-center absolute  justify-center mb-8 space-x-3">
          <MemoLogo className="w-28 h-16" />
          <div className="w-[2px] h-6 bg-[#FFFFFF17]" />
          <p className="text-xl font-semibold tracking-wide">Whisper</p>
        </div>
        {/* Main Content - Icon and Text */}
        <div className="flex flex-col items-center justify-center flex-grow space-y-6">
          {/* Shield Icon */}
          <MemoShieldIcon className="w-20 h-20 text-green-300" />

          {/* Title */}
          <h1 className="text-2xl font-semibold">You're all set!</h1>

          {/* Description */}
          <p className="text-center text-sm text-gray-300 px-4">
            We’re super proud of you for committing to your goal! Some text,
            some text, some text
          </p>
        </div>

        {/* Bottom Button */}
        <div className="w-full px-6 pb-10">
          <Button
            onClick={() => navigate("/approve")}
            variant="outline"
            className="w-full bg-white text-black font-semibold rounded-full py-3 hover:bg-gray-200">
            Start saving
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AllSet;
