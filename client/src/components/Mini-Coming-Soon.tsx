import { useNavigate } from "react-router-dom";
import MemoComingSoonIcon from "@/icons/ComingSoonIcon";
import { Button } from "./ui/button";

export default function MiniComingSoon() {
  const navigate = useNavigate();

  const handleGoBack = () => {
    navigate(-1);
  };

  return (
    <div className="h-fit dark:bg-[#000000]">
      <div className="flex h-[60vh]  w-full flex-col items-center py-10 gap-2">
        <MemoComingSoonIcon className="w-[40%] h-[50vh] text-white" />
        <h1 className="text-xl  sm:text-2xl font-bold my-2 text-white leading-tight">
          We’re in the kitchen!
        </h1>
        <p className="text-center sm:w-[43%] text-[14px] text-[#CACACA]">
          We’re in the kitchen, putting the final touches on this feature. We’ll
          let you know as soon as it’s ready! Continue saving for now.
        </p>
        <Button
          className="rounded-[2rem] my-2 py-5 px-6 bg-[#FFFFFF2B] font-[300] hover:bg-[#FFFFFF2B]"
          onClick={handleGoBack}>
          Continue saving
        </Button>
      </div>
    </div>
  );
}
